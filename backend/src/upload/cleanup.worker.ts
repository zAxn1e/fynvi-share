import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import * as fs from "fs/promises";
import { PrismaService } from "../prisma/prisma.service";
import {
  LocalStorageProvider,
  TEMP_UPLOAD_DIRECTORY,
} from "./storage/local-storage.provider";

@Injectable()
export class CleanupWorker {
  private readonly logger = new Logger(CleanupWorker.name);

  constructor(
    private prisma: PrismaService,
    private storageProvider: LocalStorageProvider,
  ) {}

  @Cron("0 */30 * * * *")
  async handleScheduledCleanup() {
    this.logger.log(
      "Starting scheduled upload session cleanup & temp dir reconciliation...",
    );
    await this.runCleanup();
  }

  async runCleanup(): Promise<{
    cleanedSessions: number;
    removedOrphanDirs: number;
  }> {
    let cleanedSessions = 0;
    let removedOrphanDirs = 0;

    try {
      // 1. Identify stale/expired upload sessions
      const staleSessions = await this.prisma.uploadSession.findMany({
        where: {
          OR: [
            {
              expiresAt: { lt: new Date() },
              status: { in: ["PENDING", "UPLOADING", "PAUSED"] },
            },
            {
              status: {
                in: ["FAILED", "CANCELLED", "EXPIRED", "CLEANUP_PENDING"],
              },
            },
          ],
        },
      });

      for (const session of staleSessions) {
        // Idempotent temp directory removal
        await this.storageProvider.deleteSession(session.id);

        // Delete session record from DB
        await this.prisma.uploadSession
          .delete({ where: { id: session.id } })
          .catch(() => {});
        cleanedSessions++;
      }

      // 2. Temp Directory Reconciliation (Remove unindexed temp directories)
      try {
        const tempEntries = await fs.readdir(TEMP_UPLOAD_DIRECTORY, {
          withFileTypes: true,
        });
        for (const entry of tempEntries) {
          if (entry.isDirectory()) {
            const sessionId = entry.name;
            const sessionExists = await this.prisma.uploadSession.findUnique({
              where: { id: sessionId },
            });

            if (!sessionExists) {
              await this.storageProvider.deleteSession(sessionId);
              removedOrphanDirs++;
              this.logger.warn(
                `Removed unindexed orphaned temp dir: ${sessionId}`,
              );
            }
          }
        }
      } catch (e) {
        this.logger.debug(
          `Temp directory reconciliation skipped or unreadable: ${e}`,
        );
      }

      if (cleanedSessions > 0 || removedOrphanDirs > 0) {
        this.logger.log(
          `Cleanup completed: ${cleanedSessions} sessions purged, ${removedOrphanDirs} orphaned temp dirs removed.`,
        );
      }
    } catch (e) {
      this.logger.error("Error running upload session cleanup worker", e);
    }

    return { cleanedSessions, removedOrphanDirs };
  }
}

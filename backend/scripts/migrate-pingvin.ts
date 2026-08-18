import { PrismaClient } from "@prisma/client";
import * as crypto from "crypto";
import { existsSync } from "fs";
import * as fs from "fs/promises";
import * as path from "path";
import { resolveDatabaseUrl } from "../src/utils/database-url.util";

const DATA_DIR = process.env.DATA_DIRECTORY || "./data";
const DATABASE_URL = resolveDatabaseUrl({
  dataDirectory: DATA_DIR,
  explicitUrl: process.env.DATABASE_URL,
  exists: existsSync,
});
const DB_PATH = DATABASE_URL.replace(/^file:/, "").split("?")[0];
const SHARES_DIR = path.join(DATA_DIR, "uploads", "shares");
const TEMP_DIR = path.join(DATA_DIR, "temp", "uploads");

const prisma = new PrismaClient({
  datasources: { db: { url: DATABASE_URL } },
});

// Helper to generate human-friendly slugs (e.g. "quiet-cloud-thunder")
const ADJECTIVES = ["quiet", "swift", "calm", "bright", "silver", "golden", "silent", "ancient"];
const NOUNS = ["cloud", "thunder", "river", "forest", "mountain", "falcon", "breeze", "beacon"];

function generateSlug(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const hash = crypto.randomBytes(3).toString("hex");
  return `${adj}-${noun}-${hash}`;
}

async function main() {
  const args = process.argv.slice(2);
  const isApply = args.includes("--apply");
  const isReconcile = args.includes("--reconcile");
  const isConfirmCleanup = args.includes("--confirm-cleanup");
  const isDryRun = !isApply && !isReconcile && !isConfirmCleanup;

  console.log("==================================================");
  console.log("  Fynvi Share — Migration & Reconciliation CLI    ");
  console.log("==================================================");
  console.log(`Mode: ${isDryRun ? "DRY-RUN (Pass --apply or --reconcile to execute)" : "EXECUTION"}\n`);

  // 1. Create Timestamped Backup if applying changes
  if (isApply) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupPath = `${DB_PATH}.bak_${timestamp}`;
      await fs.copyFile(DB_PATH, backupPath);
      console.log(`[Backup] Timestamped DB backup created at: ${backupPath}`);
    } catch (e) {
      console.warn(`[Backup Warning] Unable to copy DB file: ${String(e)}`);
    }
  }

  // 2. Slug Backfill Audit & Application
  const sharesWithoutSlug = await prisma.share.findMany({
    where: { slug: null },
    select: { id: true, name: true },
  });

  console.log(`[Share Audit] Shares missing human-friendly slug: ${sharesWithoutSlug.length}`);

  if (sharesWithoutSlug.length > 0) {
    for (const share of sharesWithoutSlug) {
      let slug = generateSlug();
      // Ensure slug uniqueness
      let attempts = 0;
      while ((await prisma.share.findUnique({ where: { slug } })) && attempts < 10) {
        slug = generateSlug();
        attempts++;
      }

      if (isApply) {
        await prisma.share.update({
          where: { id: share.id },
          data: { slug },
        });
        console.log(`  -> Share ${share.id}: Assigned slug "${slug}"`);
      } else {
        console.log(`  [Dry-Run] Share ${share.id}: Would be assigned slug "${slug}"`);
      }
    }
  }

  // 3. Storage Reconciliation Audit
  if (isReconcile || isDryRun) {
    console.log("\n[Reconciliation Audit]");

    // Check Case A: Files in DB missing on Physical Disk
    const allFiles = await prisma.file.findMany({ select: { id: true, name: true, shareId: true } });
    let missingDiskFiles = 0;

    for (const file of allFiles) {
      const physicalPath = path.join(SHARES_DIR, file.shareId, file.id);
      try {
        await fs.access(physicalPath);
      } catch {
        missingDiskFiles++;
        console.warn(`  [Case A] DB File ${file.id} (${file.name}) in share ${file.shareId} missing on disk at ${physicalPath}`);
      }
    }
    console.log(`  -> Case A Summary: ${missingDiskFiles} DB files missing on physical disk.`);

    // Check Case B: Unindexed files on Physical Disk
    let unindexedPhysicalFiles = 0;
    try {
      const shareDirs = await fs.readdir(SHARES_DIR, { withFileTypes: true });
      for (const dirent of shareDirs) {
        if (dirent.isDirectory()) {
          const shareId = dirent.name;
          const filesInDir = await fs.readdir(path.join(SHARES_DIR, shareId));
          for (const fileName of filesInDir) {
            if (fileName.endsWith(".tmp-chunk") || fileName === "archive.zip") continue;
            const dbFile = await prisma.file.findUnique({ where: { id: fileName } });
            if (!dbFile) {
              unindexedPhysicalFiles++;
              console.warn(`  [Case B] Unindexed physical file on disk: ${path.join(SHARES_DIR, shareId, fileName)}`);
            }
          }
        }
      }
    } catch {}
    console.log(`  -> Case B Summary: ${unindexedPhysicalFiles} unindexed physical files found.`);
  }

  // 4. Stale Legacy Temp File Cleanup
  if (isConfirmCleanup) {
    console.log("\n[Cleanup Execution]");
    let deletedCount = 0;
    try {
      const shareDirs = await fs.readdir(SHARES_DIR, { withFileTypes: true });
      for (const dirent of shareDirs) {
        if (dirent.isDirectory()) {
          const shareId = dirent.name;
          const shareDirPath = path.join(SHARES_DIR, shareId);
          const files = await fs.readdir(shareDirPath);
          for (const file of files) {
            if (file.endsWith(".tmp-chunk")) {
              await fs.unlink(path.join(shareDirPath, file)).catch(() => {});
              deletedCount++;
            }
          }
        }
      }
    } catch {}
    console.log(`  -> Cleaned up ${deletedCount} legacy .tmp-chunk files.`);
  }

  console.log("\n==================================================");
  console.log("  Migration & Reconciliation Complete             ");
  console.log("==================================================");
}

main()
  .catch((e) => {
    console.error("Migration error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

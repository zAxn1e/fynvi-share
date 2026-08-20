import { Config } from "../../src/types/config.type";
import { MyShare, Share } from "../../src/types/share.type";
import User, { CurrentUser } from "../../src/types/user.type";
import { SystemInfo } from "../../src/services/system.service";
import { getDefaultConfig } from "../../src/utils/defaultConfig.util";

/**
 * Deterministic Mock Data Fixtures for Product Demo Screenshots & Video Generation
 */

export const mockCurrentUser: CurrentUser = {
  id: "usr_demo_admin_01",
  username: "Alex Rivera",
  email: "alex.rivera@fynvi.io",
  isAdmin: true,
  isActivated: true,
  isLdap: false,
  totpVerified: false,
  hasPassword: true,
  shareSizeLimit: "137438953472", // 128 GB
};

export const mockStandardUser: CurrentUser = {
  id: "usr_demo_member_02",
  username: "Sarah Chen",
  email: "sarah.chen@fynvi.io",
  isAdmin: false,
  isActivated: true,
  isLdap: false,
  totpVerified: false,
  hasPassword: true,
  shareSizeLimit: "53687091200", // 50 GB
};

export const mockSystemInfo: SystemInfo = {
  used: 45957070848, // 42.8 GB
  total: 137438953472, // 128 GB
};

export const mockConfigVariables: Config[] = [
  ...getDefaultConfig().map((cfg) => {
    if (cfg.key === "general.appName") return { ...cfg, value: "Fynvi Share" };
    if (cfg.key === "general.appUrl") return { ...cfg, value: "http://localhost:3000" };
    if (cfg.key === "appearance.themePrimaryColor") return { ...cfg, value: "victoria" };
    if (cfg.key === "share.allowRegistration") return { ...cfg, value: "true" };
    if (cfg.key === "share.allowUnauthenticatedShares") return { ...cfg, value: "false" };
    if (cfg.key === "share.maxSize") return { ...cfg, value: "107374182400" }; // 100 GB
    return cfg;
  }),
];

// Fixed reference dates (UTC 2026-08-20)
const fixedNow = new Date("2026-08-20T12:00:00.000Z");
const inDays = (d: number) => new Date(fixedNow.getTime() + d * 86400 * 1000);
const agoDays = (d: number) => new Date(fixedNow.getTime() - d * 86400 * 1000);

export const mockSharesList: MyShare[] = [
  {
    id: "demo-share-showcase",
    name: "Cinematic Production Assets 2026",
    description: "Master render exports, production stills, lossless soundtrack stem, and metadata package for the 2026 product release campaign.",
    size: 1845684656, // 1.84 GB
    views: 428,
    createdAt: agoDays(2),
    expiration: inDays(30),
    files: [
      { id: "f_vid_01", name: "4K_Cinematic_Showreel.mp4", size: "1424567296" },
      { id: "f_img_01", name: "Production_Still_01.jpg", size: "18454912" },
      { id: "f_aud_01", name: "Original_Soundtrack.mp3", size: "42120448" },
      { id: "f_zip_01", name: "Project_Metadata_Archive.zip", size: "360542000" },
    ],
    recipients: ["team@fynvi.io", "marketing@fynvi.io"],
    security: {
      passwordProtected: true,
      maxViews: 1000,
      restrictToRecipients: false,
    },
    creator: mockCurrentUser,
  },
  {
    id: "fynvi-brand-2026",
    name: "Fynvi Brand System & Design Guidelines",
    description: "High-resolution vector logos, typography specifications, UI component tokens, and icon libraries.",
    size: 92842000, // 88.5 MB
    views: 612,
    createdAt: agoDays(5),
    expiration: new Date(0), // Never expires
    files: [
      { id: "f_brand_01", name: "Brand_Guidelines_2026.pdf", size: "24600000" },
      { id: "f_brand_02", name: "Fynvi_Logos_Vector_Pack.zip", size: "34800000" },
      { id: "f_brand_03", name: "Design_Tokens.json", size: "442000" },
      { id: "f_brand_04", name: "Fynvi_Color_Swatches.ase", size: "33000000" },
    ],
    recipients: ["designers@fynvi.io"],
    security: {
      passwordProtected: false,
      maxViews: undefined,
      restrictToRecipients: false,
    },
    creator: mockCurrentUser,
  },
  {
    id: "q4-audit-docs",
    name: "Q4 Financial Audit & Infrastructure Reports",
    description: "Confidential SOC2 compliance report, cloud infrastructure cost analysis, and signed vendor disclosures.",
    size: 14890000, // 14.2 MB
    views: 89,
    createdAt: agoDays(1),
    expiration: inDays(5),
    files: [
      { id: "f_aud_01", name: "SOC2_Type_II_Report_2026.pdf", size: "8450000" },
      { id: "f_aud_02", name: "Cloud_Cost_Optimizations_Q4.xlsx", size: "6440000" },
    ],
    recipients: ["auditors@partner.com", "finance@fynvi.io"],
    security: {
      passwordProtected: true,
      maxViews: 150,
      restrictToRecipients: true,
    },
    creator: mockCurrentUser,
  },
  {
    id: "engine-v2-src",
    name: "Open Source Engine v2.4.0 Distribution",
    description: "Compiled binary artifacts and source archive for multi-architecture Linux/Darwin deployments.",
    size: 358744000, // 342.1 MB
    views: 1240,
    createdAt: agoDays(12),
    expiration: inDays(18),
    files: [
      { id: "f_eng_01", name: "fynvi-share-v2.4.0-linux-x64.tar.gz", size: "172000000" },
      { id: "f_eng_02", name: "fynvi-share-v2.4.0-darwin-arm64.tar.gz", size: "186744000" },
    ],
    recipients: [],
    security: {
      passwordProtected: false,
      maxViews: undefined,
      restrictToRecipients: false,
    },
    creator: mockCurrentUser,
  },
  {
    id: "broll-drone-4k",
    name: "Product Launch 4K Aerial B-Roll Footage",
    description: "ProRes 422 footage recorded at 60fps across three cinematic filming locations.",
    size: 4320000000, // 4.12 GB
    views: 315,
    createdAt: agoDays(3),
    expiration: new Date(0), // Never
    files: [
      { id: "f_br_01", name: "Drone_Sequence_Coastline_4K.mov", size: "2140000000" },
      { id: "f_br_02", name: "Drone_Sequence_Summit_4K.mov", size: "2180000000" },
    ],
    recipients: ["video-editors@fynvi.io"],
    security: {
      passwordProtected: true,
      maxViews: 500,
      restrictToRecipients: false,
    },
    creator: mockCurrentUser,
  },
  {
    id: "legacy-arch-v1",
    name: "Legacy Architecture Diagrams (v1.0 Archived)",
    description: "Historical database schema models and monolith network topologies.",
    size: 20760000, // 19.8 MB
    views: 45,
    createdAt: agoDays(45),
    expiration: agoDays(5), // Expired
    files: [
      { id: "f_leg_01", name: "Monolith_Network_Topology.png", size: "12400000" },
      { id: "f_leg_02", name: "Prisma_V1_Schema.sql", size: "8360000" },
    ],
    recipients: [],
    security: {
      passwordProtected: false,
      maxViews: 50,
      restrictToRecipients: false,
    },
    creator: mockCurrentUser,
  },
];

export const mockShareDetailShowcase: Share = {
  id: "demo-share-showcase",
  name: "Cinematic Production Assets 2026",
  description: "Master render exports, production stills, lossless soundtrack stem, and metadata package for the 2026 product release campaign.",
  size: 1845684656,
  expiration: inDays(30),
  hasPassword: true,
  creator: mockCurrentUser,
  files: [
    {
      id: "f_vid_01",
      name: "4K_Cinematic_Showreel.mp4",
      size: "1424567296",
      mimeType: "video/mp4",
      createdAt: agoDays(2),
    },
    {
      id: "f_img_01",
      name: "Production_Still_01.jpg",
      size: "18454912",
      mimeType: "image/jpeg",
      createdAt: agoDays(2),
    },
    {
      id: "f_aud_01",
      name: "Original_Soundtrack.mp3",
      size: "42120448",
      mimeType: "audio/mpeg",
      createdAt: agoDays(2),
    },
    {
      id: "f_zip_01",
      name: "Project_Metadata_Archive.zip",
      size: "360542000",
      mimeType: "application/zip",
      createdAt: agoDays(2),
    },
  ],
};

export const mockUsersList: User[] = [
  mockCurrentUser,
  mockStandardUser,
  {
    id: "usr_demo_03",
    username: "Marcus Vance",
    email: "marcus.vance@fynvi.io",
    isAdmin: false,
    isActivated: true,
    isLdap: false,
    totpVerified: true,
    hasPassword: true,
    shareSizeLimit: "26843545600", // 25 GB
  },
  {
    id: "usr_demo_04",
    username: "Elena Rostova",
    email: "elena.rostova@fynvi.io",
    isAdmin: true,
    isActivated: true,
    isLdap: true,
    totpVerified: false,
    hasPassword: true,
    shareSizeLimit: "107374182400", // 100 GB
  },
  {
    id: "usr_demo_05",
    username: "Liam Takahashi",
    email: "liam.t@fynvi.io",
    isAdmin: false,
    isActivated: true,
    isLdap: false,
    totpVerified: false,
    hasPassword: true,
    shareSizeLimit: "53687091200",
  },
  {
    id: "usr_demo_06",
    username: "Sophia Dupont",
    email: "sophia.dupont@fynvi.io",
    isAdmin: false,
    isActivated: true,
    isLdap: false,
    totpVerified: true,
    hasPassword: true,
    shareSizeLimit: "53687091200",
  },
  {
    id: "usr_demo_07",
    username: "David Kim",
    email: "david.kim@fynvi.io",
    isAdmin: false,
    isActivated: false,
    isLdap: false,
    totpVerified: false,
    hasPassword: true,
    shareSizeLimit: "26843545600",
  },
  {
    id: "usr_demo_08",
    username: "Amina Al-Mansoor",
    email: "amina.m@fynvi.io",
    isAdmin: false,
    isActivated: true,
    isLdap: true,
    totpVerified: true,
    hasPassword: true,
    shareSizeLimit: "107374182400",
  },
];

export function getMockAdminConfigs(categoryInput: string = "general"): any[] {
  const cat = categoryInput.toLowerCase().trim();
  return mockConfigVariables
    .filter((cfg) => cfg.key.toLowerCase().startsWith(cat))
    .map((cfg) => ({
      key: cfg.key,
      value: cfg.value,
      defaultValue: cfg.defaultValue,
      type: cfg.type,
      name: cfg.key.split(".").pop() || cfg.key,
      description: `Configuration parameter for ${cfg.key}`,
      allowEdit: true,
      secret: false,
      obscured: false,
      updatedAt: new Date("2026-08-20T12:00:00.000Z"),
    }));
}


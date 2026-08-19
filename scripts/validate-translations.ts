import fs from "fs";
import path from "path";

interface ValidationResult {
  errors: string[];
  warnings: string[];
}

const repoRoot = path.resolve(__dirname, "..");
const result: ValidationResult = {
  errors: [],
  warnings: [],
};

async function validateFrontend() {
  console.log("🔍 Validating Frontend Translations...");
  const translationsDir = path.join(repoRoot, "frontend/src/i18n/translations");

  if (!fs.existsSync(translationsDir)) {
    result.errors.push(`Frontend translations directory missing: ${translationsDir}`);
    return;
  }

  const enPath = path.join(translationsDir, "en-US.ts");
  if (!fs.existsSync(enPath)) {
    result.errors.push(`Frontend en-US source missing: ${enPath}`);
    return;
  }

  const enModule = (await import(enPath)).default;
  const enKeys = Object.keys(enModule);
  console.log(`  ✓ Found canonical en-US.ts with ${enKeys.length} keys.`);

  // Check for duplicate keys in en-US source text
  const enRawContent = fs.readFileSync(enPath, "utf8");
  const keyMatches = enRawContent.match(/^\s*"(.*?)":/gm);
  if (keyMatches) {
    const rawKeys = keyMatches.map((m) => m.replace(/^\s*"/, "").replace(/":$/, ""));
    const seen = new Set<string>();
    const dupes = new Set<string>();
    for (const k of rawKeys) {
      if (seen.has(k)) dupes.add(k);
      seen.add(k);
    }
    if (dupes.size > 0) {
      result.errors.push(`Duplicate keys in en-US.ts: ${Array.from(dupes).join(", ")}`);
    }
  }

  // Extract variables from en-US
  const enPlaceholders: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(enModule) as [string, string][]) {
    const vars = (value.match(/\{[^}]+\}/g) || []).map((v) =>
      v.replace(/[{}]/g, "").split(",")[0].trim()
    );
    if (vars.length > 0) {
      enPlaceholders[key] = vars;
    }
  }

  const files = fs.readdirSync(translationsDir).filter((f) => f.endsWith(".ts"));
  for (const file of files) {
    if (file === "en-US.ts") continue;
    const filePath = path.join(translationsDir, file);
    try {
      const locModule = (await import(filePath)).default;
      const locKeys = Object.keys(locModule);

      const missingInLocale = enKeys.filter((k) => !(k in locModule));
      if (missingInLocale.length > 0) {
        result.warnings.push(
          `[${file}] Missing ${missingInLocale.length} keys compared to en-US (e.g. ${missingInLocale.slice(0, 3).join(", ")})`
        );
      }

      // Check placeholder variable consistency
      for (const [key, expectedVars] of Object.entries(enPlaceholders)) {
        if (locModule[key]) {
          const locVars = (locModule[key].match(/\{[^}]+\}/g) || []).map((v: string) =>
            v.replace(/[{}]/g, "").split(",")[0].trim()
          );
          // ICU Plurals can introduce additional selectors like # but core variables must match
          const missingVars = expectedVars.filter(
            (ev) => !locVars.includes(ev) && !ev.startsWith("#") && !locModule[key].includes(`{${ev}`)
          );
          if (missingVars.length > 0) {
            result.warnings.push(
              `[${file}] Key "${key}" may be missing variable(s): ${missingVars.join(", ")}`
            );
          }
        }
      }
    } catch (e) {
      result.errors.push(`[${file}] Failed to parse translation file: ${String(e)}`);
    }
  }
}

async function validateBackend() {
  console.log("🔍 Validating Backend Translations...");
  const backendI18nDir = path.join(repoRoot, "backend/src/i18n");

  if (!fs.existsSync(backendI18nDir)) {
    result.errors.push(`Backend i18n directory missing: ${backendI18nDir}`);
    return;
  }

  const enDir = path.join(backendI18nDir, "en-US");
  if (!fs.existsSync(enDir)) {
    result.errors.push(`Backend en-US directory missing: ${enDir}`);
    return;
  }

  const enFiles = fs.readdirSync(enDir).filter((f) => f.endsWith(".json"));
  console.log(`  ✓ Found ${enFiles.length} namespaces in en-US: ${enFiles.join(", ")}`);

  const enDataByNs: Record<string, Record<string, string>> = {};
  for (const file of enFiles) {
    try {
      enDataByNs[file] = JSON.parse(fs.readFileSync(path.join(enDir, file), "utf8"));
    } catch (e) {
      result.errors.push(`[backend/en-US/${file}] Invalid JSON: ${String(e)}`);
    }
  }

  const locales = fs
    .readdirSync(backendI18nDir)
    .filter((f) => fs.statSync(path.join(backendI18nDir, f)).isDirectory());

  for (const locale of locales) {
    if (locale === "en-US") continue;
    const localeDir = path.join(backendI18nDir, locale);

    for (const file of enFiles) {
      const targetFile = path.join(localeDir, file);
      if (!fs.existsSync(targetFile)) {
        result.warnings.push(`[backend/${locale}] Missing namespace file: ${file}`);
        continue;
      }

      try {
        const locData = JSON.parse(fs.readFileSync(targetFile, "utf8"));
        const enData = enDataByNs[file] || {};

        const missingKeys = Object.keys(enData).filter((k) => !(k in locData));
        if (missingKeys.length > 0) {
          result.warnings.push(
            `[backend/${locale}/${file}] Missing ${missingKeys.length} keys: ${missingKeys.slice(0, 3).join(", ")}`
          );
        }
      } catch (e) {
        result.errors.push(`[backend/${locale}/${file}] Invalid JSON: ${String(e)}`);
      }
    }
  }
}

async function run() {
  console.log("==================================================");
  console.log("   Fynvi Share — Translation Validation Runner   ");
  console.log("==================================================\n");

  await validateFrontend();
  await validateBackend();

  console.log("\n==================================================");
  console.log("   Validation Summary");
  console.log("==================================================");

  if (result.warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${result.warnings.length}):`);
    for (const w of result.warnings.slice(0, 20)) {
      console.log(`  - ${w}`);
    }
    if (result.warnings.length > 20) {
      console.log(`  ... and ${result.warnings.length - 20} more warnings.`);
    }
  }

  if (result.errors.length > 0) {
    console.log(`\n❌ Errors (${result.errors.length}):`);
    for (const e of result.errors) {
      console.log(`  - ${e}`);
    }
    console.log("\n💥 Validation FAILED with errors.\n");
    process.exit(1);
  } else {
    console.log("\n✅ Validation PASSED with 0 fatal errors.\n");
    process.exit(0);
  }
}

run().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});

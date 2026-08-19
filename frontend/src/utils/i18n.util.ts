import { setCookie } from "cookies-next";
import { LOCALES, Locale } from "../i18n/locales";

const getLocaleByCode = (code?: string): Locale => {
  if (!code) return LOCALES.ENGLISH;
  const cleanCode = code.trim().toLowerCase();

  // 1. Exact match (case-insensitive)
  const exact = Object.values(LOCALES).find(
    (l) => l.code.toLowerCase() === cleanCode,
  );
  if (exact) return exact;

  // 2. Base match (e.g. "th" -> "th-TH", "de" -> "de-DE", "zh" -> "zh-CN", "pt" -> "pt-BR")
  const baseCode = cleanCode.split("-")[0].split("_")[0];
  const prefixMatch = Object.values(LOCALES).find(
    (l) =>
      l.code.toLowerCase().startsWith(baseCode) ||
      l.code.toLowerCase().split("-")[0] === baseCode,
  );
  if (prefixMatch) return prefixMatch;

  return LOCALES.ENGLISH;
};

// Parse the Accept-Language header and return the first supported language code
const getLanguageFromAcceptHeader = (acceptLanguage?: string): string => {
  if (!acceptLanguage) return "en-US";

  const languages = acceptLanguage
    .split(",")
    .map((l) => l.split(";")[0].trim());

  for (const language of languages) {
    const matched = getLocaleByCode(language);
    if (matched && matched.code !== LOCALES.ENGLISH.code) {
      return matched.code;
    }
  }
  return "en-US";
};

const isLanguageSupported = (code: string) => {
  if (!code) return false;
  const clean = code.trim().toLowerCase();
  return Object.values(LOCALES).some(
    (l) =>
      l.code.toLowerCase() === clean ||
      l.code.toLowerCase().split("-")[0] === clean.split("-")[0],
  );
};

const setLanguageCookie = (code: string) => {
  setCookie("language", code, {
    sameSite: "lax",
    expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
  });
};

export default {
  getLocaleByCode,
  getLanguageFromAcceptHeader,
  isLanguageSupported,
  setLanguageCookie,
};

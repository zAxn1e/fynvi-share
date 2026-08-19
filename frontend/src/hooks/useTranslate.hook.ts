import { getCookie } from "cookies-next";
import { createIntl, createIntlCache, useIntl } from "react-intl";
import { LOCALES } from "../i18n/locales";
import i18nUtil from "../utils/i18n.util";

const englishFallback = LOCALES.ENGLISH.messages as Record<string, string>;

const KEY_ALIASES: Record<string, string[]> = {
  "signup.input.password": [
    "signin.input.password",
    "resetPassword.input.password",
  ],
  "signup.input.password.placeholder": ["signin.input.password.placeholder"],
  "signin.button.signin": [
    "signin.button.submit",
    "common.button.signIn",
    "navbar.signin",
  ],
  "signin.button.forgot-password": ["resetPassword.title"],
  "common.cancel": ["common.button.cancel"],
  "common.save": ["common.button.save"],
  "common.delete": ["common.button.delete"],
  "auth.login.title": ["signin.title", "navbar.signin"],
  "signup.button.submit": ["signup.button.signin", "common.button.signUp"],
};

export const findMessage = (
  id: string,
  messages?: Record<string, any>,
): string | undefined => {
  if (!messages) return undefined;
  if (typeof messages[id] === "string" && messages[id].length > 0) {
    return messages[id];
  }

  // Check aliases
  const aliases = KEY_ALIASES[id];
  if (aliases) {
    for (const alias of aliases) {
      if (typeof messages[alias] === "string" && messages[alias].length > 0) {
        return messages[alias];
      }
    }
  }

  // Check case variations for oauth providers
  if (id.startsWith("signin.oauth.")) {
    const provider = id.replace("signin.oauth.", "");
    const camel = `signIn.oauth.${provider}`;
    if (typeof messages[camel] === "string" && messages[camel].length > 0) {
      return messages[camel];
    }
  } else if (id.startsWith("signIn.oauth.")) {
    const provider = id.replace("signIn.oauth.", "");
    const lower = `signin.oauth.${provider}`;
    if (typeof messages[lower] === "string" && messages[lower].length > 0) {
      return messages[lower];
    }
  }

  return undefined;
};

export const humanizeKey = (id: string): string => {
  const parts = id.split(".");
  const last = parts[parts.length - 1] || id;
  return last
    .replace(/[-_]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^\w/, (c) => c.toUpperCase());
};

const useTranslate = () => {
  const intl = useIntl();

  return (
    id: string,
    values?: Parameters<typeof intl.formatMessage>[1],
    defaultMessage?: string,
  ) => {
    const currentMsg = findMessage(
      id,
      intl?.messages as Record<string, string>,
    );
    const enMsg = findMessage(id, englishFallback);

    const fallbackText =
      defaultMessage !== undefined
        ? defaultMessage
        : currentMsg || enMsg || (id.includes(".") ? humanizeKey(id) : id);

    if (!intl || !intl.formatMessage) {
      return fallbackText;
    }

    try {
      const result = intl.formatMessage(
        { id, defaultMessage: fallbackText },
        values,
      );
      return typeof result === "string" ? result : String(result);
    } catch {
      return fallbackText;
    }
  };
};

const cache = createIntlCache();

export const translateOutsideContext = () => {
  const cookieLanguage = getCookie("language")?.toString();
  const localeCode =
    cookieLanguage ||
    (typeof navigator !== "undefined" ? navigator.language : "en-US");

  const currentLocale = i18nUtil.getLocaleByCode(localeCode);
  const messages = {
    ...LOCALES.ENGLISH.messages,
    ...(currentLocale?.messages || {}),
  };

  const intl = createIntl(
    {
      locale: currentLocale.code,
      messages,
      defaultLocale: LOCALES.ENGLISH.code,
    },
    cache,
  );

  return (
    id: string,
    values?: Parameters<typeof intl.formatMessage>[1],
    defaultMessage?: string,
  ) => {
    const currentMsg = findMessage(id, messages);
    const enMsg = findMessage(id, englishFallback);

    const fallbackText =
      defaultMessage !== undefined
        ? defaultMessage
        : currentMsg || enMsg || (id.includes(".") ? humanizeKey(id) : id);

    try {
      const result = intl.formatMessage(
        { id, defaultMessage: fallbackText },
        values,
      );
      return typeof result === "string" ? result : String(result);
    } catch {
      return fallbackText;
    }
  };
};

export default useTranslate;

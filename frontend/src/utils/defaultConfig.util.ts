import Config from "../types/config.type";

export function getDefaultConfig(): Config[] {
  return [
    // General
    {
      key: "general.appName",
      value: "Fynvi Share",
      defaultValue: "Fynvi Share",
      type: "string",
    },
    {
      key: "general.appUrl",
      value: "http://localhost:3000",
      defaultValue: "http://localhost:3000",
      type: "string",
    },
    {
      key: "general.showHomePage",
      value: "true",
      defaultValue: "true",
      type: "boolean",
    },
    {
      key: "general.sessionDuration",
      value: "3 months",
      defaultValue: "3 months",
      type: "timespan",
    },
    {
      key: "general.defaultLanguage",
      value: "en-US",
      defaultValue: "en-US",
      type: "string",
    },

    // Appearance
    {
      key: "appearance.themePrimaryColor",
      value: "victoria",
      defaultValue: "victoria",
      type: "string",
    },
    {
      key: "appearance.themePrimaryColorOverride",
      value: "",
      defaultValue: "",
      type: "string",
    },
    {
      key: "appearance.themeRadius",
      value: "sm",
      defaultValue: "sm",
      type: "string",
    },
    {
      key: "appearance.themeColorScheme",
      value: "system",
      defaultValue: "system",
      type: "string",
    },
    {
      key: "appearance.customCss",
      value: "",
      defaultValue: "",
      type: "text",
    },
    {
      key: "appearance.uploadProgressStyle",
      value: "circle",
      defaultValue: "circle",
      type: "string",
    },

    // Share
    {
      key: "share.allowRegistration",
      value: "true",
      defaultValue: "true",
      type: "boolean",
    },
    {
      key: "share.allowUnauthenticatedShares",
      value: "false",
      defaultValue: "false",
      type: "boolean",
    },
    {
      key: "share.maxExpiration",
      value: "0 days",
      defaultValue: "0 days",
      type: "timespan",
    },
    {
      key: "share.defaultExpiration",
      value: "7 days",
      defaultValue: "7 days",
      type: "timespan",
    },
    {
      key: "share.shareIdLength",
      value: "8",
      defaultValue: "8",
      type: "number",
    },
    {
      key: "share.maxSize",
      value: "1000000000",
      defaultValue: "1000000000",
      type: "filesize",
    },
    {
      key: "share.chunkSize",
      value: "10000000",
      defaultValue: "10000000",
      type: "filesize",
    },
    {
      key: "share.autoOpenShareModal",
      value: "false",
      defaultValue: "false",
      type: "boolean",
    },
    {
      key: "share.reverseShareSimpleOnly",
      value: "false",
      defaultValue: "false",
      type: "boolean",
    },
    {
      key: "share.allowAdminAccessAllShares",
      value: "false",
      defaultValue: "false",
      type: "boolean",
    },
    {
      key: "share.enableUserRecipients",
      value: "false",
      defaultValue: "false",
      type: "boolean",
    },

    // Email / SMTP
    {
      key: "smtp.enabled",
      value: "false",
      defaultValue: "false",
      type: "boolean",
    },
    {
      key: "email.enableShareEmailRecipients",
      value: "false",
      defaultValue: "false",
      type: "boolean",
    },
    {
      key: "email.sendHtmlEmails",
      value: "false",
      defaultValue: "false",
      type: "boolean",
    },

    // Legal
    {
      key: "legal.enabled",
      value: "false",
      defaultValue: "false",
      type: "boolean",
    },
    { key: "legal.imprintText", value: "", defaultValue: "", type: "text" },
    { key: "legal.imprintUrl", value: "", defaultValue: "", type: "string" },
    {
      key: "legal.privacyPolicyText",
      value: "",
      defaultValue: "",
      type: "text",
    },
    {
      key: "legal.privacyPolicyUrl",
      value: "",
      defaultValue: "",
      type: "string",
    },
  ];
}

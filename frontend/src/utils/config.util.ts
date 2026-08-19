import Config from "../types/config.type";
import { stringToTimespan } from "./date.util";
import { getDefaultConfig } from "./defaultConfig.util";

export const getConfigValue = (
  key: string,
  configVariables: Config[],
  returnDefault: boolean = false,
): any => {
  const vars =
    configVariables && configVariables.length > 0
      ? configVariables
      : getDefaultConfig();

  let configVariable = vars.find((variable) => variable.key === key);

  if (!configVariable) {
    configVariable = getDefaultConfig().find(
      (variable) => variable.key === key,
    );
  }

  if (!configVariable) {
    return null;
  }

  const value = returnDefault
    ? configVariable.defaultValue
    : (configVariable.value ?? configVariable.defaultValue);

  if (configVariable.type === "number" || configVariable.type === "filesize")
    return parseInt(value || "0");
  if (configVariable.type === "boolean") return value === "true";
  if (configVariable.type === "string" || configVariable.type === "text")
    return value ?? "";
  if (configVariable.type === "timespan")
    return stringToTimespan(value || "0 days");

  return value;
};

import axios from "axios";
import Config, { AdminConfig, UpdateConfig } from "../types/config.type";
import api from "./api.service";
import { stringToTimespan } from "../utils/date.util";
import { getDefaultConfig } from "../utils/defaultConfig.util";

import { getConfigValue } from "../utils/config.util";

const categories = [
  "general",
  "appearance",
  "email",
  "share",
  "smtp",
  "oauth",
  "ldap",
  "s3",
  "legal",
  "cache",
];

const list = async (): Promise<Config[]> => {
  return (await api.get("/configs")).data;
};

const getByCategory = async (categoryInput: string): Promise<AdminConfig[]> => {
  let category: string;
  if (categories.indexOf(categoryInput.trim()) === -1) {
    category = "general";
  } else {
    category = categoryInput.trim();
  }

  return (await api.get(`/configs/admin/${category}`)).data;
};

const updateMany = async (data: UpdateConfig[]): Promise<AdminConfig[]> => {
  return (await api.patch("/configs/admin", data)).data;
};

const get = getConfigValue;

const finishSetup = async (): Promise<AdminConfig[]> => {
  return (await api.post("/configs/admin/finishSetup")).data;
};

const sendTestEmail = async (email: string) => {
  await api.post("/configs/admin/testEmail", { email });
};

const testRedisConnection = async () => {
  return (await api.post("/configs/admin/testRedis")).data as {
    ok: boolean;
    enabled: boolean;
  };
};

const isNewReleaseAvailable = async () => {
  try {
    const response = (
      await axios.get(
        "https://api.github.com/repos/zAxn1e/fynvi-share/releases/latest",
      )
    ).data;
    return response.tag_name.replace("v", "") != process.env.VERSION;
  } catch {
    return false;
  }
};

const changeLogo = async (file: File) => {
  const form = new FormData();
  form.append("file", file);

  await api.post("/configs/admin/logo", form);
};

const changeDarkLogo = async (file: File) => {
  const form = new FormData();
  form.append("file", file);

  await api.post("/configs/admin/logoDark", form);
};
export default {
  list,
  getByCategory,
  updateMany,
  get,
  finishSetup,
  sendTestEmail,
  testRedisConnection,
  isNewReleaseAvailable,
  changeLogo,
  changeDarkLogo,
};

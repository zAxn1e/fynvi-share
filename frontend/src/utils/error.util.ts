export function getApiErrorMessage(error: any): string {
  if (!error) return "An unexpected error occurred.";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;

  const data = error?.response?.data;
  if (data) {
    if (typeof data === "string") return data;
    if (typeof data.message === "string" && data.message.trim().length > 0)
      return data.message;
    if (Array.isArray(data.message)) {
      const joined = data.message.filter(Boolean).join("\n");
      if (joined.trim().length > 0) return joined;
    }
    if (typeof data.error === "string" && data.error.trim().length > 0)
      return data.error;
    try {
      return JSON.stringify(data);
    } catch {
      // ignore
    }
  }

  if (typeof error?.message === "string" && error.message.trim().length > 0) {
    return error.message;
  }

  try {
    return typeof error === "object" ? JSON.stringify(error) : String(error);
  } catch {
    return "An unexpected error occurred.";
  }
}

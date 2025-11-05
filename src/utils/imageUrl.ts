import { getSignedS3Url } from "./s3Client";

export const resolveImageUrl = async (rawPath?: string | null): Promise<string | null> => {
  if (!rawPath) {
    return null;
  }

  const normalized = rawPath.trim();

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized;
  }

  if (normalized.startsWith("images/") && process.env.APP_URL) {
    return `${process.env.APP_URL}${normalized}`;
  }

  return await getSignedS3Url(normalized);
};

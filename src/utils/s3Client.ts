import {
  DeleteObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

interface S3Config {
  bucket: string;
  region: string;
}

let cachedClient: S3Client | null = null;

const ensureConfig = (): S3Config => {
  const bucket = process.env.AWS_S3_BUCKET;
  const region = process.env.AWS_S3_REGION;

  if (!bucket) {
    throw new Error("Missing AWS_S3_BUCKET environment variable.");
  }

  if (!region) {
    throw new Error("Missing AWS_S3_REGION environment variable.");
  }

  return { bucket, region };
};

const getClient = (): S3Client => {
  if (cachedClient) {
    return cachedClient;
  }

  const region = process.env.AWS_S3_REGION;
  const accessKeyId = process.env.AWS_POLICY_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_POLICY_SECRET_ACCESS_KEY;

  if (!region) {
    throw new Error("Missing AWS_S3_REGION environment variable.");
  }

  if (!accessKeyId) {
    throw new Error("Missing AWS_POLICY_ACCESS_KEY_ID environment variable.");
  }

  if (!secretAccessKey) {
    throw new Error("Missing AWS_POLICY_SECRET_ACCESS_KEY environment variable.");
  }

  cachedClient = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return cachedClient;
};

interface UploadBufferOptions {
  buffer: Buffer;
  key: string;
  contentType?: string;
}

export const uploadBufferToS3 = async (options: UploadBufferOptions) => {
  const { buffer, key, contentType } = options;
  const { bucket } = ensureConfig();
  const client = getClient();

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await client.send(command);

  return {
    key,
    url: getS3PublicUrl(key),
  };
};

export const deleteObjectsFromS3 = async (keys: string[]) => {
  if (keys.length === 0) {
    return;
  }

  const { bucket } = ensureConfig();
  const client = getClient();

  const command = new DeleteObjectsCommand({
    Bucket: bucket,
    Delete: {
      Objects: keys.map((key) => ({ Key: key })),
      Quiet: true,
    },
  });

  await client.send(command);
};

export const getS3PublicUrl = (key: string) => {
  const { bucket, region } = ensureConfig();
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
};

const resolveSignedUrlTtl = () => {
  const raw = process.env.AWS_S3_SIGNED_URL_TTL;
  if (!raw) {
    return 3600;
  }

  const ttl = Number(raw);
  if (Number.isNaN(ttl) || ttl <= 0) {
    throw new Error("AWS_S3_SIGNED_URL_TTL must be a positive number.");
  }

  return ttl;
};

export const getSignedS3Url = async (key: string, expiresInSeconds?: number) => {
  const { bucket } = ensureConfig();
  const client = getClient();
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const expiresIn = expiresInSeconds ?? resolveSignedUrlTtl();

  return await getSignedUrl(client, command, { expiresIn });
};

// Server-only. Cloudflare R2 via its S3-compatible API.
import {
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

function env(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name} (set it in .env.local locally, or in the Vercel project settings)`);
  return v;
}

let client: S3Client | undefined;
function s3() {
  return (client ??= new S3Client({
    region: "auto",
    endpoint: `https://${env("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: env("R2_ACCESS_KEY_ID"), secretAccessKey: env("R2_SECRET_ACCESS_KEY") },
  }));
}

export const publicUrl = (key: string) => `${env("R2_PUBLIC_URL")}/${key}`;

export async function upload(key: string, file: File) {
  await s3().send(
    new PutObjectCommand({
      Bucket: env("R2_BUCKET"),
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type || undefined,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return publicUrl(key);
}

export async function listKeys(prefix: string) {
  const keys: string[] = [];
  let token: string | undefined;
  do {
    const res = await s3().send(new ListObjectsV2Command({ Bucket: env("R2_BUCKET"), Prefix: prefix, ContinuationToken: token }));
    for (const o of res.Contents ?? []) if (o.Key) keys.push(o.Key);
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);
  return keys;
}

export async function deleteKeys(keys: string[]) {
  if (keys.length === 0) return;
  await s3().send(new DeleteObjectsCommand({ Bucket: env("R2_BUCKET"), Delete: { Objects: keys.map((Key) => ({ Key })) } }));
}

export async function getText(key: string): Promise<string | null> {
  try {
    const res = await s3().send(new GetObjectCommand({ Bucket: env("R2_BUCKET"), Key: key }));
    return (await res.Body?.transformToString()) ?? null;
  } catch (e) {
    if ((e as { name?: string }).name === "NoSuchKey") return null;
    throw e;
  }
}

export async function putText(key: string, body: string, contentType = "application/json") {
  await s3().send(
    new PutObjectCommand({ Bucket: env("R2_BUCKET"), Key: key, Body: body, ContentType: contentType, CacheControl: "no-store" }),
  );
}

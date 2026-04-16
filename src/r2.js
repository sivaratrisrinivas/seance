import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// S3 client for UPLOADING files to R2
const s3 = new S3Client({
  region: "auto",
  endpoint: "https://5b1f07edf7fb1654ff9868eec754271d.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = "seance-audio";
const PUBLIC_URL = "https://pub-4d678025db5a4c0287d966ae08a5ae5c.r2.dev";

// Upload a file and return its public URL
export async function uploadToR2(key, body, contentType) {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return `${PUBLIC_URL}/${key}`;
}

export { s3, BUCKET, PUBLIC_URL };

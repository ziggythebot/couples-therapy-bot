const required = (key: string): string => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
};

export const config = {
  port: Number(process.env.PORT ?? 3001),
  livekit: {
    url: required("LIVEKIT_URL"),
    apiKey: required("LIVEKIT_API_KEY"),
    apiSecret: required("LIVEKIT_API_SECRET"),
  },
  sessionTokenTtlSeconds: Number(process.env.SESSION_TOKEN_TTL_SECONDS ?? 3600),
  // Optional S3 — recording is skipped if bucket is not set
  s3: {
    bucket: process.env.S3_BUCKET ?? "",
    region: process.env.S3_REGION ?? "us-east-1",
    accessKey: process.env.S3_ACCESS_KEY ?? "",
    secretKey: process.env.S3_SECRET_KEY ?? "",
  },
};

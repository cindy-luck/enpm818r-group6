import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 8082,
  aws: {
    region: process.env.AWS_REGION || "us-east-1",
    bucketName: process.env.S3_BUCKET_NAME || "",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
};

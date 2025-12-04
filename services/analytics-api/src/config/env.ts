import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 8083, // Different port locally
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
};

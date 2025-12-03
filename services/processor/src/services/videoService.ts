import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { s3Client } from "../config/s3";
import { config } from "../config/env";
import { query } from "../config/db";
import { Readable } from "stream";

export const processVideo = async (
  videoId: string,
  s3Key: string,
  bucket: string
) => {
  console.log(`Processing video: ${videoId}`);

  const tempInputPath = path.resolve(`temp_in_${videoId}.mp4`);
  const tempOutputPath = path.resolve(`temp_out_${videoId}.png`);

  try {
    // 1. Download Video from S3
    const getCmd = new GetObjectCommand({ Bucket: bucket, Key: s3Key });
    const s3Response = await s3Client.send(getCmd);

    // Stream S3 body to local file
    const writeStream = fs.createWriteStream(tempInputPath);
    if (s3Response.Body instanceof Readable) {
      s3Response.Body.pipe(writeStream);
    } else {
      throw new Error("S3 Body is not a stream");
    }

    await new Promise((resolve, reject) => {
      writeStream.on("finish", () => resolve(undefined));
      writeStream.on("error", reject);
    });

    // 2. Generate Thumbnail
    await new Promise<void>((resolve, reject) => {
      ffmpeg(tempInputPath)
        .screenshots({
          count: 1,
          folder: path.dirname(tempOutputPath),
          filename: path.basename(tempOutputPath),
          size: "320x240", // Thumbnail size
        })
        .on("end", () => resolve())
        .on("error", (err) => reject(err));
    });

    // 3. Upload Thumbnail to S3
    const thumbnailKey = `thumbnails/${videoId}.png`;
    const fileStream = fs.createReadStream(tempOutputPath);

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucket,
        Key: thumbnailKey,
        Body: fileStream,
        ContentType: "image/png",
      },
    });

    await upload.done();

    // 4. Update Database
    await query(
      "UPDATE videos SET s3_key_thumbnail = $1, status = $2 WHERE id = $3",
      [thumbnailKey, "COMPLETED", videoId]
    );

    console.log(`Successfully processed video ${videoId}`);
  } catch (error) {
    console.error(`Error processing video ${videoId}:`, error);
    await query("UPDATE videos SET status = $1 WHERE id = $2", [
      "FAILED",
      videoId,
    ]);
  } finally {
    // 5. Cleanup Temp Files
    if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
    if (fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);
  }
};

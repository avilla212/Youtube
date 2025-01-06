import { Storage } from "@google-cloud/storage";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";

// GCS instance
const storage = new Storage();

const rawVideoBucketName = "avilla-raw-videos";
const processedVideoBucketName = "avilla-processed-videos";

const localRawVideoPath = "./raw-videos";
const localProcessedVideoPath = "./processed-videos";

/**
 * Creates the local directories for raw and processed videos
 */
export function setupDirectories() {
  ensureDirectoryExistence(localRawVideoPath);
  ensureDirectoryExistence(localProcessedVideoPath);
}

/**
 * @param rawVideoName - The name of the file to convert from (@link localRawVideoPath)
 * @param processedVideoName - The name of the file to convert to (@link localProcessedVideoPath)
 * @returns A promise that resolves when the video is converted
 */
export function convertVideo(rawVideoName: string, processedVideoName: string) {
  return new Promise<void>((resolve, reject) => {
    ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
      .outputOptions("-vf", "scale=-1:360") // 360p
      .on("end", function () {
        console.log("Processing finished successfully");
        resolve();
      })
      .on("error", function (err: any) {
        console.log("An error occurred: " + err.message);
        reject(err);
      })
      .save(`${localProcessedVideoPath}/${processedVideoName}`);
  });
}

/**
 * @param fileName - The name of the file to download from the
 * (@link rawVideoBucketName) bucket into the (@link localRawVideoPath) directory
 * @returns A promise that resolves when the video is downloaded
 */
export async function downloadRawVideo(fileName: string) {
  await storage.bucket(rawVideoBucketName)
    .file(fileName)
    .download({
      destination: `${localRawVideoPath}/${fileName}`,
    });

  console.log(
    `gs://${rawVideoBucketName}/${fileName} downloaded to 
    // ${localRawVideoPath}/${fileName}`
  );
}

/**
 * @param fileName - the name of the file to upload from the
 * (@link localProcessedVideoPath) directory to the (@link processedVideoBucketName) bucket
 * @returns A promise that resolves when the video is uploaded
 */

export async function uploadProcessedVideo(fileName: string) {
  // Upload the video to the bucket
  const bucket = storage.bucket(processedVideoBucketName);

  // await because we need to wait for the upload to finish
  await storage.bucket(processedVideoBucketName)
    .upload(`${localProcessedVideoPath}/${fileName}`, {
      destination: fileName,
    });

  console.log(
    `${localProcessedVideoPath}/${fileName} uploaded to 
        gs://${processedVideoBucketName}/${fileName}`
  );

  // await because we need to wait for the file to be made public before we can access it
  await bucket.file(fileName).makePublic();
}

/**
 * @param fileName - The name of the file to delete from the (@link rawVideoBucketName) bucket
 * @returns A promise that resolves when the video is deleted
 */
export function deleteRawVideo(fileName: string) {
  return deleteFile(`${localRawVideoPath}/${fileName}`);
}

/**
 * @param fileName - The name of the file to delete form the
 * (@link localProcessedVideoPath) directory
 * @returns A promise that resolves when the video is deleted
 */
export function deleteProcessedVideo(fileName: string) {
  return deleteFile(`${localProcessedVideoPath}/${fileName}`);
}

/**
 * @param filePath - The path of the file to delete
 * @returns A promise that resolves when the file is deleted
 */

function deleteFile(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Failed to delete file at ${filePath}`, err);
          reject(err);
        } else {
          console.log(`File deleted at ${filePath}`);
          resolve();
        }
      });
    } else {
      console.log(`File not found at ${filePath}, skipping delete.`);
      resolve();
    }
  });
}

/**
 * Ensures a directory exists 
 * @param (string) directoryPath - The path of the directory to ensure exists
*/
function ensureDirectoryExistence(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true }); // recursice: true enables creating nested directories
    }
    console.log(`Directory created at ${dirPath}`);
}

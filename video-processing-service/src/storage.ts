

import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import e from 'express';
import { resolve } from 'path';

// create instance of google cloud storage
const storage = new Storage();

// bucket names have to be globally unique
const rawVideoBucketName = 'a-villa-raw-videos';
const processedVideoBucketName = 'a-villa-processed-videos';

// local paths
const localRawVideoPath = './raw-videos';
const localProcessedVideoPath = './processed-videos';

/*
    setupDirectorries to create local directories in the docker container for the raw and processed videos
*/
export function setupDirectories(){
    ensureDirectoryExists(localRawVideoPath);
    ensureDirectoryExists(localProcessedVideoPath);
}

/*
    * @param rawVideoName: string - name of the file to convert from @link localRawVideoPath
    * @param processedVideoName: string - name of the file to convert to @link localProcessedVideoPath
    * @returns A promise that resolves to the path of the processed video
*/
export function convertVideo(rawVideoName: string, processedVideoName: string) : Promise<void>{
    return new Promise((resolve: any, reject: any) => {
        ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
        .outputOptions("-vf", "scale=-1:360") // convert to 360p
        .on("end", function () {
            console.log("Processing finished !");
            resolve();
        })
        .on("error", function (err: any) {
            console.log(`Error processing video: ${err.message}`);
            reject(err);
        })
        .save(`${localProcessedVideoPath}/${processedVideoName}`);
    });
}

/*
* @param fileName: string - name of the file to upload to the bucket
* @link localProcessedVideoPath -> @link processedVideoBucketName   
* @returns A promise that resolves to the path of the uploaded video
*/
export async function downloadRawVideo(fileName: string) {
    // awwait will block any code after this line until it is completed
    await storage.bucket(rawVideoBucketName)
        .file(fileName)
        .download({
            destination: `${localRawVideoPath}/${fileName}`
        })
    console.log(`gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}`);
}


/**
 * @param fileName - The name of the file to upload from the 
 * {@link localProcessedVideoPath} folder into the {@link processedVideoBucketName}.
 * @returns A promise that resolves when the file has been uploaded.
 */

export async function uploadProcessedVideo(fileName: string) {
    // Declared bucket since we are going to use it multiple times
    const bucket = storage.bucket(processedVideoBucketName);

    // Upload the file
    await bucket.upload(`${localProcessedVideoPath}/${fileName}`, {
        destination: fileName
    });

    // Make the file public since we are sharing videos
    await bucket.file(fileName).makePublic();

    console.log(`gs://${processedVideoBucketName}/${fileName} uploaded to ${localProcessedVideoPath}/${fileName}`);
}

/**
 * 
 * @param fileName - The name of the file to delete from the 
 * {@link localProcessedVideoPath} folder.
 * @returns A promise that resolves when the file has been deleted.
 */
export function deleteProcessedVideo(fileName: string) : Promise<void> {
    return deleteRawVideo(`${localProcessedVideoPath}/${fileName}`);
}

/**
 * @param fileName - The name of the file to delete from the
 * {@link localRawVideoPath} folder.
 * @returns A promise that resolves when the file has been deleted.
 * 
 */

export function deleteRawVideo(filePath: string) : Promise<void> {
    return new Promise((resolve: any, reject: any) => {
        if (fs.existsSync(filePath)){
            fs.unlink(filePath, (err: any) => {
                if (err){
                    console.log(`Error deleting file: ${err.message}`);
                    reject(err);
                } else {
                    console.log(`Deleted file: ${filePath}`);
                    resolve();
                }
            })
        } else { 
            console.log(`File does not exist: ${filePath}`);
            resolve();
        }
    })
}

/**
 * Ensures a directory exists, creating it if necessary.
 * @param {string} dirPath - The directory path to check.
 */

function ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true }); // recursive: true creates nested directories 
        console.log(`Directory created: ${dirPath}`);
    }
}
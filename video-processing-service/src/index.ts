import express from 'express';

import {
  uploadProcessedVideo,
  downloadRawVideo,
  deleteRawVideo,
  deleteProcessedVideo,
  convertVideo, 
  setupDirectories
} from './storage';

const app: express.Application = express();
app.use(express.json());

app.post('./process-video', async (req: any, res: any) => {
  // 
  let data;

  try {
    const message = Buffer.from(req.body.message.data, 'base64').toString('utf-8');
    data = JSON.parse(message);
    if (!data.name) {
      throw new Error('Invalid data: name is required');
    }
  } catch (error) {
    console.error('Invalid data', error);
    return res.status(400).send('Invalid data');
  }

  const inputFileName = data.name;
  const outputFileName = inputFileName.replace('.mp4', '-360p.mp4');

  // Download the raw video from gcs
  await downloadRawVideo(inputFileName)

  // Convert the video to 360p
  try {
    await convertVideo(inputFileName, outputFileName);

  } catch (error) {
    // If an error occurs, delete the raw and processed videos
    // Promisee.all is used to run the deleteRawVideo and deleteProcessedVideo functions concurrently
    await Promise.all([
      deleteRawVideo(inputFileName),
      deleteProcessedVideo(outputFileName)
    ])
    console.error('Error processing video', error);
    return res.status(500).send('Error processing video');
  } 

  // Upload the processed video to gcs
  await uploadProcessedVideo(outputFileName);

  // Delete the raw and processed videos
  await Promise.all([
    deleteRawVideo(inputFileName),
    deleteProcessedVideo(outputFileName)
  ])

  return res.status(200).send('Video processed successfully');
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
})

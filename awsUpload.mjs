import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from "fs";
const CONFIG_PATH = './config.json';
const configBuffer = fs.readFileSync(CONFIG_PATH);
const configJson = configBuffer.toString();
const configData = JSON.parse(configJson);

async function uploadFile(
    s3Client,
    awsS3Bucket,
    filename,
    contentType,
    body
  ){
    const mediaUploadParams = {
      Bucket: awsS3Bucket,
      Key: filename,
      Body: body,
      ACL: 'public-read',
      ContentType: contentType,
    };
  
    try {
      await s3Client.send(new PutObjectCommand(mediaUploadParams));
      console.log('uploaded filename:', filename);
    } catch (err) {
      console.log('Error', err);
    }
  
    const url = `https://${awsS3Bucket}.s3.amazonaws.com/${filename}`;
    console.log('Location:', url);
    return url;
  }

  
export default async function awsUpload(image, type) {
    const REGION = configData.awsRegion;
    const s3Client = new S3Client({ region: REGION,
      credentials:{
          accessKeyId:configData.awsAccessKey,
          secretAccessKey: configData.awsSecretKey
      }
    });
  
    async function uploadMedia(media, type) {
      const mediaPath = media;
      const mediaFileStream = fs.createReadStream(media);
      const mediaUrl = await uploadFile(
        s3Client,
        configData.awsBucketName,
        mediaPath,
        type,
        mediaFileStream,
      );
      console.log(mediaUrl);
      return mediaUrl;
    }
    const uriValue = await uploadMedia(image, type);
    return uriValue;
  }
  
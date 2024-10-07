import {
  CopyObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { prisma } from "~/services";

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.B2_APP_KEY_ID!,
    secretAccessKey: process.env.B2_APP_KEY!,
  },
  endpoint: process.env.B2_SERVER_ENDPOINT!,
  forcePathStyle: true,
  region: process.env.B2_SERVER_REGION!,
});

async function updateEventCoverImage(eventId: string, key: string) {
  await prisma.event.update({
    where: { id: eventId },
    data: {
      coverImageKey: key,
    },
  });
}

export async function uploadFileToB2(
  fileBuffer: Buffer,
  fileName: string,
  fileType: string,
  folder: string,
  eventIdToUpdate?: string,
) {
  const key = `${Date.now()}-${fileName}`;
  const command = new PutObjectCommand({
    Body: fileBuffer,
    Bucket: process.env.B2_BUCKET_NAME!,
    ContentType: fileType,
    Key: `${folder}/${key}`,
  });
  try {
    const response = await s3.send(command);
    if (response.$metadata.httpStatusCode === 200) {
      console.log("File uploaded successfully:", `${folder}/${key}`);
      if (eventIdToUpdate) {
        await updateEventCoverImage(eventIdToUpdate, key);
      }
      return { key };
    }
    return null;
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
}

export async function deleteFileFromB2(
  fileKey: string,
  eventIdToUpdate?: string,
) {
  const command = new DeleteObjectCommand({
    Bucket: process.env.B2_BUCKET_NAME!,
    Key: fileKey,
  });
  try {
    const response = await s3.send(command);
    if (eventIdToUpdate) {
      await updateEventCoverImage(eventIdToUpdate, ""); // Clear cover image key
    }
    if (response.$metadata.httpStatusCode === 204) {
      console.log(`File ${fileKey} deleted`);
    } else {
      console.log(`File ${fileKey} probably not deleted`);
    }
    return null;
  } catch (error) {
    console.error("Error deleting file:", error);
  }
}

export async function moveFileInB2(sourceKey: string, destinationKey: string) {
  const copyCommand = new CopyObjectCommand({
    Bucket: process.env.B2_BUCKET_NAME!,
    CopySource: `${process.env.B2_BUCKET_NAME!}/${sourceKey}`,
    Key: destinationKey,
  });
  try {
    const copyResponse = await s3.send(copyCommand);
    if (copyResponse.$metadata.httpStatusCode === 200) {
      console.log(`File copied from ${sourceKey} to ${destinationKey}`);
      await deleteFileFromB2(sourceKey);
      const publicUrl = `${process.env.B2_SERVER_ENDPOINT!}/${process.env.B2_BUCKET_NAME!}/${destinationKey}`;
      return { publicUrl };
    }
    return null;
  } catch (error) {
    console.error("Error moving file:", error);
    return null;
  }
}

function shouldDeleteFile(lastModified?: Date): boolean {
  if (!lastModified) {
    return false;
  }
  const fileAgeInDays =
    (Date.now() - lastModified.getTime()) / (1000 * 60 * 60 * 24);
  return fileAgeInDays > 1;
}

export async function pruneB2Folder(folder: string) {
  const listCommand = new ListObjectsV2Command({
    Bucket: process.env.B2_BUCKET_NAME!,
    Prefix: `${folder}/`,
  });
  try {
    const { Contents } = await s3.send(listCommand);
    if (Contents) {
      for (const file of Contents) {
        if (file.Key && shouldDeleteFile(file.LastModified)) {
          await deleteFileFromB2(file.Key);
          console.log(`Deleted file: ${file.Key}`);
        }
      }
    }
  } catch (error) {
    console.error(`Error pruning "${folder}/" folder:`, error);
  }
}

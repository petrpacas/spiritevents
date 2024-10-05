type BackblazeUploadResult = {
  fileUrl: string;
  fileId: string;
};

export async function uploadToBackblaze(
  fileBuffer: Buffer,
  fileName: string,
): Promise<BackblazeUploadResult> {
  // Get the authorization token
  const authResponse = await fetch(
    "https://api.backblazeb2.com/b2api/v2/b2_authorize_account",
    {
      method: "GET",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.B2_APP_KEY_ID}:${process.env.B2_APP_KEY}`,
          ).toString("base64"),
      },
    },
  );
  const authData = await authResponse.json();
  // Get upload URL
  const uploadUrlResponse = await fetch(
    `${authData.apiUrl}/b2api/v2/b2_get_upload_url`,
    {
      method: "POST",
      headers: {
        Authorization: authData.authorizationToken,
      },
      body: JSON.stringify({
        bucketId: process.env.B2_BUCKET_ID,
      }),
    },
  );
  const uploadUrlData = await uploadUrlResponse.json();
  // Upload file to Backblaze B2
  const uploadResponse = await fetch(uploadUrlData.uploadUrl, {
    method: "POST",
    headers: {
      Authorization: uploadUrlData.authorizationToken,
      "X-Bz-File-Name": encodeURIComponent(fileName),
      "Content-Type": "b2/x-auto",
      "X-Bz-Content-Sha1": "do_not_verify", // You can calculate SHA1 if needed
    },
    body: fileBuffer,
  });
  if (!uploadResponse.ok) {
    throw new Error("File upload failed");
  }
  const uploadResult = await uploadResponse.json();
  return {
    fileUrl: `${authData.downloadUrl}/file/${process.env.B2_BUCKET_NAME}/${fileName}`,
    fileId: uploadResult.fileId,
  };
}

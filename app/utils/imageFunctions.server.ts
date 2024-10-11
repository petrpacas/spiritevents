import { encode } from "blurhash";
import sharp from "sharp";

export const generateBlurHash = async (fileBuffer: Buffer): Promise<string> => {
  const resizedImage = await sharp(fileBuffer)
    .raw()
    .ensureAlpha()
    .resize(32, 32, { fit: "inside" })
    .toBuffer({ resolveWithObject: true });
  const { data, info } = resizedImage;
  const blurHash = encode(
    new Uint8ClampedArray(data),
    info.width,
    info.height,
    4,
    4,
  );
  return blurHash;
};

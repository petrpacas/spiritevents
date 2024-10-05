type CloudflareTransformations = {
  width?: number;
  height?: number;
  fit?: "cover" | "contain" | "fill" | "inside" | "outside";
  format?: "auto" | "jpeg" | "png" | "webp" | "avif";
};

export function getCloudflareImageUrl(
  imageId: string,
  transformations: CloudflareTransformations = {},
): string {
  const baseUrl = `https://imagedelivery.net/${process.env.CF_ACCOUNT_HASH}/${imageId}/public`;
  const params = new URLSearchParams();
  if (transformations.width) {
    params.append("w", transformations.width.toString());
  }
  if (transformations.height) {
    params.append("h", transformations.height.toString());
  }
  if (transformations.fit) {
    params.append("fit", transformations.fit);
  }
  if (transformations.format) {
    params.append("format", transformations.format);
  }
  return `${baseUrl}?${params.toString()}`;
}

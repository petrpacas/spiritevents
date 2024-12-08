import { pruneB2TempFolder } from "~/utils/b2s3Functions.server";

export async function loader() {
  await pruneB2TempFolder();
  return new Response(null, { status: 200 });
}

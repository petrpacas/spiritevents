import type { ActionFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { jsonWithError, jsonWithSuccess } from "remix-toast";
import { deleteFileFromB2, uploadFileToB2 } from "~/utils/b2s3Functions.server";

type Props = {
  eventId?: string;
  folder?: string;
  imageKey?: string;
  onKeyChange?: React.Dispatch<React.SetStateAction<string>>;
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const eventId = formData.get("eventId")?.toString();
  const folder = formData.get("folder")?.toString();
  if (!folder) {
    return jsonWithError(null, "No folder provided", { status: 400 });
  }
  switch (intent) {
    case "upload":
      return handleUpload(formData, eventId);
    case "delete":
      return handleDelete(formData, folder, eventId);
    default:
      return jsonWithError(null, "Unknown action", { status: 400 });
  }
}

async function handleUpload(formData: FormData, eventId?: string) {
  const coverImage = formData.get("coverImage") as File | null;
  if (!coverImage || coverImage.size === 0) {
    return jsonWithError(null, "No file selected", { status: 400 });
  }
  const imageBuffer = Buffer.from(await coverImage.arrayBuffer());
  const response = await uploadFileToB2(
    imageBuffer,
    coverImage.name,
    eventId ? "live" : "temp",
    eventId,
  );
  if (response?.key) {
    return jsonWithSuccess(
      { folder: eventId ? "live" : "temp", key: response.key },
      "Image uploaded successfully!",
      { status: 200 },
    );
  }
  return jsonWithError(null, "Upload was unsuccessful", { status: 500 });
}

async function handleDelete(
  formData: FormData,
  folder: string,
  eventId?: string,
) {
  const key = formData.get("key")?.toString();
  if (!key) {
    return jsonWithError(null, "No key present", { status: 400 });
  }
  await deleteFileFromB2(`${folder}/${key}`, eventId);
  return jsonWithSuccess({ folder, key: "", publicUrl: "" }, "Image deleted!");
}

export const ImageUpload = ({
  eventId,
  folder,
  imageKey,
  onKeyChange,
}: Props) => {
  type ActionData = {
    folder?: string;
    key?: string;
  };
  const fetcher = useFetcher<ActionData>();
  const formRef = useRef<HTMLFormElement>(null);
  const [folderState, setFolderState] = useState(folder || "");
  const [keyState, setKeyState] = useState(imageKey || "");
  useEffect(() => {
    if (fetcher.data) {
      setFolderState(fetcher.data.folder ?? "");
      setKeyState(fetcher.data.key ?? "");
      onKeyChange?.(fetcher.data.key ?? "");
      formRef.current?.reset();
    }
  }, [fetcher.data, onKeyChange]);
  const imageUrl = keyState
    ? `${import.meta.env.VITE_B2_SERVER_ENDPOINT}/${import.meta.env.VITE_B2_BUCKET_NAME}/${folderState}/${keyState}`
    : "";
  return (
    <div className="grid gap-2">
      <fetcher.Form
        action="/components/ImageUpload"
        encType="multipart/form-data"
        method="post"
        ref={formRef}
        className="grid gap-4 rounded-lg border border-stone-300 p-4"
        onSubmit={
          keyState
            ? (e) => {
                const response = confirm(
                  "Do you really want to delete the image?",
                );
                if (!response) {
                  e.preventDefault();
                }
              }
            : undefined
        }
      >
        <input type="hidden" name="eventId" value={eventId} />
        <input type="hidden" name="folder" value={folderState} />
        <input type="hidden" name="key" value={keyState} />
        <div className="grid gap-4 sm:flex">
          {keyState ? (
            <>
              <img
                src={imageUrl}
                alt="Uploaded result"
                className="mx-auto max-h-96 max-w-96 rounded border border-stone-300"
              />
              <button
                type="submit"
                name="intent"
                value="delete"
                className="rounded border border-transparent bg-red-600 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow disabled:opacity-50"
              >
                Remove image
              </button>
            </>
          ) : (
            <>
              <input
                required
                type="file"
                name="coverImage"
                accept="image/*"
                className="w-full cursor-pointer rounded border border-stone-300 px-4 py-2 pr-4 shadow-sm transition-shadow file:mr-4 file:hidden invalid:text-stone-400 hover:shadow-md active:shadow sm:flex-1 dark:bg-stone-800 dark:invalid:text-stone-500"
              />
              <button
                type="submit"
                name="intent"
                value="upload"
                className="rounded border border-transparent bg-emerald-600 px-4 py-2 text-white shadow-sm transition-shadow hover:shadow-md active:shadow disabled:opacity-50"
              >
                Upload image
              </button>
            </>
          )}
        </div>
      </fetcher.Form>
    </div>
  );
};

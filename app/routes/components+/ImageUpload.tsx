import type { ActionFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { jsonWithError, jsonWithSuccess } from "remix-toast";
import sharp from "sharp";
import { requireUserSession } from "~/services";
import { deleteFileFromB2, uploadFileToB2 } from "~/utils/b2s3Functions.server";

type Props = {
  disabled?: boolean;
  eventId?: string;
  imageId?: string;
  imageKey?: string;
  onIdChange?: React.Dispatch<React.SetStateAction<string>>;
  onKeyChange?: React.Dispatch<React.SetStateAction<string>>;
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const eventId = formData.get("eventId")?.toString();
  if (eventId) {
    await requireUserSession(request);
  }
  switch (intent) {
    case "upload":
      return handleUpload(formData, eventId);
    case "delete":
      return handleDelete(formData, eventId);
    default:
      return jsonWithError(null, "Unknown action", { status: 400 });
  }
}

async function handleUpload(formData: FormData, eventId?: string) {
  const image = formData.get("image") as File | null;
  if (!image || image.size === 0) {
    return jsonWithError(null, "No file selected", { status: 400 });
  }
  if (!image.type.startsWith("image/")) {
    return jsonWithError(null, "File isn't an image", { status: 400 });
  }
  if (image.size > 10485760) {
    return jsonWithError(null, "File size is too large (max. 10 MB)", {
      status: 400,
    });
  }
  const imageBuffer = Buffer.from(await image.arrayBuffer());
  const processedImageBuffer = await sharp(imageBuffer)
    .resize(1280)
    .toFormat("jpeg", { mozjpeg: true })
    .toBuffer();
  const response = await uploadFileToB2(
    processedImageBuffer,
    image.type,
    eventId,
  );
  if (response?.id && response?.key) {
    return jsonWithSuccess(
      {
        imageId: response.id,
        imageKey: response.key,
      },
      "Image uploaded successfully!",
      { status: 200 },
    );
  }
  return jsonWithError(null, "Upload was unsuccessful", { status: 500 });
}

async function handleDelete(formData: FormData, eventId?: string) {
  const imageId = formData.get("imageId")?.toString();
  const imageKey = formData.get("imageKey")?.toString();
  if (!imageKey) {
    return jsonWithError(null, "No key present", { status: 400 });
  }
  await deleteFileFromB2(
    `${eventId ? "events" : "temp"}/${imageKey}`,
    `${imageId}`,
    eventId,
  );
  return jsonWithSuccess({ imageId: "", imageKey: "" }, "Image deleted!");
}

export const ImageUpload = ({
  disabled,
  eventId,
  imageId,
  imageKey,
  onIdChange,
  onKeyChange,
}: Props) => {
  type ActionData = {
    imageId?: string;
    imageKey?: string;
  };
  const fetcher = useFetcher<ActionData>();
  const formRef = useRef<HTMLFormElement>(null);
  const [imageIdState, setImageIdState] = useState(imageId || "");
  const [imageKeyState, setImageKeyState] = useState(imageKey || "");
  useEffect(() => {
    if (fetcher.data) {
      setImageIdState(fetcher.data.imageId ?? "");
      setImageKeyState(fetcher.data.imageKey ?? "");
      onIdChange?.(fetcher.data.imageId ?? "");
      onKeyChange?.(fetcher.data.imageKey ?? "");
      formRef.current?.reset();
    }
  }, [fetcher.data, onIdChange, onKeyChange]);
  const imageUrl = imageKeyState
    ? `${import.meta.env.VITE_B2_CDN_ALIAS}/${eventId ? "events" : "temp"}/${imageKeyState}`
    : "";
  const isWorking = disabled || fetcher.state !== "idle";
  return (
    <div className="grid gap-2">
      <span>
        Cover image{" "}
        {!imageKeyState && <span className="text-amber-600">(max. 10 MB)</span>}
      </span>
      <fetcher.Form
        action="/components/ImageUpload"
        encType="multipart/form-data"
        method="post"
        ref={formRef}
        className="grid gap-4 rounded-lg border border-amber-600 p-4"
        onSubmit={
          imageKeyState
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
        {eventId && <input type="hidden" name="eventId" value={eventId} />}
        <input type="hidden" name="imageId" value={imageIdState} />
        <input type="hidden" name="imageKey" value={imageKeyState} />
        <div className="grid gap-4 sm:flex">
          {imageKeyState ? (
            <>
              <img
                src={imageUrl}
                alt="Uploaded result"
                className="mx-auto max-h-96 w-full max-w-96 rounded border border-stone-300"
              />
              <button
                disabled={isWorking}
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
                name="image"
                accept="image/*"
                className="m-0 w-full cursor-pointer rounded border border-stone-300 p-0 pr-3 shadow-sm transition-shadow file:m-0 file:mr-3 file:h-[42px] file:cursor-pointer file:rounded-l-sm file:rounded-r-none file:border-0 file:bg-stone-300 file:p-0 file:px-3 file:text-base file:text-stone-800 invalid:text-stone-400 hover:shadow-md active:shadow sm:flex-1 dark:bg-stone-800 dark:[color-scheme:dark] dark:invalid:text-stone-500"
              />
              <button
                disabled={isWorking}
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

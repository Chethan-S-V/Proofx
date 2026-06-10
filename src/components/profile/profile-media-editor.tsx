"use client";

import { Camera, ImagePlus, Pencil, Trash2, Upload, X } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "../ui/button";

type ProfileMediaEditorProps = {
  action: (formData: FormData) => Promise<void>;
  mode: "avatar" | "banner";
};

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result?.toString() ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function cropBannerToDataUrl(source: string, verticalPosition: number) {
  const image = new Image();
  image.src = source;
  await image.decode();

  const targetWidth = 1000;
  const targetHeight = 300;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    return source;
  }

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const sourceRatio = image.width / image.height;
  const targetRatio = targetWidth / targetHeight;
  const cropWidth = sourceRatio > targetRatio ? image.height * targetRatio : image.width;
  const cropHeight = sourceRatio > targetRatio ? image.height : image.width / targetRatio;
  const cropX = (image.width - cropWidth) / 2;
  const cropY = Math.max(0, (image.height - cropHeight) * (verticalPosition / 100));

  context.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, targetWidth, targetHeight);
  return canvas.toDataURL("image/jpeg", 0.72);
}

async function resizeAvatarToDataUrl(source: string) {
  const image = new Image();
  image.src = source;
  await image.decode();

  const targetSize = 420;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    return source;
  }

  canvas.width = targetSize;
  canvas.height = targetSize;

  const cropSize = Math.min(image.width, image.height);
  const cropX = (image.width - cropSize) / 2;
  const cropY = (image.height - cropSize) / 2;

  context.drawImage(image, cropX, cropY, cropSize, cropSize, 0, 0, targetSize, targetSize);
  return canvas.toDataURL("image/jpeg", 0.78);
}

export function ProfileMediaEditor({ action, mode }: ProfileMediaEditorProps) {
  const [dataUrl, setDataUrl] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [sourceDataUrl, setSourceDataUrl] = useState("");
  const [cropPosition, setCropPosition] = useState(50);
  const [open, setOpen] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (capturing && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      void videoRef.current.play();
    }
  }, [capturing]);

  async function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCapturing(false);
  }

  async function handleFile(file: File | undefined) {
    if (!file) {
      return;
    }

    try {
      setError("");
      const nextDataUrl = await fileToDataUrl(file);
      setSourceDataUrl(nextDataUrl);
      setDataUrl(mode === "banner" ? await cropBannerToDataUrl(nextDataUrl, cropPosition) : await resizeAvatarToDataUrl(nextDataUrl));
    } catch {
      setError("That image could not be decoded. Try another image file.");
    }
  }

  async function handleCropChange(value: number) {
    setCropPosition(value);

    if (sourceDataUrl && mode === "banner") {
      try {
        setDataUrl(await cropBannerToDataUrl(sourceDataUrl, value));
      } catch {
        setError("That banner could not be cropped. Try another image file.");
      }
    }
  }

  async function startCamera() {
    if (mode !== "avatar") {
      return;
    }

    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setCapturing(true);
    } catch {
      setError("Camera permission was denied or the camera is unavailable.");
    }
  }

  async function capturePhoto() {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 420;
    canvas.height = 420;
    const context = canvas.getContext("2d");
    const cropSize = Math.min(video.videoWidth, video.videoHeight);
    const cropX = (video.videoWidth - cropSize) / 2;
    const cropY = (video.videoHeight - cropSize) / 2;

    context?.drawImage(video, cropX, cropY, cropSize, cropSize, 0, 0, 420, 420);
    setDataUrl(canvas.toDataURL("image/jpeg", 0.78));
    await stopCamera();
  }

  function closeEditor() {
    void stopCamera();
    setOpen(false);
  }

  function resetEditor() {
    setDataUrl("");
    setSourceDataUrl("");
    setCropPosition(50);
    setError("");
  }

  function handleMediaSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        await action(formData);
        resetEditor();
        closeEditor();
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : "The media could not be saved. Try a smaller image.");
      }
    });
  }

  function handleClearSelected() {
    resetEditor();
  }

  function handleClose() {
    resetEditor();
    closeEditor();
  }

  return (
    <>
      {mode === "avatar" ? (
        <button
          aria-label="Edit profile photo"
          className="absolute inset-0 z-10 cursor-pointer rounded-sm outline-none focus-visible:ring-4 focus-visible:ring-cyan-400/25"
          onClick={() => setOpen(true)}
          type="button"
        />
      ) : (
        <button
          aria-label="Edit banner"
          className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center text-cyan-200 opacity-0 drop-shadow-[0_1px_3px_rgba(2,6,23,0.85)] transition hover:text-white focus-visible:opacity-100 group-hover:opacity-100"
          onClick={() => setOpen(true)}
          type="button"
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </button>
      )}

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4"
          onClick={handleClose}
          role="presentation"
        >
          <div
            className="w-full max-w-lg rounded-lg border border-slate-800 bg-slate-950 p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            role="presentation"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-white">{mode === "avatar" ? "Profile photo" : "Banner"}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {mode === "avatar" ? "Upload a photo or capture one with your camera." : "Browse a banner. It will be center-cropped before saving."}
                </p>
              </div>
              <button
                className="rounded-md p-1 text-slate-500 transition hover:bg-slate-900 hover:text-white"
                onClick={handleClose}
                type="button"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <input
                accept="image/*"
                className="hidden"
                onChange={(event) => void handleFile(event.target.files?.[0])}
                ref={fileInputRef}
                type="file"
              />
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => fileInputRef.current?.click()} type="button" variant="outline">
                  <ImagePlus className="h-4 w-4" aria-hidden="true" />
                  {mode === "avatar" ? "Upload photo" : "Browse banner"}
                </Button>
                {mode === "avatar" ? (
                  <Button onClick={() => void startCamera()} type="button" variant="outline">
                    <Camera className="h-4 w-4" aria-hidden="true" />
                    Capture photo
                  </Button>
                ) : null}
              </div>

              {error ? <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p> : null}

              {capturing ? (
                <div className="space-y-3">
                  <video autoPlay className="aspect-video w-full rounded-md bg-black object-cover" muted playsInline ref={videoRef} />
                  <Button onClick={() => void capturePhoto()} type="button">Use captured photo</Button>
                </div>
              ) : null}

              {dataUrl ? (
                <div className="space-y-3">
                  <div className={mode === "avatar" ? "group/preview relative h-32 w-32" : "group/preview relative aspect-[10/3] w-full"}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt=""
                      className={mode === "avatar" ? "h-32 w-32 rounded-lg object-cover" : "h-full w-full rounded-md object-cover"}
                      src={dataUrl}
                    />
                    <button
                      aria-label={mode === "avatar" ? "Remove selected photo" : "Remove selected banner"}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-slate-950/80 text-red-200 opacity-0 shadow-lg transition hover:bg-red-500 hover:text-white group-hover/preview:opacity-100"
                      onClick={handleClearSelected}
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                  {mode === "banner" ? (
                    <label className="block space-y-2">
                      <span className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Crop position</span>
                      <input
                        className="w-full"
                        max={100}
                        min={0}
                        onChange={(event) => void handleCropChange(Number(event.target.value))}
                        type="range"
                        value={cropPosition}
                      />
                    </label>
                  ) : null}
                  <form onSubmit={handleMediaSubmit}>
                    <input name={mode === "avatar" ? "avatarDataUrl" : "bannerDataUrl"} type="hidden" value={dataUrl} />
                    <Button disabled={isPending} type="submit">
                      <Upload className="h-4 w-4" aria-hidden="true" />
                      Set {mode === "avatar" ? "profile photo" : "banner"}
                    </Button>
                  </form>
                </div>
              ) : null}
              <form onSubmit={handleMediaSubmit}>
                <input name={mode === "avatar" ? "avatarDataUrl" : "bannerDataUrl"} type="hidden" value="__delete__" />
                <Button disabled={isPending} type="submit" variant="ghost">
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Delete current {mode === "avatar" ? "photo" : "banner"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

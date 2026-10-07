import { useCallback, useRef, useState } from "react";
import { adminApi } from "@/admin/api.js";
import { compressImage } from "@/admin/imageTools.js";
import { friendlyError } from "@/admin/errors.js";
import { imageUrl } from "@/lib/images.js";
import { MAX_PHOTOS, isBusy, makeMainPhoto, movePhoto, replacePhoto, uploadedRefs, withoutPhoto } from "./photoList.js";

const IMAGE_ID_PATTERN = /^img_[a-z0-9]{8,16}$/;

let photoCounter = 0;
const nextKey = () => {
  photoCounter += 1;
  return `photo-${photoCounter}`;
};

const photoFromRef = (ref) => ({ key: nextKey(), ref, previewUrl: imageUrl(ref), status: "done", error: "" });

const pendingPhoto = (file) => ({
  key: nextKey(),
  ref: null,
  previewUrl: URL.createObjectURL(file),
  status: "preparing",
  error: "",
  file,
});

const uploadFile = async (file) => {
  const blob = await compressImage(file);
  return adminApi.uploadImage(blob);
};

export function usePhotoUploads(initialRefs) {
  const [photos, setPhotos] = useState(() => initialRefs.map(photoFromRef));
  const sessionUploads = useRef(new Set());
  const photosRef = useRef(photos);
  photosRef.current = photos;

  const change = useCallback((transform) => setPhotos((current) => transform(current)), []);

  const run = useCallback(
    async (photo) => {
      change((current) => replacePhoto(current, photo.key, { status: "uploading", error: "" }));
      try {
        const uploaded = await uploadFile(photo.file);
        sessionUploads.current.add(uploaded.id);
        change((current) => replacePhoto(current, photo.key, { status: "done", ref: uploaded.id, file: undefined }));
      } catch (error) {
        change((current) => replacePhoto(current, photo.key, { status: "error", error: friendlyError(error, error.message) }));
      }
    },
    [change],
  );

  const addFiles = useCallback(
    async (fileList) => {
      const room = MAX_PHOTOS - photosRef.current.length;
      const files = Array.from(fileList).slice(0, Math.max(0, room));
      const pending = files.map(pendingPhoto);
      change((current) => [...current, ...pending]);
      for (const photo of pending) {
        await run(photo);
      }
      return { added: pending.length, skipped: Array.from(fileList).length - pending.length };
    },
    [change, run],
  );

  const retry = useCallback((key) => {
    const photo = photosRef.current.find((entry) => entry.key === key);
    if (photo?.file) run(photo);
  }, [run]);

  const remove = useCallback((key) => change((current) => withoutPhoto(current, key)), [change]);
  const move = useCallback((index, offset) => change((current) => movePhoto(current, index, offset)), [change]);
  const makeMain = useCallback((index) => change((current) => makeMainPhoto(current, index)), [change]);

  const orphanedIds = useCallback(
    (savedRefs) =>
      [...new Set([...initialRefs, ...sessionUploads.current])].filter((ref) => IMAGE_ID_PATTERN.test(ref) && !savedRefs.includes(ref)),
    [initialRefs],
  );

  return {
    photos,
    refs: uploadedRefs(photos),
    busy: photos.some(isBusy),
    hasFailed: photos.some((photo) => photo.status === "error"),
    addFiles,
    retry,
    remove,
    move,
    makeMain,
    orphanedIds,
  };
}

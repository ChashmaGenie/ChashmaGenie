export const MAX_PHOTOS = 8;

export const movePhoto = (photos, index, offset) => {
  const target = index + offset;
  if (target < 0 || target >= photos.length) return photos;
  const reordered = [...photos];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
  return reordered;
};

export const makeMainPhoto = (photos, index) =>
  index <= 0 || index >= photos.length ? photos : [photos[index], ...photos.filter((_, position) => position !== index)];

export const replacePhoto = (photos, key, patch) => photos.map((photo) => (photo.key === key ? { ...photo, ...patch } : photo));

export const withoutPhoto = (photos, key) => photos.filter((photo) => photo.key !== key);

export const uploadedRefs = (photos) => photos.filter((photo) => photo.status === "done").map((photo) => photo.ref);

export const isBusy = (photo) => photo.status === "preparing" || photo.status === "uploading";

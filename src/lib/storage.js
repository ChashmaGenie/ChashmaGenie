const read = (storage, key) => {
  try {
    const raw = storage.getItem(key);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
};

const write = (storage, key, value) => {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

const remove = (storage, key) => {
  try {
    storage.removeItem(key);
  } catch {
    return;
  }
};

const pickStorage = (kind) => {
  try {
    return kind === "session" ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
};

const withStorage = (kind, action, fallback) => {
  const storage = pickStorage(kind);
  return storage ? action(storage) : fallback;
};

export const safeGet = (key, kind = "local") => withStorage(kind, (storage) => read(storage, key), null);

export const safeSet = (key, value, kind = "local") => withStorage(kind, (storage) => write(storage, key, value), false);

export const safeRemove = (key, kind = "local") => withStorage(kind, (storage) => remove(storage, key), undefined);

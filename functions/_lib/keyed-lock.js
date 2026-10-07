const pendingByKey = new Map();

const ignoreFailure = () => undefined;

// KV has no compare-and-set, so concurrent requests handled by one isolate are serialised here.
export const withKeyLock = async (key, task) => {
  const previous = pendingByKey.get(key) ?? Promise.resolve();
  const current = previous.catch(ignoreFailure).then(task);
  const settled = current.catch(ignoreFailure);
  pendingByKey.set(key, settled);
  try {
    return await current;
  } finally {
    if (pendingByKey.get(key) === settled) pendingByKey.delete(key);
  }
};

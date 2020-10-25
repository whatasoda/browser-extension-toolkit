export const assertLastErrorChrome = () => {
  if (chrome.runtime.lastError != null) {
    throw chrome.runtime.lastError;
  }
};

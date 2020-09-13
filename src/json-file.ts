const JSONFile = <T>(cacheable: boolean, content: () => Promise<T>) => async () => ({
  cacheable,
  code: JSON.stringify(await content()),
});
JSONFile.manifest = (cacheable: boolean, content: () => Promise<chrome.runtime.Manifest>) => {
  return JSONFile(cacheable, content);
};

export default JSONFile;

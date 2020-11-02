export default (data, outputFormat) => {
  const domparser = new DOMParser();
  return domparser.parseFromString(data, outputFormat);
};

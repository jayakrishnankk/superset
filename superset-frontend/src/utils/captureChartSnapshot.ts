import domToImage from 'dom-to-image';
const WHITE_BACKGROUND_COLOR = '#FFF';

const captureChartSnapshot = (
  chartId: string,
  selector = 'div',
  isExactSelector = false,
): Promise<string> => {
  const elementToPrint = isExactSelector
    ? document.querySelector(selector)
    : document.querySelector(`#${chartId}`)?.closest(selector);

  if (!elementToPrint) {
    return Promise.reject(new Error('No chart found in the current dashboard'));
  }

  // Mapbox controls are loaded from different origin, causing CORS error
  // See https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL#exceptions
  const filter = (node: Element) => {
    if (typeof node.className === 'string') {
      return (
        node.className !== 'mapboxgl-control-container' &&
        !node.className.includes('ant-dropdown')
      );
    }
    return true;
  };

  return domToImage
    .toPng(elementToPrint, {
      quality: 0.95,
      bgcolor: WHITE_BACKGROUND_COLOR,
      filter,
    })
    .then(dataUrl => dataUrl);
};

export default captureChartSnapshot;

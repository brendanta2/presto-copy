/**
 * This code was taken from the COMP6080 24T1, Assignment 3 - Qanda
 *
 * Given a js file object representing a jpg or png image, such as one taken
 * from a html file input element, return a promise which resolves to the file
 * data as a data url.
 *
 * Example Usage:
 *   const file = document.querySelector('input[type="file"]').files[0];
 *   console.log(fileToDataUrl(file));
 * @param {File} file The file to be read.
 * @return {Promise<string>} Promise which resolves to the file as a data url.
 */
export function fileToDataUrl (file) {
  const validFileTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  const valid = validFileTypes.find((type) => type === file.type);
  // Bad data, let's walk away.
  if (!valid) {
    throw Error('provided file is not a png, jpg or jpeg image.');
  }

  const reader = new FileReader();
  const dataUrlPromise = new Promise((resolve, reject) => {
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
  });
  reader.readAsDataURL(file);
  return dataUrlPromise;
}

/**
 * Given a string of code, filter out all characters that would otherwise
 * produce vulnerable HTML in application.
 *
 * @param {string} code
 * @returns {string} The filtered code.
 */
export function filteredCode (code) {
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Given a video link from YouTube, modifies the link such that it is able to be displayed via an <iframe> tag
 * - Input videoUrl: https://www.youtube.com/watch?v=VIDEO_ID&ab_channel=CHANNEL_NAME
 * - Output: https://www.youtube.com/embed/VIDEO_ID?controls=0&disablekb=1
 *
 * @param {string} videoUrl
 * @param {boolean} isAutoPlay
 */
export function embedVideoUrl (videoUrl, isAutoPlay, isPreview) {
  // User may or may not have inputted with channel
  const trimEndIndex = videoUrl.indexOf('&ab_channel');
  let temp = trimEndIndex !== -1 ? videoUrl.slice(0, trimEndIndex) : videoUrl;

  temp = isPreview ? temp.concat('?') : temp.concat('?controls=0&disablekb=1');
  const embeddedUrl = temp.replace('/watch?v=', '/embed/');

  return isAutoPlay && isPreview
    ? embeddedUrl.concat('&autoplay=1&mute=1')
    : embeddedUrl;
}

/**
 * Given the inputs for a gradient form and the current slide / presentation's background settings,
 * check if the gradients are the same if the background is set as gradient
 *
 * @param {{ gradientColor1, gradientColor2, gradientDirection }} param0
 * @param {{ isGradient, color } | { isGradient, gradientColor1, gradientColor2, gradientDirection } | null} background
 * @returns
 */
export function isSameGradient (
  { gradientColor1, gradientColor2, gradientDirection },
  background
) {
  if (!background || !background.isGradient) {
    return false;
  }

  if (
    gradientColor1 === background.gradientColor1 &&
    gradientColor2 === background.gradientColor2 &&
    gradientDirection === background.gradientDirection
  ) {
    return true;
  } else {
    return false;
  }
}

/**
 * Given the slide's set background and the presentation's default background,
 * returns the resulting background for the slide.
 *
 * Prioritises the slide's set background over the defaultBackground
 *
 * @param {{ isGradient, color } | { isGradient, gradientColor1, gradientColor2, gradientDirection } | null} background
 * @param {{ isGradient, color } | { isGradient, gradientColor1, gradientColor2, gradientDirection }} defaultBackground
 * @returns {string} CSS values for 'background' property
 */
export const setCSSBackground = (background, defaultBackground) => {
  if (background && !background.isGradient) {
    return background.color;
  } else if (!background && !defaultBackground.isGradient) {
    return defaultBackground.color;
  }

  const { gradientColor1, gradientColor2, gradientDirection } =
    background || defaultBackground;

  if (gradientDirection === 'top-bottom') {
    return `linear-gradient(${gradientColor1}, ${gradientColor2})`;
  } else if (gradientDirection === 'left-right') {
    return `linear-gradient(to right, ${gradientColor1}, ${gradientColor2})`;
  } else if (gradientDirection === 'diagonal') {
    return `linear-gradient(to bottom right, ${gradientColor1}, ${gradientColor2})`;
  }

  return '';
};

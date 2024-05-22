import React from 'react';
import styled from 'styled-components';
import { embedVideoUrl } from '../../utils/helpers';

const StyledDisplayVideo = styled.iframe`
  width: 100%;
  height: 100%;
  pointer-events: ${(props) => (props?.isPreview ? 'auto' : 'none')};
`;

/**
 * Video element parameterised by:
 *  - The URL address to the YouTube video
 *  - Whether the user wants it to auto-play upon presenting?
 */
const Video = ({ elementObj: { videoUrl, isAutoPlay }, isPreview }) => {
  const embeddedUrl = embedVideoUrl(videoUrl, isAutoPlay, isPreview);

  return (
    <StyledDisplayVideo
      src={embeddedUrl}
      isPreview={isPreview}
    ></StyledDisplayVideo>
  );
};

export default Video;

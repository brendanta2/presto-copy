import React from 'react';
import styled from 'styled-components';

const StyledDisplayImage = styled.img`
  width: 100%;
  height: 100%;
`;

/**
 * Image element parameterised by:
 *  - The base64 string encoding of an image uploaded by a user
 *  - A description of the image for an alt tag
 */
const Image = ({ elementObj: { image, description } }) => {
  return <StyledDisplayImage src={image} alt={description} draggable={false} />;
};

export default Image;

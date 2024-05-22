import React from 'react';
import styled from 'styled-components';

const TextboxContainer = styled.div`
  border: 1px solid #b9b9b9;
  overflow: hidden;
  font-size: ${(props) => `${props?.fontSize}em`};
  color: ${(props) => props?.color};
  background-color: #ffffff;
  width: 100%;
  height: 100%;
  font-family: ${(props) => props?.font};
  user-select: ${(props) => (props?.isPreview ? 'none' : 'text')}
`;

/**
 * Textbox element parameterised by:
 *  - Font size in em
 *  - Color given in HEX formatting
 *  - Display text as a string
 */
const Textbox = ({ elementObj: { displayText, fontSize, color, font } }, isPreview) => {
  return (
    <TextboxContainer fontSize={fontSize} color={color} font={font} isPreview={isPreview}>
      {displayText}
    </TextboxContainer>
  );
};

export default Textbox;

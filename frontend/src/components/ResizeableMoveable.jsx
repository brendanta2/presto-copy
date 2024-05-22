import React, { useEffect, useRef, useState } from 'react';
import { Rnd } from 'react-rnd';
import styled from 'styled-components';

const StyledRnd = styled(Rnd)`
  z-index: ${(props) => props?.layer};
`;

const RndInnerWrapper = styled.div`
  width: 100%;
  height: 100%;
`;

const CornerBox = styled.div`
  z-index: 100;
  height: 5px;
  width: 5px;
  background-color: #000000;
  position: absolute;
`;

const CornerBoxTopLeft = styled(CornerBox)`
  left: -2px;
  top: -2px;
`;

const CornerBoxTopRight = styled(CornerBox)`
  right: -2px;
  top: -2px;
`;

const CornerBoxBottomRight = styled(CornerBox)`
  right: -2px;
  bottom: -2px;
`;

const CornerBoxBottomLeft = styled(CornerBox)`
  left: -2px;
  bottom: -2px;
`;

/**
 * ResizeableMoveable component to allow resizing and moving of elements via mouse
 * with resizing maintaining aspect ratio.
 *
 * @param {
 *  children: JSX.Element,
 *  x: number,
 *  y: number,
 *  layer: number,
 *  width: number,
 *  height: number,
 *  onDragStop: Function,
 *  onResizeStop: Function,
 *  updateFontSelectionEnabled: Function,
 *  preventDismissalClickSelector: Function,
 *  modifiable: boolean
 * }
 * @returns
 */
const ResizeableMoveable = ({
  children,
  x,
  y,
  layer,
  width,
  height,
  onDragStop,
  onResizeStop,
  updateFontSelectionEnabled,
  preventDismissalClickSelector,
  modifiable = true
}) => {
  const [clicked, setClicked] = useState(false);
  const rndRef = useRef(null);

  /**
   * Function called when the user clicks outside the element and not
   * on the font selector.
   *
   * Toggles the font selection enabled state and sets the clicked state to false
   * and clears the border boxes.
   */
  const handleMouseDownOutside = (e) => {
    if (!rndRef.current?.contains(e.target)) {
      if (!preventDismissalClickSelector(e)) {
        updateFontSelectionEnabled(false);
        setClicked(false);
      }
    }
  };

  /**
   * Function called when user clicks inside the element.
   *
   * Toggles the font selection enabled state and sets the clicked state to true
   * and shows the border boxes.
   */
  const handleMouseDownInside = () => {
    setClicked(true);
    updateFontSelectionEnabled(true);
  };

  /**
   * Adds event listener to listen for clicks outside the element
   */
  useEffect(() => {
    document.addEventListener('mousedown', handleMouseDownOutside);
    return () =>
      document.removeEventListener('mousedown', handleMouseDownOutside);
  }, []);

  return (
    <StyledRnd
      default={{
        x,
        y
      }}
      size={{
        height: `${height}%`,
        width: `${width}%`
      }}
      onDragStop={onDragStop}
      onDragStart={handleMouseDownInside}
      bounds={'parent'}
      layer={layer}
      onResizeStop={onResizeStop}
      enableResizing={
        clicked
          ? {
              top: false,
              bottom: false,
              right: false,
              left: false,
              topLeft: true,
              topRight: true,
              bottomLeft: true,
              bottomRight: true
            }
          : {
              top: false,
              bottom: false,
              right: false,
              left: false,
              topLeft: false,
              topRight: false,
              bottomLeft: false,
              bottomRight: false
            }
      }
      lockAspectRatio={true}
      minWidth={'1%'}
      minHeight={'1%'}
      disableDragging={!modifiable}
    >
      {clicked && (
        <>
          <CornerBoxTopLeft />
          <CornerBoxTopRight />
          <CornerBoxBottomRight />
          <CornerBoxBottomLeft />
        </>
      )}
      <RndInnerWrapper ref={rndRef}>{children}</RndInnerWrapper>
    </StyledRnd>
  );
};

export default ResizeableMoveable;

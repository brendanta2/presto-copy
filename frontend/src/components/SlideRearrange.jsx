import React, { useContext, useState } from 'react';
import { CloseButton } from 'react-bootstrap';
import styled from 'styled-components';
import { AppContext } from '../contexts/AppContext';
import ErrorModal from './Modal/ErrorModal';
import axios from 'axios';
import { LOCAL_HOST, STORE_PATH } from '../utils/constants';
import { useNavigate, useParams } from 'react-router-dom';

const SlideRearrangeContainer = styled.div`
  z-index: 2147483647;
  height: 100vh;
  width: 100vw;
  position: fixed;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
`;

/**
 * Card representing a slide in the SlideRearrange component
 *
 * Note: The slide user is currently on will be highlighted in a different color
 */
const SlideCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => props?.bg};
  color: #ffffff;
  height: 20%;
  width: 20%;
  cursor: pointer;
  user-select: none;
`;

const SlideRearrangeBetween = styled.div`
  width: 40px;
  height: 20%;
`;

const SlideRearrangeClose = styled(CloseButton)`
  position: absolute;
  right: 20px;
  top: 10px;
`;

/**
 * SlideRearrange component that displays a full screen page to rearrange slides
 * with slides represented as cards
 */
const SlideRearrange = ({
  slides,
  onClose,
  currSlideIndex,
  updateCurrSlideIndex
}) => {
  const { token, store, setStore } = useContext(AppContext);

  const [draggedSlideId, setDraggedSlideId] = useState(-1);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  const currPresId = parseInt(useParams().pId);

  const handleDragStart = (e, id) => {
    setDraggedSlideId(id);
  };

  /**
   * Function is called when a slide is dragged over the space between slides
   * and will highlight the space in blue
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    e.target.style.backgroundColor = '#007bff';
  };

  /**
   * Function is called when a slide is dropped on the space between slides
   * and will reset the highlighted colors, rearrange the slides accordingly
   * before making an API request to update the store and highlight the
   * current slide if it was moved
   */
  const handleOnDrop = (e, targetId) => {
    e.preventDefault();
    e.target.style.backgroundColor = '#ffffff';
    if (targetId === draggedSlideId) return;

    const draggedSlideIndex = slides.findIndex(
      (slide) => slide.id === draggedSlideId
    );
    const draggedSlide = slides[draggedSlideIndex];
    slides.splice(draggedSlideIndex, 1);
    const targetSlideIndex = slides.findIndex((slide) => slide.id === targetId);
    if (targetSlideIndex === -1) {
      // moving the selected slide to the very end
      slides.push(draggedSlide);
      if (draggedSlideIndex === currSlideIndex) {
        updateCurrSlideIndex(slides.length - 1);
        navigate(`/edit/${currPresId}/${slides.length - 1}`, {
          replace: true
        });
      }
    } else {
      slides.splice(targetSlideIndex, 0, draggedSlide);
      if (draggedSlideIndex === currSlideIndex) {
        updateCurrSlideIndex(targetSlideIndex);
        navigate(`/edit/${currPresId}/${targetSlideIndex}`, {
          replace: true
        });
      }
    }
    try {
      axios.put(
        LOCAL_HOST + STORE_PATH,
        { store },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setStore({ ...store });
    } catch (err) {
      setErrorMessage('Error rearranging slides. Please refresh.');
    }
  };

  return (
    <>
      <SlideRearrangeContainer>
        <SlideRearrangeClose onClick={onClose} />
        {slides.map((slide, index) => (
          <>
            <SlideRearrangeBetween
              key={index + slides.length * 2}
              onDragOver={handleDragOver}
              onDragLeave={(e) => (e.target.style.backgroundColor = '#ffffff')}
              onDrop={(e) => handleOnDrop(e, slide.id)}
            />
            <SlideCard
              bg={index === currSlideIndex ? '#343a40' : '#000000'}
              key={index}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, slide.id)}
            >
              {index + 1}
            </SlideCard>
          </>
        ))}
        <SlideRearrangeBetween
          onDragOver={handleDragOver}
          onDragLeave={(e) => (e.target.style.backgroundColor = '#ffffff')}
          onDrop={(e) => handleOnDrop(e, -2)}
        />
      </SlideRearrangeContainer>
      <ErrorModal
        errorMessage={errorMessage}
        onHide={() => setErrorMessage('')}
      />
    </>
  );
};

export default SlideRearrange;

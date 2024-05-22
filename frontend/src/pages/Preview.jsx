import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { setCSSBackground } from '../utils/helpers';
import AppNavBar from '../components/Navbar';
import Slide from '../components/Slide';
import SlideElement from '../components/SlideElement';
import { Carousel, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import styled from 'styled-components';

const PreviewContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const PreviewMain = styled.div`
  width: 100%;
  flex-grow: 2;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  background-color: #f1f1f1;
  position: relative;
`;

const PreviewSlideDisplay = styled(Carousel)`
  width: 95%;
  height: 90%;
  position: relative;
`;

const PreviewSlideNumber = styled.div`
  width: 50px;
  height: 50px;
  position: absolute;
  bottom: 0px;
  left: 0px;

  text-align: center;
  line-height: 50px;
  font-size: 1em;
`;

const SlideNavigationBtn = styled.div`
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  cursor: pointer;
  margin: 0 10px;
  user-select: none;
`;

const SlideNavigationFiller = styled.div`
  width: 30px;
  height: 30px;
  margin: 0 10px;
`;

/**
 * Preview page that displays the presentation slides in a carousel. (equivalent of editor but no edit controls)
 */
const Preview = () => {
  const { store, loading } = useContext(AppContext);
  const params = useParams();
  const navigate = useNavigate();
  const currPresId = parseInt(params.pId);

  const [currSlideIndex, setCurrSlideIndex] = useState(parseInt(params.sId));
  const initialSlideIndex = useRef(parseInt(params.sId));

  const slideNavRef = useRef(document);
  const slideRef = useRef(null);

  const currPresentation = useMemo(
    () => store?.presentations?.find((pres) => pres.id === currPresId),
    [store, loading]
  );

  // Don't need to update if the user edits the slides, they should preview again
  const slides = currPresentation
    ? (
        currPresentation.slides.map((slide, index) => (
      <Carousel.Item key={slide.id}>
        <Slide
          key={slide.id}
          ref={index === currSlideIndex ? slideRef : null}
          background={setCSSBackground(
            slide.background,
            currPresentation.defaultBackground
          )}
        >
          {currPresentation.slides[index].elements.map((element) => {
            return (
              <SlideElement
                key={element.id}
                elementObj={element}
                slide={currPresentation.slides[currSlideIndex]}
                broadcastModalOpen={() => {}}
                broadcastModalClose={() => {}}
                slideIndexOverhead={initialSlideIndex.current === index}
                updateFontSelectionEnabled={(enabled) => {}}
                setFontSelectionEnabled={() => {}}
                preventDismissalClickSelector={() => {}}
                ref={slideRef}
                modifiable={false}
              />
            );
          })}
        </Slide>
        <PreviewSlideNumber>{index + 1}</PreviewSlideNumber>
      </Carousel.Item>
        ))
      )
    : (
    <></>
      );

  /**
   * Function called when user clicks the left arrow to navigate to the previous slide
   */
  const handleSlideNavigationLeft = useCallback(() => {
    const newIndex =
      currSlideIndex - 1 < 0 ? currSlideIndex : currSlideIndex - 1;
    setCurrSlideIndex(newIndex);
    navigate(`/preview/${currPresId}/${newIndex}`, {
      replace: true
    });
  }, [currSlideIndex]);

  /**
   * Function called when user clicks the right arrow to navigate to the next slide
   */
  const handleSlideNavigationRight = useCallback(() => {
    const newIndex =
      currSlideIndex + 1 >= currPresentation.slides.length
        ? currSlideIndex
        : currSlideIndex + 1;
    setCurrSlideIndex(newIndex);
    navigate(`/preview/${currPresId}/${newIndex}`, {
      replace: true
    });
  }, [currPresentation, currSlideIndex]);

  /**
   * Function called when user presses the left or right arrow key to navigate between slides
   */
  const handleSlideNavigation = useCallback(
    (e) => {
      if (e.key === 'ArrowRight') {
        const newIndex =
          currSlideIndex + 1 >= currPresentation.slides.length
            ? currSlideIndex
            : currSlideIndex + 1;
        setCurrSlideIndex(newIndex);
        navigate(`/preview/${currPresId}/${newIndex}`, {
          replace: true
        });
      } else if (e.key === 'ArrowLeft') {
        const newIndex =
          currSlideIndex - 1 < 0 ? currSlideIndex : currSlideIndex - 1;
        setCurrSlideIndex(newIndex);
        navigate(`/preview/${currPresId}/${newIndex}`, {
          replace: true
        });
      }
    },
    [currPresentation, currSlideIndex]
  );

  /**
   * useEffect hook to add event listener for keyboard navigation via left & right arrow keys
   */
  useEffect(() => {
    slideNavRef.current.addEventListener('keydown', handleSlideNavigation);

    // useEffect returns a cleanup function which executes upon dependency changes
    // or upon unmounting of the component/page
    return () =>
      slideNavRef.current.removeEventListener('keydown', handleSlideNavigation);
  }, [handleSlideNavigation]);

  if (loading) return <Spinner></Spinner>;

  return (
    <PreviewContainer>
      <AppNavBar />
      <PreviewMain>
        {currSlideIndex > 0
          ? (
          <SlideNavigationBtn
            onClick={handleSlideNavigationLeft}
            className="bg-dark text-white"
          >
            {'<'}
          </SlideNavigationBtn>
            )
          : (
          <SlideNavigationFiller />
            )}
        <PreviewSlideDisplay
          variant={'dark'}
          slide={true}
          indicators={false}
          controls={false}
          wrap={false}
          interval={null}
          activeIndex={currSlideIndex}
          onSelect={(index) => setCurrSlideIndex(index)}
        >
          {slides}
        </PreviewSlideDisplay>
        {currSlideIndex < slides.length - 1
          ? (
          <SlideNavigationBtn
            onClick={handleSlideNavigationRight}
            className="bg-dark text-white"
          >
            {'>'}
          </SlideNavigationBtn>
            )
          : (
          <SlideNavigationFiller />
            )}
      </PreviewMain>
    </PreviewContainer>
  );
};

export default Preview;

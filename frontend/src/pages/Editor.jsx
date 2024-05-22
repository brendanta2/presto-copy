import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import AppNavBar from '../components/Navbar';
import Slide from '../components/Slide';
import ThumbnailOffCanvas from '../components/ThumbnailOffCanvas';
import EditIconImg from '../assets/editing.png';
import EditIconInvertImg from '../assets/editingHover.png';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Carousel from 'react-bootstrap/Carousel';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  LOCAL_HOST,
  STORE_PATH,
  FORM_CODE_CREATE,
  FORM_TEXT_CREATE,
  FORM_IMAGE_CREATE,
  FORM_ELEMENT_EDIT,
  FORM_VIDEO_CREATE,
  FORM_BACKGROUND_EDIT,
  TEXT_ELEMENT
} from '../utils/constants';
import { setCSSBackground } from '../utils/helpers';
import { AppContext } from '../contexts/AppContext';
import styled from 'styled-components';
import TextboxFormModal from '../components/Modal/TextboxFormModal';
import ImageFormModal from '../components/Modal/ImageFormModal';
import CodeFormModal from '../components/Modal/CodeFormModal';
import SlideElement from '../components/SlideElement';
import VideoFormModal from '../components/Modal/VideoFormModal';
import BackgroundFormModal from '../components/Modal/BackgroundFormModal';
import FontSelect from '../components/FontSelect';
import SlideRearrange from '../components/SlideRearrange';
import { useMediaQuery } from 'react-responsive';

const EditorContainer = styled.div`
  display: flex;
  height: 100vh;
  flex-direction: column;
`;

const EditorMainWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  flex-grow: 2;
`;

const EditorAside = styled.aside`
  padding: 25px;
  background-color: #f1f1f1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
`;

const EditorAsideControlsContainer = styled.div`
  width: 100%;
  display: grid;
  gap: 10px;
`;

const EditorMain = styled.main`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  background-color: #f1f1f1;
  position: relative;
  padding: 15px;
`;

const EditorMainHeader = styled.div`
  position: absolute;
  left: 60px;
  top: 15px;
  display: flex;
  align-items: center;
`;

const EditorMainToggleAside = styled(Button)`
  position: absolute;
  left: -50px;
  top: 0;
`;

const EditorTitle = styled.h4`
  color: black;
  margin: 0;
  margin-right: 10px;
  font-size: 1.25rem;
`;

const EditIcon = styled.img`
  width: 20px;
  height: 20px;
  cursor: pointer;
`;

const StyledModalTitle = styled(Modal.Title)`
  text-align: center;
`;

const StyledModalFooter = styled(Modal.Footer)`
  display: flex;
  justify-content: center;
`;

const EditorSlideDisplay = styled(Carousel)`
  width: 95%;
  height: 90%;
  position: relative;
`;

const EditorSlideNumber = styled.div`
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
 * Editor page that allows the user to edit their presentations.
 */
const Editor = () => {
  const { token, store, setStore, loading } = useContext(AppContext);

  const params = useParams();
  const navigate = useNavigate();

  const [showOffCanvas, setShowOffCanvas] = useState(false);
  const [showSlideRearrange, setShowSlideRearrange] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [storeLoading, setStoreLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditTitleModal, setShowEditTitleModal] = useState(false);
  const [currEditIcon, setCurrEditIcon] = useState(EditIconImg);
  const [currSlideIndex, setCurrSlideIndex] = useState(parseInt(params.sId));
  const [showFormType, setShowFormType] = useState('');
  const [fontSelectionEnabled, setFontSelectionEnabled] = useState([]);
  const isMobile = useMediaQuery({ query: '(max-width: 500px)' });
  const [showAside, setShowAside] = useState(true);

  const initialSlideIndex = useRef(parseInt(params.sId));
  const slideNavRef = useRef(document);
  const slideRef = useRef(null);
  const fontSelectorRef = useRef(null);
  const presNameInput = useRef();
  const currPresId = parseInt(params.pId);

  const currPresentation = useMemo(
    () => store?.presentations?.find((pres) => pres.id === currPresId),
    [store, loading]
  );

  /**
   * useEffect hook to reset the fontSelectionEnabled array when the current presentation changes.
   *
   * This is necessary because the fontSelectionEnabled array is used to keep track of which text elements
   * are currently selected for font changes. When the current presentation changes, the fontSelectionEnabled
   * array should be reset to reflect the new text elements in the new presentation.
   */
  useEffect(() => {
    setFontSelectionEnabled(
      currPresentation?.slides.reduce(
        (acc, slide) =>
          acc.concat(
            slide.elements.map((element) => {
              return { id: element.id, slideId: slide.id, enabled: false };
            })
          ),
        []
      )
    );
  }, [currPresentation]);

  const selectedElementId = useMemo(
    () => fontSelectionEnabled?.find((item) => item.enabled)?.id,
    [fontSelectionEnabled]
  );

  let displayTitle;
  if (!currPresentation) {
    displayTitle = null;
  } else if (isMobile) {
    displayTitle =
      currPresentation.name.length > 25
        ? `${currPresentation.name.slice(0, 25)}...`
        : currPresentation.name;
  } else {
    displayTitle =
      currPresentation.name.length > 35
        ? `${currPresentation.name.slice(0, 35)}...`
        : currPresentation.name;
  }

  /**
   * Function called when user confirms deletion of presentation which removes the presentation from the store
   * and sends user back to the dashboard.
   */
  const handleDeletePres = async () => {
    setStoreLoading(true);
    // using presId, remove presentation from store using setStore and use a put /store/ API call to remove it on server
    const index = store.presentations.findIndex(
      (pres) => pres.id === currPresId
    );
    store.presentations.splice(index, 1);

    try {
      await axios.put(
        LOCAL_HOST + STORE_PATH,
        { store },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setStore({ ...store });
      setStoreLoading(false);
      navigate('/dashboard');
    } catch (err) {
      setErrorMessage('Invalid token for user. Please refresh.');
      setStoreLoading(false);
    }
  };

  /**
   * Function called when user confirms editing of presentation name which updates the name of the presentation
   */
  const handleEditTitle = async () => {
    if (!presNameInput.current.value) {
      setErrorMessage('Name cannot be empty!');
      return;
    }

    setStoreLoading(true);
    currPresentation.name = presNameInput.current.value;

    try {
      await axios.put(
        LOCAL_HOST + STORE_PATH,
        { store },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setStore({ ...store });
      setStoreLoading(false);
      setShowEditTitleModal(false);
    } catch (err) {
      setErrorMessage('Invalid token for user. Please refresh.');
      setStoreLoading(false);
    }
  };

  /**
   * Function called when user clicks the "+ New Slide" button which creates a new slide in the current presentation
   */
  const handleCreateSlide = async () => {
    currPresentation.slides.push({
      id: currPresentation.slidesIdCounter++,
      elements: [],
      elementsIdCounter: 0,
      background: null
    });

    try {
      await axios.put(
        LOCAL_HOST + STORE_PATH,
        { store },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setStore({ ...store });
      setStoreLoading(false);
    } catch (err) {
      setErrorMessage('Invalid token for user. Please refresh.');
      setStoreLoading(false);
    }
  };

  /**
   * Function called when user clicks the "- Remove Slide" button which removes the current slide from the presentation.
   * If the current slide is the last slide in the presentation, the user is prompted to delete the entire presentation.
   */
  const handleDeleteSlide = async () => {
    const originalSize = currPresentation.slides.length;

    if (originalSize === 1) {
      setErrorMessage(
        'Attempting to delete the last slide, do you want to delete the presentation?'
      );
      setShowDeleteModal(true);
      return;
    }

    currPresentation.slides.splice(currSlideIndex, 1);

    try {
      await axios.put(
        LOCAL_HOST + STORE_PATH,
        { store },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setStore({ ...store });
      setStoreLoading(false);
      if (currSlideIndex === originalSize - 1) {
        setCurrSlideIndex(currSlideIndex - 1);
      }
    } catch (err) {
      setErrorMessage('Invalid token for user. Please refresh.');
      setStoreLoading(false);
    }
  };

  /**
   * Function to prevent the dismissal of the font selection dropdown when clicking on the font
   * selection dropdown itself.
   */
  const preventDismissalClickSelector = (e) => {
    if (fontSelectorRef.current?.contains(e?.target)) {
      return true;
    }
    return false;
  };

  /**
   * Function to handle the enabling/disabling of the font selection dropdown for text elements
   * by updating the fontSelectionEnabled array.
   *
   * @param {number} id
   * @param {boolean} enabled
   * @param {number} slideId
   */
  const handleElementClick = (id, enabled, slideId) => {
    const slide = currPresentation?.slides.find(
      (slide) => slide.id === slideId
    );
    const element = slide?.elements.find((element) => element.id === id);
    if (element?.type === TEXT_ELEMENT) {
      const index = fontSelectionEnabled.findIndex(
        (item) => item.id === id && item.slideId === slideId
      );
      if (index !== -1) {
        setFontSelectionEnabled((prev) => {
          return prev.map((item, i) => {
            if (i === index) {
              return { ...item, enabled };
            } else {
              return item;
            }
          });
        });
      }
    }
  };

  const slides = useMemo(() => {
    if (currPresentation) {
      return currPresentation.slides.map((slide, index) => (
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
                  broadcastModalOpen={() => setShowFormType(FORM_ELEMENT_EDIT)}
                  broadcastModalClose={() => setShowFormType('')}
                  slideIndexOverhead={initialSlideIndex.current === index}
                  updateFontSelectionEnabled={(enabled) =>
                    handleElementClick(element.id, enabled, slide.id)
                  }
                  setFontSelectionEnabled={() =>
                    setFontSelectionEnabled((prev) =>
                      prev.filter((item) => {
                        if (
                          item.id === element.id &&
                          item.slideId === currSlideIndex
                        ) {
                          return false;
                        }
                        return true;
                      })
                    )
                  }
                  preventDismissalClickSelector={preventDismissalClickSelector}
                  ref={slideRef}
                />
              );
            })}
          </Slide>
          <EditorSlideNumber>{index + 1}</EditorSlideNumber>
        </Carousel.Item>
      ));
    }
    return <></>;
  }, [
    store,
    currSlideIndex,
    showFormType,
    showEditTitleModal,
    fontSelectionEnabled
  ]);

  /**
   * Function called when user clicks the left arrow to navigate to the previous slide
   */
  const handleSlideNavigationLeft = useCallback(() => {
    const newIndex =
      currSlideIndex - 1 < 0 ? currSlideIndex : currSlideIndex - 1;
    setCurrSlideIndex(newIndex);
    navigate(`/edit/${currPresId}/${newIndex}`, {
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
    navigate(`/edit/${currPresId}/${newIndex}`, {
      replace: true
    });
  }, [currPresentation, currSlideIndex]);

  /**
   * Function called when user presses the left or right arrow key to navigate between slides
   */
  const handleSlideNavigation = useCallback(
    (e) => {
      if (showEditTitleModal || !!showFormType) return;

      if (e.key === 'ArrowRight') {
        const newIndex =
          currSlideIndex + 1 >= currPresentation.slides.length
            ? currSlideIndex
            : currSlideIndex + 1;
        setCurrSlideIndex(newIndex);
        navigate(`/edit/${currPresId}/${newIndex}`, {
          replace: true
        });
      } else if (e.key === 'ArrowLeft') {
        const newIndex =
          currSlideIndex - 1 < 0 ? currSlideIndex : currSlideIndex - 1;
        setCurrSlideIndex(newIndex);
        navigate(`/edit/${currPresId}/${newIndex}`, {
          replace: true
        });
      }
    },
    [currPresentation, showFormType, showEditTitleModal, currSlideIndex]
  );

  /**
   * useEffect hook to add event listener for keydown events to navigate between slides
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
    <EditorContainer>
      <AppNavBar />
      <EditorMainWrapper>
        {showAside && (
          <EditorAside>
            <EditorAsideControlsContainer>
              <Link
                to={`/preview/${currPresId}/0`}
                target="_blank"
                rel="noopener"
              >
                <Button variant="success" size="sm">
                  Preview presentation
                </Button>
              </Link>
            </EditorAsideControlsContainer>
            <EditorAsideControlsContainer>
              <Button
                variant="warning"
                size="sm"
                onClick={() => setShowOffCanvas(true)}
              >
                Set Thumbnail
              </Button>

              <Button variant="dark" size="sm" onClick={handleCreateSlide}>
                + New Slide
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={handleDeleteSlide}
              >
                - Remove Slide
              </Button>
            </EditorAsideControlsContainer>
            <EditorAsideControlsContainer>
              <FontSelect
                selectedElementId={selectedElementId}
                slide={currPresentation?.slides[currSlideIndex]}
                ref={fontSelectorRef}
              />
            </EditorAsideControlsContainer>
            <EditorAsideControlsContainer>
              <Button
                variant="outline-dark"
                size="sm"
                onClick={() => setShowFormType(FORM_BACKGROUND_EDIT)}
              >
                Slide Background
              </Button>
              <Button
                variant="outline-dark"
                size="sm"
                onClick={() => setShowFormType(FORM_TEXT_CREATE)}
              >
                + Textbox
              </Button>
              <Button
                variant="outline-dark"
                size="sm"
                onClick={() => setShowFormType(FORM_IMAGE_CREATE)}
              >
                + Image
              </Button>
              <Button
                variant="outline-dark"
                size="sm"
                onClick={() => setShowFormType(FORM_VIDEO_CREATE)}
              >
                + Video
              </Button>
              <Button
                variant="outline-dark"
                size="sm"
                onClick={() => setShowFormType(FORM_CODE_CREATE)}
              >
                {'</> Code'}
              </Button>
            </EditorAsideControlsContainer>
            <EditorAsideControlsContainer>
              <Button
                size="sm"
                variant="outline-dark"
                onClick={() => setShowSlideRearrange(true)}
              >
                Rearrange Slides
              </Button>
            </EditorAsideControlsContainer>
            <EditorAsideControlsContainer>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                Back
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete Presentation
              </Button>
            </EditorAsideControlsContainer>
          </EditorAside>
        )}
        <TextboxFormModal
          showForm={showFormType === FORM_TEXT_CREATE}
          onHide={() => setShowFormType('')}
          slide={currPresentation?.slides[currSlideIndex]}
          updateTextboxFlag={() => {
            setFontSelectionEnabled((prev) => [
              ...prev,
              {
                id:
                  currPresentation.slides[currSlideIndex].elementsIdCounter - 1,
                slideId: currPresentation.slides[currSlideIndex].id,
                enabled: false
              }
            ]);
          }}
        />
        <ImageFormModal
          showForm={showFormType === FORM_IMAGE_CREATE}
          onHide={() => setShowFormType('')}
          slide={currPresentation?.slides[currSlideIndex]}
        />
        <VideoFormModal
          showForm={showFormType === FORM_VIDEO_CREATE}
          onHide={() => setShowFormType('')}
          slide={currPresentation?.slides[currSlideIndex]}
        />
        <CodeFormModal
          showForm={showFormType === FORM_CODE_CREATE}
          onHide={() => setShowFormType('')}
          slide={currPresentation?.slides[currSlideIndex]}
        />
        <BackgroundFormModal
          showForm={showFormType === FORM_BACKGROUND_EDIT}
          onHide={() => setShowFormType('')}
          slide={currPresentation?.slides[currSlideIndex]}
          defaultBackground={currPresentation?.defaultBackground}
        />
        <Modal
          show={showDeleteModal}
          onHide={() => {
            setShowDeleteModal(false);
            setErrorMessage('');
          }}
          size="md"
          aria-labelledby="delete-presentation-modal"
          centered
        >
          <Modal.Body>
            <StyledModalTitle>Delete this presentation?</StyledModalTitle>
            {!!errorMessage && (
              <Alert
                variant="danger"
                onClose={() => setErrorMessage('')}
                dismissible
              >
                {errorMessage}
              </Alert>
            )}
          </Modal.Body>
          <StyledModalFooter>
            <Button
              variant="danger"
              onClick={handleDeletePres}
              disabled={storeLoading}
            >
              {storeLoading
                ? (
                <Spinner animation="border" role="status" />
                  )
                : (
                    'Yes'
                  )}
            </Button>
            <Button variant="dark" onClick={() => setShowDeleteModal(false)}>
              No
            </Button>
          </StyledModalFooter>
        </Modal>
        <EditorMain>
          <EditorMainHeader>
            <EditorMainToggleAside
              size="sm"
              variant="outline-dark"
              onClick={() => setShowAside((prev) => !prev)}
            >
              {showAside ? '<<' : '>>'}
            </EditorMainToggleAside>
            <EditorTitle>{currPresentation && displayTitle}</EditorTitle>
            <EditIcon
              src={currEditIcon}
              alt="Edit Title Icon"
              onClick={() => setShowEditTitleModal(true)}
              onMouseOut={() => setCurrEditIcon(EditIconImg)}
              onMouseOver={() => setCurrEditIcon(EditIconInvertImg)}
            />
          </EditorMainHeader>
          <Modal
            show={showEditTitleModal}
            onHide={() => {
              setShowEditTitleModal(false);
              setErrorMessage('');
            }}
            size="lg"
            aria-labelledby="edit-title-modal"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title id="edit-title-modal">
                Editing Presentation Name
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {!!errorMessage && (
                <Alert
                  variant="danger"
                  onClose={() => setErrorMessage('')}
                  dismissible
                >
                  {errorMessage}
                </Alert>
              )}
              <Form.Label>Presentation Name</Form.Label>
              <Form.Control
                type="text"
                defaultValue={
                  currPresentation ? currPresentation.name : 'Untitled'
                }
                autoFocus
                ref={presNameInput}
              />
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="dark"
                onClick={handleEditTitle}
                disabled={storeLoading}
              >
                {storeLoading
                  ? (
                  <Spinner animation="border" role="status" />
                    )
                  : (
                      'Update'
                    )}
              </Button>
            </Modal.Footer>
          </Modal>
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
          <EditorSlideDisplay
            variant={'dark'}
            slide={true}
            controls={false}
            wrap={false}
            interval={null}
            touch={false}
            activeIndex={currSlideIndex}
            onSelect={(index) => setCurrSlideIndex(index)}
          >
            {slides}
          </EditorSlideDisplay>
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
        </EditorMain>
        <ThumbnailOffCanvas
          show={showOffCanvas}
          onHide={() => setShowOffCanvas(false)}
          presentation={currPresentation}
        />
      </EditorMainWrapper>
      {showSlideRearrange && (
        <SlideRearrange
          slides={currPresentation.slides}
          onClose={() => setShowSlideRearrange(false)}
          currSlideIndex={currSlideIndex}
          updateCurrSlideIndex={(index) => setCurrSlideIndex(index)}
        />
      )}
    </EditorContainer>
  );
};

export default Editor;

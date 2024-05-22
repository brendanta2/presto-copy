import React, { useContext, useRef, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { AppContext } from '../../contexts/AppContext';
import {
  VIDEO_ELEMENT,
  LOCAL_HOST,
  STORE_PATH,
  ACCEPTED_VIDEO_URL
} from '../../utils/constants';
import axios from 'axios';
import ElementFormModal from './ElementFormModal';

/**
 * VideoFormModal component used to add or edit a video element in the slide.
 *
 * @param {
 *  showForm: boolean,
 *  onHide: Function,
 *  slide: Object
 *  isEditing: boolean,
 * }
 * @returns
 */
const VideoFormModal = ({
  showForm,
  onHide,
  slide,
  isEditing = false,
  ...props
}) => {
  const { token, store, setStore } = useContext(AppContext);

  const [errorMessage, setErrorMessage] = useState('');
  const [storeLoading, setStoreLoading] = useState(false);

  const heightRef = useRef();
  const widthRef = useRef();
  const videoUrlInput = useRef();
  const autoPlayRef = useRef();

  // State only used for the button text
  const [autoPlay, setAutoPlay] = useState(props?.isAutoPlay || false);

  /**
   * Function called when user submits the form to add or edit a video element which
   * makes API request to update the store and separately updates the dimensions of the
   * video if editing.
   */
  const handleVideoFormSubmit = async () => {
    const heightStr = heightRef.current.value;
    const widthStr = widthRef.current.value;
    const videoUrl = videoUrlInput.current.value;
    const isAutoPlay = autoPlayRef.current.checked;

    if (!heightStr || !widthStr || !videoUrl) {
      setErrorMessage('All fields must not be empty');
      return;
    }
    const height = parseFloat(heightStr);
    const width = parseFloat(widthStr);
    if (height < 0 || height > 100) {
      setErrorMessage('Height (%) must be between 0 and 100');
      return;
    } else if (width < 0 || width > 100) {
      setErrorMessage('Width (%) must be between 0 and 100');
      return;
    } else if (!videoUrl.startsWith(ACCEPTED_VIDEO_URL)) {
      setErrorMessage('Video URL must be from YouTube');
      return;
    }

    if (isEditing) {
      const element = slide.elements.find((element) => element.id === props.id);
      element.width = width;
      element.height = height;
      element.videoUrl = videoUrl;
      element.isAutoPlay = isAutoPlay;
    } else {
      slide.elements.push({
        id: slide.elementsIdCounter++,
        type: VIDEO_ELEMENT,
        videoUrl,
        height,
        width,
        isAutoPlay,
        posX: 0,
        posY: 0
      });
    }

    try {
      setStoreLoading(true);
      await axios.put(
        LOCAL_HOST + STORE_PATH,
        {
          store
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (isEditing) props.updateDimensions({ width, height });
      setStore({ ...store });
      setStoreLoading(false);
      onHide();
    } catch (err) {
      setErrorMessage(
        `Failed to ${isEditing ? 'edit' : 'add'} video. Please try again.`
      );
    } finally {
      setStoreLoading(false);
    }
  };

  return (
    <ElementFormModal
      showForm={showForm}
      onHide={onHide}
      isEditing={isEditing}
      storeLoading={storeLoading}
      handleFormSubmit={handleVideoFormSubmit}
      elementStr={'video'}
      elementLabel={'add-video-form-modal'}
      errorMessage={errorMessage}
      setErrorMessage={setErrorMessage}
    >
      <Form>
        <Row className="mb-3">
          <Form.Group as={Col}>
            <Form.Label>Width of video (%)</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter amount"
              ref={widthRef}
              defaultValue={props?.width}
            />
          </Form.Group>
          <Form.Group as={Col}>
            <Form.Label>Height of video (%)</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter amount"
              ref={heightRef}
              defaultValue={props?.height}
            />
          </Form.Group>
        </Row>
        <Form.Group className="mb-3">
          <Form.Label>Upload YouTube video</Form.Label>
          <Form.Control
            type="url"
            ref={videoUrlInput}
            placeholder={ACCEPTED_VIDEO_URL}
            defaultValue={props?.videoUrl}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Auto-play?</Form.Label>
          <Form.Check
            type="switch"
            defaultChecked={props?.isAutoPlay}
            ref={autoPlayRef}
            onChange={(e) => {
              setAutoPlay(e.target.checked);
            }}
          />
          <Form.Text>
            {autoPlay
              ? 'Will play automatically when presenting'
              : 'Will not auto-play'}
          </Form.Text>
        </Form.Group>
      </Form>
    </ElementFormModal>
  );
};

export default VideoFormModal;

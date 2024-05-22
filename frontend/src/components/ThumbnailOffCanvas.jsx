import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Form,
  Image,
  Offcanvas,
  Spinner
} from 'react-bootstrap';
import styled from 'styled-components';
import axios from 'axios';
import { LOCAL_HOST, STORE_PATH } from '../utils/constants';
import { AppContext } from '../contexts/AppContext';
import { fileToDataUrl } from '../utils/helpers';

const StyledOffCanvasBody = styled(Offcanvas.Body)`
  display: flex;
  flex-direction: column;
`;

const DefaultThumbnail = styled.div`
  width: 100%;
  height: 20%;
  background-color: gray;
  border-radius: 10px;
`;

const ThumbnailFormWrapper = styled.div`
  margin: 20px 0;
`;

const ThumbnailSubmitBtn = styled(Button)`
  width: 100px;
`;

const ThumbnailDisplayImage = styled(Image)`
  border-radius: 10px;
  width: 100%;
  height: 20%;
  object-fit: cover;
`;

/**
 * OffCanvas component to allow users to set a thumbnail for a presentation
 */
const ThumbnailOffCanvas = ({ show, onHide, presentation }) => {
  const { token, store, setStore } = useContext(AppContext);
  const [storeLoading, setStoreLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const thumbnailFileInput = useRef();
  const [currThumbnail, setCurrThumbnail] = useState(
    presentation ? presentation.thumbnail : null
  );

  /**
   * Update the displayed thumbnail when the presentation changes
   */
  useEffect(() => {
    setCurrThumbnail(presentation ? presentation.thumbnail : null);
  }, [presentation]);

  /**
   * Function called when the user uploads a thumbnail image before submitting
   * to display the image in the offcanvas
   */
  const handleDisplayThumbnail = async () => {
    const files = thumbnailFileInput.current.files;
    if (files.length === 0) {
      setCurrThumbnail(presentation.thumbnail);
      return;
    }

    const url = await fileToDataUrl(files[0]);
    setCurrThumbnail(url);
  };

  /**
   * Function called when the user submits the new thumbnail which updates the store
   * and hides the offcanvas
   */
  const handleUpdateThumbnail = async () => {
    if (!currThumbnail) {
      setErrorMessage('No image set!');
      return;
    }

    setStoreLoading(true);
    const currPres = store.presentations
      ? store.presentations.find((p) => p.id === presentation.id)
      : null;
    currPres.thumbnail = currThumbnail;

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
      onHide();
      setErrorMessage('');
    } catch (err) {
      setErrorMessage('Invalid token for user. Please refresh.');
      setStoreLoading(false);
    }
  };

  return (
    <Offcanvas
      show={show}
      onHide={() => {
        onHide();
        setErrorMessage('');
      }}
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Current Thumbnail</Offcanvas.Title>
      </Offcanvas.Header>
      <StyledOffCanvasBody>
        {!!errorMessage && (
          <Alert
            variant="danger"
            onClose={() => setErrorMessage('')}
            dismissible
          >
            {errorMessage}
          </Alert>
        )}
        {currThumbnail
          ? (
          <ThumbnailDisplayImage
            src={currThumbnail}
            alt="Displayed Thumbnail"
            fluid
          />
            )
          : (
          <DefaultThumbnail />
            )}
        <ThumbnailFormWrapper>
          <Form.Label visuallyHidden>Set New Thumbnail!</Form.Label>
          <Form.Control
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            ref={thumbnailFileInput}
            onChange={handleDisplayThumbnail}
          />
        </ThumbnailFormWrapper>
        <ThumbnailSubmitBtn
          variant="warning"
          onClick={handleUpdateThumbnail}
          disabled={storeLoading}
        >
          {storeLoading
            ? (
            <Spinner animation="border" role="status" />
              )
            : (
                'Submit'
              )}
        </ThumbnailSubmitBtn>
      </StyledOffCanvasBody>
    </Offcanvas>
  );
};

export default ThumbnailOffCanvas;

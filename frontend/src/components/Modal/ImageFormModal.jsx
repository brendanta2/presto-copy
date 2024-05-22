import React, { useContext, useRef, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { AppContext } from '../../contexts/AppContext';
import { IMAGE_ELEMENT, LOCAL_HOST, STORE_PATH } from '../../utils/constants';
import axios from 'axios';
import { fileToDataUrl } from '../../utils/helpers';
import ElementFormModal from './ElementFormModal';

/**
 * ImageFormModal component used to add or edit an image element in the slide.
 *
 * @param {
 *  showForm: boolean,
 *  onHide: Function,
 *  slide: Object
 *  isEditing: boolean,
 * }
 * @returns
 */
const ImageFormModal = ({
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
  const imageFileInput = useRef();
  const descriptionRef = useRef();

  /**
   * Function called when user submits the form to add or edit an image element
   * which sends API request to update the store and separately updates the dimensions
   * of the image if editing.
   */
  const handleImageFormSubmit = async () => {
    const heightStr = heightRef.current.value;
    const widthStr = widthRef.current.value;
    const files = imageFileInput.current.files;
    const description = descriptionRef.current.value;

    // If editing, assume user wants to keep the same image if they don't upload a new one
    if (
      !heightStr ||
      !widthStr ||
      (files.length === 0 && !isEditing) ||
      !description
    ) {
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
    }

    const url = files.length !== 0 ? await fileToDataUrl(files[0]) : null;

    if (isEditing) {
      const element = slide.elements.find((element) => element.id === props.id);
      element.width = width;
      element.height = height;
      element.description = description;
      if (url) {
        element.image = url;
      }
    } else {
      slide.elements.push({
        id: slide.elementsIdCounter++,
        type: IMAGE_ELEMENT,
        image: url,
        height,
        width,
        description,
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
        `Failed to ${isEditing ? 'edit' : 'add'} image. Please try again.`
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
      handleFormSubmit={handleImageFormSubmit}
      elementStr={'image'}
      elementLabel={'add-image-form-modal'}
      errorMessage={errorMessage}
      setErrorMessage={setErrorMessage}
    >
      <Form>
        <Row className="mb-3">
          <Form.Group as={Col}>
            <Form.Label>Width of image (%)</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter amount"
              ref={widthRef}
              defaultValue={props?.width}
            />
          </Form.Group>
          <Form.Group as={Col}>
            <Form.Label>Height of image (%)</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter amount"
              ref={heightRef}
              defaultValue={props?.height}
            />
          </Form.Group>
        </Row>
        <Form.Group className="mb-3">
          <Form.Label>Upload Image</Form.Label>
          <Form.Control
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            ref={imageFileInput}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter description"
            ref={descriptionRef}
            defaultValue={props?.description}
          />
        </Form.Group>
      </Form>
    </ElementFormModal>
  );
};

export default ImageFormModal;

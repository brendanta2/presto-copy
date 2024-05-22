import React, { useContext, useRef, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { AppContext } from '../../contexts/AppContext';
import { CODE_ELEMENT, LOCAL_HOST, STORE_PATH } from '../../utils/constants';
import axios from 'axios';
import ElementFormModal from './ElementFormModal';

/**
 * CodeFormModal component used to add or edit a code element in the slide.
 *
 * @param {
 *  showForm: boolean,
 *  onHide: Function,
 *  slide: Object
 *  isEditing: boolean,
 * }
 * @returns
 */
const CodeFormModal = ({
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
  const codeRef = useRef();
  const fontSizeRef = useRef();

  /**
   * Function called when user submits the form to add or edit a code element which
   * makes API request to update the store and separately updates the dimensions of the
   * code block if editing.
   */
  const handleCodeFormSubmit = async () => {
    const heightStr = heightRef.current.value;
    const widthStr = widthRef.current.value;
    const code = codeRef.current.value;
    const fontSizeStr = fontSizeRef.current.value;
    if (!heightStr || !widthStr || !code || !fontSizeStr) {
      setErrorMessage('All fields must not be empty!');
      return;
    }
    const height = parseFloat(heightStr);
    const width = parseFloat(widthStr);
    const fontSize = parseFloat(fontSizeStr);
    if (width < 0 || width > 100) {
      setErrorMessage('Width (%) must be between 0 and 100.');
      return;
    } else if (height < 0 || height > 100) {
      setErrorMessage('Height (%) must be between 0 and 100.');
      return;
    } else if (fontSize < 0) {
      setErrorMessage('Font size must be a positive value.');
      return;
    }

    if (isEditing) {
      const element = slide.elements.find((element) => element.id === props.id);
      element.width = width;
      element.height = height;
      element.displayText = code;
      element.fontSize = fontSize;
    } else {
      setStoreLoading(true);
      slide.elements.push({
        id: slide.elementsIdCounter++,
        type: CODE_ELEMENT,
        height,
        width,
        displayText: code,
        fontSize,
        posX: 0,
        posY: 0
      });
    }

    try {
      setStoreLoading(true);
      await axios.put(
        LOCAL_HOST + STORE_PATH,
        { store },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (isEditing) props.updateDimensions({ width, height });
      setStoreLoading(false);
      setStore({ ...store });
      onHide();
    } catch (error) {
      setErrorMessage(
        `Failed to ${isEditing ? 'edit' : 'add'} code block. Please try again.`
      );
      setStoreLoading(false);
    }
  };

  return (
    <ElementFormModal
      showForm={showForm}
      onHide={onHide}
      isEditing={isEditing}
      storeLoading={storeLoading}
      handleFormSubmit={handleCodeFormSubmit}
      elementStr={'code block'}
      elementLabel={'create-code-form-modal'}
      errorMessage={errorMessage}
      setErrorMessage={setErrorMessage}
    >
      <Form>
        <Row className="mb-3">
          <Form.Group as={Col}>
            <Form.Label>Width of code block (%)</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter amount"
              ref={widthRef}
              defaultValue={props?.width}
            />
          </Form.Group>
          <Form.Group as={Col}>
            <Form.Label>Height of code block (%)</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter amount"
              ref={heightRef}
              defaultValue={props?.height}
            />
          </Form.Group>
          <Form.Group as={Col}>
            <Form.Label>Text font size (em)</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter amount"
              ref={fontSizeRef}
              defaultValue={props?.fontSize}
            />
          </Form.Group>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Code</Form.Label>
          <Form.Control
            as="textarea"
            placeholder="Enter code"
            ref={codeRef}
            defaultValue={props?.displayText}
          />
        </Form.Group>
      </Form>
    </ElementFormModal>
  );
};

export default CodeFormModal;

import React, { useContext, useRef, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { AppContext } from '../../contexts/AppContext';
import axios from 'axios';
import {
  DEFAULT_FONT,
  LOCAL_HOST,
  STORE_PATH,
  TEXT_ELEMENT
} from '../../utils/constants';
import ElementFormModal from './ElementFormModal';

/**
 * TextboxFormModal component used to add or edit a textbox element in the slide.
 *
 * @param {
 *  showForm: boolean,
 *  onHide: Function,
 *  slide: Object
 *  isEditing: boolean,
 * }
 * @returns
 */
const TextboxFormModal = ({
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
  const textRef = useRef();
  const fontSizeRef = useRef();
  const colorRef = useRef();

  /**
   * Function called when user submits the form to add or edit a textbox element
   * which makes API request and separately updates the textbox dimensions if editing.
   */
  const handleInteractTextbox = async () => {
    const heightStr = heightRef.current.value;
    const widthStr = widthRef.current.value;
    const text = textRef.current.value;
    const fontSizeStr = fontSizeRef.current.value;
    const color = colorRef.current.value;
    if (!heightStr || !widthStr || !text || !fontSizeStr || !color) {
      setErrorMessage('All fields must not be empty');
      return;
    }
    const height = parseFloat(heightStr);
    const width = parseFloat(widthStr);
    const fontSize = parseFloat(fontSizeStr);
    if (height < 0 || height > 100) {
      setErrorMessage('Height (%) must be between 0 and 100');
      return;
    } else if (width < 0 || width > 100) {
      setErrorMessage('Width (%) must be between 0 and 100');
      return;
    } else if (fontSize < 0) {
      setErrorMessage('Font size must be a positive value');
      return;
    }
    if (isEditing) {
      const element = slide.elements.find((element) => element.id === props.id);
      element.width = width;
      element.height = height;
      element.displayText = text;
      element.fontSize = fontSize;
      element.color = color;
    } else {
      slide.elements.push({
        id: slide.elementsIdCounter++,
        type: TEXT_ELEMENT,
        height,
        width,
        displayText: text,
        fontSize,
        color,
        posX: 0,
        posY: 0,
        font: DEFAULT_FONT
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
      if (isEditing) {
        props.updateDimensions({ width, height });
      } else {
        props.updateTextboxFlag();
      }
      setStore({ ...store });
      setStoreLoading(false);
      onHide();
    } catch (err) {
      setErrorMessage(
        `Failed to ${isEditing ? 'edit' : 'add'} textbox. Please try again.`
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
      handleFormSubmit={handleInteractTextbox}
      elementStr={'textbox'}
      elementLabel={'create-textbox-form-modal'}
      errorMessage={errorMessage}
      setErrorMessage={setErrorMessage}
    >
      <Form>
        <Row className="mb-3">
          <Form.Group as={Col}>
            <Form.Label>Width of textbox (%)</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter amount"
              ref={widthRef}
              defaultValue={props?.width}
            />
          </Form.Group>
          <Form.Group as={Col}>
            <Form.Label>Height of textbox (%)</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter amount"
              ref={heightRef}
              defaultValue={props?.height}
            />
          </Form.Group>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Text</Form.Label>
          <Form.Control
            as="textarea"
            placeholder="Enter text"
            ref={textRef}
            defaultValue={props?.displayText}
          />
        </Form.Group>

        <Row className="mb-3">
          <Form.Group as={Col}>
            <Form.Label>Text font size (em)</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter amount"
              ref={fontSizeRef}
              defaultValue={props?.fontSize}
            />
          </Form.Group>
          <Form.Group as={Col}>
            <Form.Label>Text color</Form.Label>
            <Form.Control
              type="color"
              placeholder="Enter value"
              defaultValue={props?.color || '#0000000'}
              ref={colorRef}
            />
          </Form.Group>
        </Row>
      </Form>
    </ElementFormModal>
  );
};

export default TextboxFormModal;

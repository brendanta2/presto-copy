import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Col,
  Modal,
  Form,
  Row,
  Spinner,
  Tab,
  Tabs
} from 'react-bootstrap';
import { AppContext } from '../../contexts/AppContext';
import axios from 'axios';
import {
  LOCAL_HOST,
  STORE_PATH,
  BACKGND_TYPE_COLOR,
  BACKGND_TYPE_GRADIENT
} from '../../utils/constants';
import { isSameGradient } from '../../utils/helpers';
import styled from 'styled-components';

const BackgroundModalFooter = styled(Modal.Footer)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

/**
 * BackgroundFormModal component used to change the background of the slide.
 * Takes in either a set gradient or a set color as the background and can be set
 * as the default background for all slides.
 *
 * @param {
 *  showForm: boolean,
 *  onHide: Function,
 *  slide: Object,
 *  defaultBackground: Object
 * }
 * @returns
 */
const BackgroundFormModal = ({
  showForm,
  onHide,
  slide,
  defaultBackground
}) => {
  // In the case where the slide is deleted to avoid reading properties from null values
  if (!slide || !defaultBackground) {
    return <></>;
  }

  const { token, store, setStore } = useContext(AppContext);

  const [errorMessage, setErrorMessage] = useState('');
  const [storeLoading, setStoreLoading] = useState(false);

  const background = slide.background;

  // backgroundType specifies if the current slide uses gradient or color as the background
  const [backgroundType, setBackgroundType] = useState(BACKGND_TYPE_COLOR);

  // submitKey specifies which background type the user wants to use when updating the background
  const [submitKey, setSubmitKey] = useState(backgroundType);

  /**
   * useEffect hook to set the background type and the submit key
   */
  useEffect(() => {
    if (background) {
      setBackgroundType(
        background.isGradient ? BACKGND_TYPE_GRADIENT : BACKGND_TYPE_COLOR
      );
      setSubmitKey(
        background.isGradient ? BACKGND_TYPE_GRADIENT : BACKGND_TYPE_COLOR
      );
    } else {
      setBackgroundType(
        defaultBackground.isGradient
          ? BACKGND_TYPE_GRADIENT
          : BACKGND_TYPE_COLOR
      );
      setSubmitKey(
        defaultBackground.isGradient
          ? BACKGND_TYPE_GRADIENT
          : BACKGND_TYPE_COLOR
      );
    }
  }, [slide, defaultBackground, store]);

  /**
   * useEffect hook to set the gradient direction when the background type is gradient
   */
  useEffect(() => {
    if (backgroundType === BACKGND_TYPE_GRADIENT) {
      setGradientDirection(
        background
          ? background.gradientDirection
          : defaultBackground.gradientDirection
      );
    }
  }, [backgroundType, slide, defaultBackground]);

  const colorRef = useRef();
  const setDefaultRef = useRef();
  const gradientColor1Ref = useRef();
  const gradientColor2Ref = useRef();
  const [gradientDirection, setGradientDirection] = useState('top-bottom');

  /**
   * Function called when user submits the form to change the background to a color
   */
  const handleColorFormSubmit = async () => {
    const color = colorRef.current.value;
    const setDefault = setDefaultRef.current.checked;

    // 1. User did not set default but the color is the same as background
    // 2. User set default but the color is the same as default
    if (!setDefault && color === background?.color) {
      setErrorMessage('Set a new colour as background!');
      return;
    } else if (setDefault && color === defaultBackground.color) {
      setErrorMessage('Set a new colour as default background!');
      return;
    }

    // coded differently since I don't want to reassign defaultBackground
    if (setDefault) {
      defaultBackground.isGradient = false;
      defaultBackground.color = color;

      // Set specific background to nothing to match the theme
      slide.background = null;
    } else {
      slide.background = {
        isGradient: false,
        color
      };
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
      setStore({ ...store });
      setErrorMessage('');
      onHide();
      setBackgroundType(BACKGND_TYPE_COLOR);
    } catch (err) {
      setErrorMessage('Failed to change the background. Please try again.');
    } finally {
      setStoreLoading(false);
    }
  };

  /**
   * Function called when user submits the form to change the background to a gradient
   */
  const handleGradientFormSubmit = async () => {
    const gradientColor1 = gradientColor1Ref.current.value;
    const gradientColor2 = gradientColor2Ref.current.value;
    const setDefault = setDefaultRef.current.checked;

    // 1. User did not set default but the gradient is the same as the current background
    // 2. User set default but gradient is the same as default
    if (
      !setDefault &&
      isSameGradient(
        {
          gradientColor1,
          gradientColor2,
          gradientDirection
        },
        background
      )
    ) {
      setErrorMessage('Set a new gradient as background!');
      return;
    } else if (
      setDefault &&
      isSameGradient(
        {
          gradientColor1,
          gradientColor2,
          gradientDirection
        },
        defaultBackground
      )
    ) {
      setErrorMessage('Set a new gradient as default background!');
      return;
    }

    // coded differently since I don't want to reassign defaultBackground
    if (setDefault) {
      defaultBackground.isGradient = true;
      defaultBackground.gradientColor1 = gradientColor1;
      defaultBackground.gradientColor2 = gradientColor2;
      defaultBackground.gradientDirection = gradientDirection;

      // Set specific background to nothing to match the theme
      slide.background = null;
    } else {
      slide.background = {
        isGradient: true,
        gradientColor1,
        gradientColor2,
        gradientDirection
      };
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
      setBackgroundType(BACKGND_TYPE_GRADIENT);
      setStore({ ...store });
      setErrorMessage('');
      onHide();
    } catch (err) {
      setErrorMessage('Failed to change the background. Please try again.');
    } finally {
      setStoreLoading(false);
    }
  };

  return (
    <Modal
      show={showForm}
      aria-labelledby={'edit-slide-background'}
      onHide={onHide}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id={'edit-slide-background'}>
          Change slide background
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
        <Tabs
          activeKey={submitKey}
          id="background-theme-tabs"
          className="mb-3"
          onSelect={(k) => {
            setSubmitKey(k);
          }}
        >
          <Tab eventKey="color" title="Colour">
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Background colour</Form.Label>
                <Form.Control
                  type="color"
                  placeholder="Enter value"
                  defaultValue={
                    backgroundType === BACKGND_TYPE_COLOR
                      ? background?.color || defaultBackground.color
                      : '#ffffff'
                  }
                  ref={colorRef}
                />
              </Form.Group>
            </Form>
          </Tab>
          <Tab eventKey="gradient" title="Gradient">
            <Form>
              <Row>
                <Form.Group className="mb-3" as={Col}>
                  <Form.Label>First colour</Form.Label>
                  <Form.Control
                    type="color"
                    placeholder="Enter value"
                    defaultValue={
                      backgroundType === BACKGND_TYPE_GRADIENT
                        ? background?.gradientColor1 ||
                          defaultBackground.gradientColor1
                        : '#ffffff'
                    }
                    ref={gradientColor1Ref}
                  />
                </Form.Group>
                <Form.Group className="mb-3" as={Col}>
                  <Form.Label>Second colour</Form.Label>
                  <Form.Control
                    type="color"
                    placeholder="Enter value"
                    defaultValue={
                      backgroundType === BACKGND_TYPE_GRADIENT
                        ? background?.gradientColor2 ||
                          defaultBackground.gradientColor2
                        : '#ffffff'
                    }
                    ref={gradientColor2Ref}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Select Direction</Form.Label>
                  <Form.Select
                    aria-label="Select Direction"
                    id="gradient-direction"
                    onChange={(e) => setGradientDirection(e.target.value)}
                    value={gradientDirection}
                  >
                    <option value="top-bottom">Vertical</option>
                    <option value="left-right">Horizontal</option>
                    <option value="diagonal">Diagonal</option>
                  </Form.Select>
                </Form.Group>
              </Row>
            </Form>
          </Tab>
        </Tabs>
      </Modal.Body>
      <BackgroundModalFooter>
        <Form.Check
          type="checkbox"
          label="Set as default theme"
          ref={setDefaultRef}
        />
        <Button
          variant="dark"
          onClick={
            submitKey === BACKGND_TYPE_COLOR
              ? handleColorFormSubmit
              : handleGradientFormSubmit
          }
          disabled={storeLoading}
        >
          {storeLoading ? <Spinner /> : 'Submit'}
        </Button>
      </BackgroundModalFooter>
    </Modal>
  );
};

export default BackgroundFormModal;

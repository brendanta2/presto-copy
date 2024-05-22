import React, { forwardRef, useContext, useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { LOCAL_HOST, STORE_PATH, SUPPORTED_FONTS } from '../utils/constants';
import axios from 'axios';
import { AppContext } from '../contexts/AppContext';
import ErrorModal from './Modal/ErrorModal';

/**
 * Font select dropdown for selecting the font of an element
 */
const FontSelect = forwardRef(({ selectedElementId, slide }, ref) => {
  const { token, store, setStore } = useContext(AppContext);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedFont, setSelectedFont] = useState('default');

  // need to refresh the selected font when the selected element changes or slide changes
  useEffect(() => {
    const element = slide?.elements.find(
      (element) => element.id === selectedElementId
    );
    setSelectedFont(element?.font || 'default');
  }, [slide, selectedElementId]);

  /**
   * Function called when the font is changed which makes API request and state changes
   */
  const handleOnChange = async () => {
    const element = slide.elements.find(
      (element) => element.id === selectedElementId
    );
    element.font = ref.current.value;
    try {
      await axios.put(
        LOCAL_HOST + STORE_PATH,
        { store },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSelectedFont(element.font);
      setStore({ ...store });
    } catch (err) {
      setErrorMessage('Error deleting element. Please refresh.');
    }
  };
  return (
    <>
      <Form.Select
        size="sm"
        aria-label="font-select"
        value={selectedFont}
        disabled={selectedElementId === undefined}
        onChange={handleOnChange}
        ref={ref}
      >
        <option disabled value="default">
          Select font
        </option>
        {SUPPORTED_FONTS.map((font, index) => (
          <option value={font} key={index}>
            {font}
          </option>
        ))}
      </Form.Select>
      <ErrorModal
        errorMessage={errorMessage}
        onHide={() => setErrorMessage('')}
      />
    </>
  );
});

FontSelect.displayName = 'FontSelect';

export default FontSelect;

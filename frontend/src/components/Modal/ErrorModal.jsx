import React from 'react';
import { Modal } from 'react-bootstrap';

/**
 * ErrorModal component used to display error messages throughout application
 * as a modal popup with a close button.
 *
 * Not used for forms since forms use dismissible Alerts instead.
 *
 * @param {
 *  errorMessage: string,
 *  onHide: Function
 * }
 * @returns
 */
const ErrorModal = ({ errorMessage, onHide }) => {
  return (
    <Modal show={!!errorMessage} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Uh Oh!</Modal.Title>
      </Modal.Header>
      <Modal.Body>{errorMessage}</Modal.Body>
    </Modal>
  );
};

export default ErrorModal;

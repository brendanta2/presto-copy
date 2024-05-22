import React from 'react';
import { Alert, Button, Modal, Spinner } from 'react-bootstrap';

/**
 * Common Modal set up for all the elements of 2.3
 * which displays the relevant form to edit or create element
 * within a modal.
 */
const ElementFormModal = ({
  showForm,
  onHide,
  isEditing,
  storeLoading,
  handleFormSubmit,
  elementStr,
  elementLabel,
  errorMessage,
  setErrorMessage,
  children
}) => {
  return (
    <Modal
      show={showForm}
      size="lg"
      aria-labelledby={elementLabel}
      onHide={onHide}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id={elementLabel}>
          {isEditing ? 'Update ' + elementStr : 'Add ' + elementStr}
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
        {children}
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="dark"
          onClick={handleFormSubmit}
          disabled={storeLoading}
        >
          {storeLoading
            ? (
            <Spinner aria-label="loading-spinner" />
              )
            : isEditing
              ? (
                  'Update ' + elementStr
                )
              : (
                  'Add ' + elementStr
                )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ElementFormModal;

import React from 'react';
import ElementFormModal from '../components/Modal/ElementFormModal';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('ElementFormModal', () => {
  const setup = (
    showForm,
    onHide,
    isEditing,
    storeLoading,
    handleFormSubmit,
    elementStr,
    elementLabel,
    errorMessage,
    setErrorMessage
  ) =>
    render(
      <ElementFormModal
        showForm={showForm}
        onHide={onHide}
        isEditing={isEditing}
        storeLoading={storeLoading}
        handleFormSubmit={handleFormSubmit}
        elementStr={elementStr}
        elementLabel={elementLabel}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
    );
  const mockOnHide = jest.fn();
  const mockHandleFormSubmit = jest.fn();
  const mockSetErrorMessage = jest.fn();

  it('should display modal correctly', () => {
    setup(
      true,
      mockOnHide,
      false,
      false,
      mockHandleFormSubmit,
      'textbox',
      'create-textbox-form-modal',
      '',
      mockSetErrorMessage
    );
    const modal = screen.getByRole('dialog', {
      name: /add textbox/i
    });
    expect(modal).toBeInTheDocument();
  });

  it('should hide modal correctly with close button', () => {
    setup(
      true,
      mockOnHide,
      false,
      false,
      mockHandleFormSubmit,
      'textbox',
      'create-textbox-form-modal',
      '',
      mockSetErrorMessage
    );
    const closeBtn = screen.getByRole('button', {
      name: 'Close'
    });
    userEvent.click(closeBtn);
    expect(mockOnHide).toHaveBeenCalledTimes(1);
  });

  it('should display error modal and dismiss error correctly', () => {
    setup(
      true,
      mockOnHide,
      false,
      false,
      mockHandleFormSubmit,
      'textbox',
      'create-textbox-form-modal',
      'bad error',
      mockSetErrorMessage
    );
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    const closeAlertBtn = screen.getByRole('button', {
      name: /close alert/i
    });
    userEvent.click(closeAlertBtn);
    expect(mockSetErrorMessage).toHaveBeenCalledTimes(1);
  });

  it('should display correct modal submit button (creating new element)', () => {
    setup(
      true,
      mockOnHide,
      false,
      false,
      mockHandleFormSubmit,
      'something',
      'create-something-form-modal',
      '',
      mockSetErrorMessage
    );
    const btn = screen.getByRole('button', {
      name: /add something/i
    });
    expect(btn).toBeInTheDocument();
  });

  it('should display correct modal submit button (editing existing element', () => {
    setup(
      true,
      mockOnHide,
      true,
      false,
      mockHandleFormSubmit,
      'something',
      'create-something-form-modal',
      '',
      mockSetErrorMessage
    );
    const btn = screen.getByRole('button', {
      name: /update something/i
    });
    expect(btn).toBeInTheDocument();
  });

  it('should disable submit button if previous request is currently loading', () => {
    setup(
      true,
      mockOnHide,
      false,
      true,
      mockHandleFormSubmit,
      'something',
      'create-something-form-modal',
      '',
      mockSetErrorMessage
    );
    const loadingSpinner = screen.getByLabelText('loading-spinner');
    expect(loadingSpinner).toBeInTheDocument();
    const btn = screen.getByRole('button', {
      name: /loading-spinner/i
    });
    expect(btn).toBeDisabled();
  });
});

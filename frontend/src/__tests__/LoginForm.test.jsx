import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../components/LoginForm';

describe('Login page', () => {
  const mockOnSubmit = jest.fn();
  const mockUpdateErrorMessage = jest.fn();
  const setup = (errorMessage, loginLoading) =>
    render(
      <LoginForm
        onSubmit={mockOnSubmit}
        errorMessage={errorMessage}
        updateErrorMessage={mockUpdateErrorMessage}
        loginLoading={loginLoading}
      />
    );

  it('renders login form', () => {
    setup('', false);
    const emailInput = screen.getByRole('textbox', {
      name: /email address/i
    });
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  it('renders error message with empty email input', () => {
    setup('', false);
    const emailInput = screen.getByRole('textbox', {
      name: /email address/i
    });
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });
    userEvent.type(emailInput, '');
    userEvent.type(passwordInput, 'abc');
    userEvent.click(submitButton);
    expect(
      screen.getByText('Email field cannot be empty!')
    ).toBeInTheDocument();
  });

  it('renders error message with empty password input', () => {
    setup('', false);
    const emailInput = screen.getByRole('textbox', {
      name: /email address/i
    });
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });
    userEvent.type(emailInput, 'a@gmail.com');
    userEvent.type(passwordInput, '');
    userEvent.click(submitButton);
    expect(
      screen.getByText('Password field cannot be empty!')
    ).toBeInTheDocument();
  });

  it('calls onSubmit with email and password', () => {
    setup('', false);
    const emailInput = screen.getByRole('textbox', {
      name: /email address/i
    });
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });
    userEvent.type(emailInput, 'abc@gmail.com');
    userEvent.type(passwordInput, 'abc');
    userEvent.click(submitButton);
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it('displays given error message', () => {
    setup('this is an error message', false);
    expect(screen.getByText('this is an error message')).toBeInTheDocument();
  });

  it('closes error alert correctly', () => {
    setup('this is an error message', false);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    const closeAlertBtn = screen.getByRole('button', {
      name: /close alert/i
    });
    userEvent.click(closeAlertBtn);
    expect(mockUpdateErrorMessage).toHaveBeenCalledTimes(1);
  });

  it('disables submit button when the form is loading', () => {
    setup('', true);
    const submitButton = screen.getByRole('button', {
      name: /login-submit-button/i
    });
    expect(submitButton).toBeDisabled();
  });

  it('shows spinner when form is loading', () => {
    setup('', true);
    const spinner = screen.getByRole('status', {
      name: /loading-spinner/i
    });
    expect(spinner).toBeInTheDocument();
  });

  it('prioritises displaying form internal errors first', () => {
    setup('this message should not be shown', false);
    const emailInput = screen.getByRole('textbox', {
      name: /email address/i
    });
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });
    userEvent.type(emailInput, 'a@gmail.com');
    userEvent.type(passwordInput, '');
    userEvent.click(submitButton);
    expect(
      screen.getByText('Password field cannot be empty!')
    ).toBeInTheDocument();
  });
});

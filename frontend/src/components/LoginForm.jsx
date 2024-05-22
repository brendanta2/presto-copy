import React, { useRef, useState } from 'react';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';

/**
 * LoginForm component that will be used to render the login form
 * with constraints on user input
 *
 * @param {
 *  onSubmit: Function,
 *  errorMessage: String,
 *  updateErrorMessage: Function,
 *  loginLoading: Boolean
 * }
 * @returns
 */
const LoginForm = ({
  onSubmit,
  errorMessage,
  updateErrorMessage,
  loginLoading
}) => {
  const emailInput = useRef();
  const passwordInput = useRef();
  const [internalErrorMessage, setInternalErrorMessage] = useState('');

  /**
   * Internal function called when the form is submitted which will call the
   * external function to make api request to login the user
   */
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const email = emailInput.current.value;
    const password = passwordInput.current.value;
    if (!email) {
      setInternalErrorMessage('Email field cannot be empty!');
      return;
    } else if (!password) {
      setInternalErrorMessage('Password field cannot be empty!');
      return;
    }
    setInternalErrorMessage('');
    await onSubmit(email, password);
  };

  return (
    <>
      {(!!internalErrorMessage || !!errorMessage) && (
        <Alert
          variant="danger"
          onClose={() => {
            setInternalErrorMessage('');
            updateErrorMessage('');
          }}
          dismissible
        >
          {internalErrorMessage || errorMessage}
        </Alert>
      )}
      <Form onSubmit={handleLoginSubmit}>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            ref={emailInput}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            ref={passwordInput}
          />
        </Form.Group>
        <Button
          variant="warning"
          type="submit"
          disabled={loginLoading}
          aria-label="login-submit-button"
        >
          {loginLoading
            ? (
            <Spinner
              animation="border"
              role="status"
              aria-label="loading-spinner"
            />
              )
            : (
                'Login'
              )}
        </Button>
      </Form>
    </>
  );
};

export default LoginForm;

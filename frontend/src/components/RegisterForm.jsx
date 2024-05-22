import React, { useRef, useState } from 'react';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';

/**
 * RegisterForm component that will be used to render the register form
 * with constraints on user input
 * @param {
 *   onSubmit: Function,
 *   errorMessage: String,
 *   updateErrorMessage: Function,
 *   registerLoading: Boolean
 * }
 * @returns
 */
const RegisterForm = ({
  onSubmit,
  errorMessage,
  updateErrorMessage,
  registerLoading
}) => {
  const emailInput = useRef();
  const passwordInput = useRef();
  const confirmPasswordInput = useRef();
  const nameInput = useRef();

  const [internalErrorMessage, setInternalErrorMessage] = useState('');

  /**
   * Internal function called when the form is submitted which will call the
   * external function to make api request to register the user
   */
  const handleRegister = async (e) => {
    e.preventDefault();
    const email = emailInput.current.value;
    const password = passwordInput.current.value;
    const confPassword = confirmPasswordInput.current.value;
    const name = nameInput.current.value;

    if (name === '') {
      setInternalErrorMessage('Name field cannot be empty!');
      return;
    } else if (email === '') {
      setInternalErrorMessage('Email field cannot be empty!');
      return;
    } else if (password === '') {
      setInternalErrorMessage('Password field cannot be empty!');
      return;
    } else if (confPassword === '') {
      setInternalErrorMessage('Confirm password field cannot be empty!');
      return;
    } else if (password !== confPassword) {
      setInternalErrorMessage('Passwords do not match!');
      return;
    }
    setInternalErrorMessage('');
    await onSubmit(email, password, name);
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
      <Form onSubmit={handleRegister}>
        <Form.Group className="mb-3" controlId="formBasicName">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="What do you go buy?"
            ref={nameInput}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="example@email.com"
            ref={emailInput}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Keep it to yourself 🤫"
            ref={passwordInput}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formConfirmPassword">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Double checking it's the same"
            ref={confirmPasswordInput}
          />
        </Form.Group>

        <Button variant="warning" type="submit" disabled={registerLoading}>
          {registerLoading
            ? (
            <Spinner animation="border" role="status" />
              )
            : (
                'Sign Up'
              )}
        </Button>
      </Form>
    </>
  );
};

export default RegisterForm;

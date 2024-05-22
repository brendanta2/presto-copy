import React, { useContext, useState } from 'react';
import axios from 'axios';
import { LOCAL_HOST, LOGIN_PATH } from '../utils/constants';
import { AppContext } from '../contexts/AppContext';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import {
  AlternativePromo,
  Container,
  FormContainer,
  FormContainerWrapper,
  FormHeading
} from '../components/LoginRegister';
import LoginForm from '../components/LoginForm';

const Login = () => {
  const { token, setToken } = useContext(AppContext);
  const [errorMessage, setErrorMessage] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const navigate = useNavigate();

  // User is not to be able to access login page if already logged in
  if (token) {
    return <Navigate to={'/dashboard'} />;
  }

  /**
   * Function called when the internal LoginForm component is submitted
   */
  const handleLoginRequest = async (email, password) => {
    setLoginLoading(true);
    try {
      const response = await axios.post(LOCAL_HOST + LOGIN_PATH, {
        email,
        password
      });
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setLoginLoading(false);
      navigate('/dashboard');
    } catch (err) {
      setErrorMessage('Invalid email or password');
      setLoginLoading(false);
    }
  };

  return (
    <Container className={'bg-dark'}>
      <FormContainerWrapper>
        <FormContainer>
          <FormHeading>👋 Welcome back!</FormHeading>
          <LoginForm
            onSubmit={(email, password) => handleLoginRequest(email, password)}
            errorMessage={errorMessage}
            updateErrorMessage={(msg) => setErrorMessage(msg)}
            loginLoading={loginLoading}
          />
          <AlternativePromo>
            Want to make an account? <Link to="/register">Register</Link> here
          </AlternativePromo>
        </FormContainer>
      </FormContainerWrapper>
    </Container>
  );
};

export default Login;

import React, { useContext, useState } from 'react';
import axios from 'axios';
import { LOCAL_HOST, REGISTER_PATH } from '../utils/constants';
import { AppContext } from '../contexts/AppContext';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import {
  AlternativePromo,
  Container,
  FormContainer,
  FormContainerWrapper,
  FormHeading
} from '../components/LoginRegister';
import styled from 'styled-components';
import RegisterForm from '../components/RegisterForm';

const RegisterFormContainerWrapper = styled(FormContainerWrapper)`
  height: 80%;
`;

const Register = () => {
  const { token, setToken } = useContext(AppContext);

  const [errorMessage, setErrorMessage] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const navigate = useNavigate();

  // User is not to be able to access login page if already logged in
  if (token) {
    return <Navigate to={'/dashboard'} />;
  }

  /**
   * Function called when the internal RegisterForm component is submitted
   */
  const handleRegisterRequest = async (email, password, name) => {
    setRegisterLoading(true);
    try {
      const response = await axios.post(LOCAL_HOST + REGISTER_PATH, {
        email,
        password,
        name
      });
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setRegisterLoading(false);
      navigate('/dashboard');
    } catch (err) {
      setErrorMessage('Invalid email or password');
      setRegisterLoading(false);
    }
  };

  return (
    <Container className={'bg-dark'}>
      <RegisterFormContainerWrapper>
        <FormContainer>
          <FormHeading>Register Here!</FormHeading>
          <RegisterForm
            onSubmit={handleRegisterRequest}
            errorMessage={errorMessage}
            updateErrorMessage={() => setErrorMessage('')}
            registerLoading={registerLoading}
          />
          <AlternativePromo>
            Already have an account? <Link to="/login">Login</Link> here
          </AlternativePromo>
        </FormContainer>
      </RegisterFormContainerWrapper>
    </Container>
  );
};

export default Register;

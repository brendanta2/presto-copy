import React, { useContext, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import { AppContext } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LOCAL_HOST, LOGOUT_PATH } from '../utils/constants';
import ErrorModal from './Modal/ErrorModal';

/**
 * AppNavBar component for the navigation bar at the top of the app that includes
 * app brand and logout button
 */
const AppNavBar = () => {
  const { token, setToken, setStore } = useContext(AppContext);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  /**
   * Function called when the logout button is clicked which makes API request,
   * clears the token from localStorage and the store, and redirects to login page
   */
  const handleLogoutClick = async () => {
    try {
      await axios.post(
        LOCAL_HOST + LOGOUT_PATH,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      localStorage.removeItem('token');
      setToken('');
      setStore({});
      navigate('/login');
    } catch (err) {
      setErrorMessage('Invalid token for logout. Please refresh.');
    }
  };

  return (
    <Navbar className="bg-dark">
      <Container>
        <Navbar.Brand className="text-white">Presto</Navbar.Brand>
        <Navbar.Toggle />
        <Button variant="outline-danger" onClick={handleLogoutClick}>
          Logout
        </Button>
      </Container>
      <ErrorModal
        errorMessage={errorMessage}
        onHide={() => setErrorMessage('')}
      />
    </Navbar>
  );
};

export default AppNavBar;

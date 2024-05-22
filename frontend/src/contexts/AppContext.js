import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react';
import { LOCAL_HOST, STORE_PATH } from '../utils/constants';

const initialAppContext = {
  token: '',
  setToken: () => {},
  store: {},
  setStore: () => {},
  loading: true
};

export const AppContext = createContext(initialAppContext);

const AppProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [store, setStore] = useState({});
  const [loading, setLoading] = useState(true);
  useEffect(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(LOCAL_HOST + STORE_PATH, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setStore(response.data.store);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  return (
    <AppContext.Provider value={{ token, setToken, store, setStore, loading }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;

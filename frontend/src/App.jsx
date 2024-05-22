import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Editor from './pages/Editor';
import Dashboard from './pages/Dashboard';
import Preview from './pages/Preview';
import ProtectedRoutes from './components/ProtectedRoutes';
import AppProvider from './contexts/AppContext';

function App () {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={<ProtectedRoutes />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/edit/:pId/:sId" element={<Editor />} />
            <Route path="/preview/:pId/:sId" element={<Preview />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;

import React from 'react';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';
import Home from './pages/Dashboard/Home';
import Income from './pages/Dashboard/Income';
import Expense from './pages/Dashboard/Expense';
import Transaction from './pages/Dashboard/Transaction';
import UserProvider from './context/UserContext';
import { Toaster } from 'react-hot-toast';
import GeminiChat from './components/GeminiChat';

const App = () => {
  return (
    <UserProvider>
      <div>
        <Router>
          <Routes>
            <Route path="/" element={<Root />} />
            <Route path="/login" exact element={<Login />} />
            <Route path="/signup" exact element={<SignUp />} />
            <Route path="/dashboard" exact element={<Home />} />
            <Route path="/income" exact element={<Income />} />
            <Route path="/expense" exact element={<Expense />} />
            <Route path="/transaction" exact element={<Transaction />} />
          </Routes>
        </Router>

        {/* Gemini chatbot always visible */}
        <GeminiChat />
      </div>

      <Toaster
        toastOptions={{
          className: '',
          style: { fontSize: '13px' },
        }}
      />
    </UserProvider>
  );
};

export default App;

const Root = () => {
  // check if token exists in local storage
  const isAuthenticated = !!localStorage.getItem('token');

  // If authenticated, redirect to dashboard, else to login
  return isAuthenticated ? (
    <Navigate to="/dashboard" />
  ) : (
    <Navigate to="/login" />
  );
};

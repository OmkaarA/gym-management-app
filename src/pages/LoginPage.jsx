// LoginPage: User login form with localStorage validation and navigation
import React from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import { useTransition } from '../context/TransitionContext';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const { setDirection } = useTransition();
  // Hooks for navigation and form state
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (event) => {
    // Handles form submission and login validation
    event.preventDefault();
    if (!loginInput || !password) {
      alert('Please enter email/username and password');
      return;
    }

    const loggedInUser = login(loginInput, password);
    if (loggedInUser) {
      alert('Login successful!');

      // 3. NEW: Redirect based on role
      if (loggedInUser.role === 'admin') {
        navigate('/dashboard');
      } else if (loggedInUser.role === 'trainer') {
        navigate('/trainer-schedule');
      } else if (loggedInUser.role === 'member') {
        navigate('/my-plan');
      } else {
        // Fallback (shouldn't happen)
        navigate('/dashboard');
      }

    } else {
      alert('Invalid login credentials');
    }
  };

  return (
    <PageTransition>
      {/* Render login form UI */}
      <div className="min-h-screen flex items-center justify-center p-4 bg-login-background bg-cover bg-center">
        {/* Login card */}
        <Link
          to="/signup"
          onClick={() => setDirection("left")}
          className="absolute top-6 left-6 flex items-center gap-2 rounded-lg bg-gray-900/60 px-4 py-2 font-tourney font-black text-gray-100 backdrop-blur-md hover:bg-gray-700/60"
        >

          <span aria-hidden="true">&larr;</span>
          Signup

        </Link>

        <div className="w-full md:w-1/3 max-w-md rounded-lg bg-gray-900/60 backdrop-blur-md border border-gray-700 p-8">
          <h1 className="mb-6 text-center text-3xl font-tourney font-black text-gray-100">
            Login
          </h1>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email/Username field */}
            <div>
              {/* Password field */}
              {/* Submit button */}
              <label
                htmlFor="login-input"
                className="block text-md font-tourney  text-gray-300 w-3/4 mx-auto"
              >
                Email or Username
              </label>
              <input
                id="login-input"
                type="text"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                className="mt-1 block w-3/4 mx-auto rounded-md p-3 bg-gray-800 border border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="password-input"
                className="block text-md font-tourney  text-gray-300 w-3/4 mx-auto"
              >
                Password
              </label>
              <input
                id="password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-3/4 mx-auto rounded-md p-3 bg-gray-800 border border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <button
                type="submit"
                className="flex w-3/4 mx-auto justify-center rounded-md px-4 py-3 font-tourney font-black shadow-sm bg-blue-600 hover:bg-blue-500"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}

export default LoginPage;
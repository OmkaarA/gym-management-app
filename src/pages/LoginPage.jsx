import React from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import { useTransition } from '../context/TransitionContext';
import { useAuth } from '../context/AuthContext';
// import gymLogo from '../assets/gym-logo.jpg';
import Lottie from 'lottie-react';
import loginAnimationData from "../assets/gymanim.json";
function LoginPage() {
  const { setDirection } = useTransition();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');

  // --- 2. Add a new state for error messages ---
  const [error, setError] = useState(null);

  // --- 3. Update the handleLogin function ---
  const handleLogin = (event) => {
    event.preventDefault();
    setError(null); // Clear any previous errors on a new attempt

    if (!loginInput || !password) {
      setError('Please enter both email/username and password'); // Set error instead of alert
      return;
    }

    const loggedInUser = login(loginInput, password);

    if (loggedInUser) {
      // --- SUCCESS: No alert, just navigate ---
      if (loggedInUser.role === 'admin') {
        navigate('/dashboard');
      } else if (loggedInUser.role === 'trainer') {
        navigate('/trainer-schedule');
      } else if (loggedInUser.role === 'member') {
        navigate('/my-plan');
      } else {
        navigate('/dashboard'); // Fallback
      }

    } else {
      // --- FAILURE: Set error state instead of alert ---
      setError('Invalid login credentials');
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center p-4 bg-login-background bg-cover bg-center">
        {/* Signup link (on the right) */}
        <Link
          to="/signup"
          onClick={() => setDirection("left")}
          className="absolute top-6 left-6 flex items-center gap-2 rounded-lg bg-gray-900/60 px-4 py-2 font-tourney font-black text-gray-100 backdrop-blur-md hover:bg-gray-700/60"
        >
          Signup
          <span aria-hidden="true">&larr;</span>
        </Link>

        <div className="w-full md:w-1/3 max-w-md rounded-lg bg-gray-900/60 backdrop-blur-md border border-gray-700 p-8">

          {/* <div className="w-40 h-40 mx-auto mb-4">
            <img
              src={gymLogo}
              alt="GYM Logo"
              className="w-full h-full rounded-full object-cover shadow-lg"
            />
          </div> */}

          <h1 className="mb-6 text-center text-3xl font-tourney font-black text-gray-100">
            Login
          </h1>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email/Username field */}
            <div>
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

            {/* Password field */}
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
              {/* --- 4. Add the error message display --- */}
              {error && (
                <p className="pb-4 text-center text-sm text-red-400">
                  {error}
                </p>
              )}
              {/* --- End of error message --- */}

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
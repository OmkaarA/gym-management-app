import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import PageTransition from "../components/PageTransition";
import { useTransition } from '../context/TransitionContext';
import { motion } from 'framer-motion';
import gymLogo from '../assets/gym-logo.jpg';

function SignUpPage() {
  const { setDirection } = useTransition();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSignUp = (event) => {
    event.preventDefault();
    setError(null);

    if (!name || !email || !username || !password) {
      setError('Please fill in all fields.');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const members = JSON.parse(localStorage.getItem('gymMembers')) || [];

    const userExists = users.some(u => u.username === username || u.email === email);
    if (userExists) {
      setError('Username or email is already taken.');
      return;
    }

    const newMemberId = uuidv4();

    // Create the login account
    const newUserAccount = {
      id: newMemberId,
      email: email,
      username: username,
      password: password,
      role: 'member'
    };

    // Create the member profile
    const newMemberProfile = {
      id: newMemberId,
      name: name,
      email: email,
      plan: 'None',
      joinDate: new Date().toISOString(),
      planStatus: 'Inactive'
    };

    const updatedUsers = [...users, newUserAccount];
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    const updatedMembers = [...members, newMemberProfile];
    localStorage.setItem('gymMembers', JSON.stringify(updatedMembers));

    // --- THE FIX ---
    // 1. Remove the alert()
    // alert('Sign-up successful! Please log in to continue.');

    // 2. Pass the success message as state to the login page
    setDirection('left');
    navigate('/login', {
      state: { message: 'Sign-up successful! Please log in to continue.' }
    });
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center p-4 bg-login-background bg-cover bg-center">
        {/* Login link (on the right) */}
        <Link
          to="/login"
          onClick={() => setDirection("right")}
          className="absolute top-6 right-6 flex items-center gap-2 rounded-lg bg-gray-900/60 px-4 py-2 font-tourney font-black text-gray-100 backdrop-blur-md hover:bg-gray-700/60"
        >
          Login
          <span aria-hidden="true">&rarr;</span>
        </Link>

        <div className="w-full md:w-1/3 max-w-md rounded-lg bg-gray-900/60 backdrop-blur-md border border-gray-700 p-8">

          <div className="w-40 h-40 mx-auto mb-4">
            <img
              src={gymLogo}
              alt="GYM Logo"
              className="w-full h-full rounded-full object-cover shadow-lg"
            />
          </div>

          <h1 className="mb-6 text-center text-3xl font-tourney font-black text-gray-100">
            Sign Up
          </h1>

          <form onSubmit={handleSignUp} className="space-y-6">
            {/* Form fields... (no change) */}
            <div>
              <label htmlFor="name-input" className="block text-md font-tourney text-gray-300 w-3/4 mx-auto">
                Full Name
              </label>
              <input
                id="name-input" type="text" value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-3/4 mx-auto rounded-md p-3 bg-gray-800 border border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="email-input" className="block text-md font-tourney text-gray-300 w-3/4 mx-auto">
                Email
              </label>
              <input
                id="email-input" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-3/4 mx-auto rounded-md p-3 bg-gray-800 border border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="username-input" className="block text-md font-tourney text-gray-300 w-3/4 mx-auto">
                Username
              </label>
              <input
                id="username-input" type="text" value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-3/4 mx-auto rounded-md p-3 bg-gray-800 border border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="password-input" className="block text-md font-tourney text-gray-300 w-3/4 mx-auto">
                Password
              </label>
              <input
                id="password-input" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-3/4 mx-auto rounded-md p-3 bg-gray-800 border border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              {error && (
                <p className="pb-4 text-center text-sm text-red-400">
                  {error}
                </p>
              )}

              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex w-3/4 mx-auto justify-center rounded-md px-4 py-3 font-tourney font-black shadow-sm bg-blue-600 hover:bg-blue-500"
              >
                Create Account
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}

export default SignUpPage;
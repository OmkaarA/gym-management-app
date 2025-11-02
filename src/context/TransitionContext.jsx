import React, { createContext, useContext, useState } from 'react';

const TransitionContext = createContext();

export const TransitionProvider = ({ children }) => {
  const [direction, setDirection] = useState("right");
    return (
    <TransitionContext.Provider value={{direction, setDirection}}>
      {children}
    </TransitionContext.Provider>
  );
}
export const useTransition = () => useContext(TransitionContext);
import { createContext, useContext } from 'react';

// 1. Create the context
export const InputContext = createContext(null);

// 2. Create a custom hook for easy consumption later
export function useInputContext() {
  const context = useContext(InputContext);
  if (!context) {
    throw new Error('useInputContext must be used within an InputProvider');
  }
  return context;
}
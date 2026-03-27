// hooks/useSecretCode.js

import { useState } from 'react';

export function useSecretCode() {
  const [input, setInput] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);

  function handleChange(value) {
    setInput(value);
    setError(false);
  }

  function lock() {
    setUnlocked(false);
    setInput('');
  }

  return { input, unlocked, handleChange, lock, error, setError };
}
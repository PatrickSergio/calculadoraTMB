import React, { useState, useEffect, useCallback } from 'react';
import SplashScreen from './components/SplashScreen';
import TMBForm from './components/TMBForm';
import './App.css';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  const handleSplashFinish = useCallback(() => {
    setIsSplashVisible(false);
  }, []);

  // carrega tema salvo ou detecta preferência
  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (stored) setTheme(stored);
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches)
      setTheme('dark');
  }, []);

  // atualiza atributo data-theme e salva
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="appContainer">
      {isSplashVisible ? (
        <SplashScreen onFinish={handleSplashFinish} />
      ) : (
        <>
          <header className="appHeader">
            <button
              className="themeToggle"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              {theme === 'light' ? '🌙 Modo Escuro' : '☀️ Modo Claro'}
            </button>
          </header>
          <main>
            <TMBForm />
          </main>
        </>
      )}
    </div>
  );
};

export default App;

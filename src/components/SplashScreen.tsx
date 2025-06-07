import React, { useEffect } from 'react';
import styles from './SplashScreen.module.css';

import logoUrl from '../img/logo-erick-sousa.svg';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    
    const timer = setTimeout(onFinish, 2000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className={styles.splashContainer} onClick={onFinish}>
      <img src={logoUrl} className={styles.logo} alt="Logo Erick Sousa" />
    </div>
  );
};

export default SplashScreen;

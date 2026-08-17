import React, { useEffect } from 'react';
import { Router } from './router';
import { useUIStore } from './store/uiStore';
// import { CustomCursor } from './components/common/CustomCursor';
import { CustomAlert } from './components/common/CustomAlert';

const App: React.FC = () => {
  const { theme } = useUIStore();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('theme-light');
    } else {
      root.classList.remove('theme-light');
    }
  }, [theme]);

  return (
    <>
      <CustomAlert />
      {/* <CustomCursor /> */}
      <Router />
    </>
  );
};

export default App;

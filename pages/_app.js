import '@/styles/globals.css'
import '@/styles/player.css'
import 'inter-ui/inter.css'
import '@fontsource/noto-sans-sc/400.css';
import '@fontsource/noto-sans-sc/500.css';
import '@fontsource/noto-sans-sc/700.css';

import { useState, useEffect } from 'react';

export default function App({ Component, pageProps }) {
  const [showChild, setShowChild] = useState(false);
  useEffect(() => {
    setShowChild(true);
  }, []);

  if (!showChild) {
    return null;
  }
  return (
      <Component {...pageProps} />
  )
}

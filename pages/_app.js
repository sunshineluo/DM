import { useState, useEffect } from "react";
import Player from "@/components/Player";
import { SongIdsProvider } from "@/components/SongIdsContext";

import "@/styles/globals.css";
import "@/styles/player.css";
import "inter-ui/inter.css";
import "@fontsource/noto-sans-sc/400.css";
import "@fontsource/noto-sans-sc/500.css";
import "@fontsource/noto-sans-sc/700.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "next-themes";

export default function App({ Component, pageProps }) {
  const [showChild, setShowChild] = useState(false);
  useEffect(() => {
    setShowChild(true);
  }, []);

  if (!showChild) {
    return null;
  }
  return (
    <ThemeProvider attribute="class">
      <SongIdsProvider>
        <Navbar />
        <Component {...pageProps} />
        <Player full="false" />
      </SongIdsProvider>
    </ThemeProvider>
  );
}

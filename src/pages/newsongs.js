import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState, useEffect, useContext } from "react";
import { SongIdsContext } from "@/components/SongIdsContext";
import FullSongButton from "@/components/FullSongButton";

export default function Newsongs() {
  const router = useRouter();
  const [newSongs, setNewSongs] = useState([]);
  const [songIds, setSongIds] = useState([]);
  const [songDetails, setSongDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  function cn(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  const fetchNewSongs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("https://cf233.eu.org/personalized/newsong");
      const data = await response.json();
      if (data && data.code === 200) {
        setNewSongs(data.result);
        setSongIds(data.result.map((song) => song.id));
        fetchSongDetails(data.result.map((song) => song.id));
      }
    } catch (error) {
      console.error("An error occurred while fetching new songs:", error);
    }
  };

  const fetchSongDetails = async (songIds) => {
    try {
      const response = await fetch(
        `https://cf233.eu.org/song/detail?ids=${songIds.join(",")}`
      );
      const data = await response.json();
      if (data && data.code === 200) {
        setSongDetails(data.songs);
        console.log(songDetails);
      }
      setIsLoading(false);
    } catch (error) {
      console.log("An error occurred while fetching song details:", error);
    }
  };

  useEffect(() => {
    fetchNewSongs();
  }, []);
  const { addToPlaylist } = useContext(SongIdsContext);

  const handleAddToPlaylist = (trackId) => {
    addToPlaylist(trackId);
  };
  return (
    <div className="max-w-7xl mx-auto px-0 md:px-6 sm:px-6 py-8 mb-20 overflow-hidden">
      <Head>
        <title>新歌速递</title>
      </Head>

      <h1 className="px-6 md:px-0 sm:px-0 font-semibold text-3xl md:text-4xl sm:text-5xl">
        新歌速递
      </h1>
      <hr className="border-neutral-200 dark:border-neutral-800 my-3" />
      <div className="columns-2 md:columns-4 sm:columns-5 mt-6 px-6 md:px-0 sm:px-0">
        {songDetails &&
          songDetails
            .slice(0, 12)
            .map((track, index) => (
              <FullSongButton
                key={track.id}
                index={index}
                id={track.id}
                name={track.name}
                duration={track.durationTime}
                ar={track.ar.map((artist) => artist.name).join(" / ")}
                picUrl={track.al.picUrl}
              />
            ))}
      </div>
    </div>
  );
}

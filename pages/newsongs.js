import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState, useEffect, useContext } from "react";
import { Icon } from "@iconify/react";
import { SongIdsContext } from "@/components/SongIdsContext";
import LazyLoad from 'react-lazy-load';

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
      const response = await fetch("https://cf233.eu.org/top/song?type=0");
      const data = await response.json();
      if (data && data.code === 200) {
        setNewSongs(data.data);
        setSongIds(data.data.map((song) => song.id));
        fetchSongDetails(data.data.map((song) => song.id));
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
    <div className="max-w-6xl mx-auto px-0 py-8 overflow-hidden">
      <Head>
        <title>新歌速递</title>
      </Head>

      <h2 className="px-6 text-neutral-700 dark:text-neutral-300 font-medium text-lg md:text-3xl sm:text-4xl">
        新歌速递
      </h2>

      <div className="px-0 md:px-6 sm:px-6 mt-6 mb-16 columns-1 md:columns-2 sm:columns-2 w-full">
        {songDetails &&
          songDetails.map((track, index) => (
            <button
              key={track.id}
              className={`flex flex-row space-x-4 w-full rounded-none md:rounded-xl sm:rounded-xl px-6 py-4 ${
                index % 2 === 0 ? "bg-neutral-200 dark:bg-neutral-800" : "odd"
              }`}
              onClick={() => handleAddToPlaylist(track.id)}
            >
              <img
                src={track.al.picUrl}
                className="rounded-xl w-14 h-14 md:w-16 md:h-16 sm:w-16 sm:h-16"
              />
              <div className="flex flex-col space-y-1 mt-1">
                <span className="font-medium text-left w-full flex-wrap md:flex-nowrap sm:flex-nowrap flex overflow-hidden">
                  {track.name}
                </span>
                <span className="text-base opacity-75 text-left truncate w-48 md:w-96 sm:w-96">
                  {track.ar.map((artist) => artist.name).join(" / ")} 
                </span>
              </div>
            </button>
          ))}
      </div>
      {isLoading && (
        <p className="flex flex-row px-6 md:px-6 sm:px-6 justify-start -mt-6">
          <Icon icon="eos-icons:loading" className="w-8 h-8" />
        </p>
      )}
    </div>
  );
}

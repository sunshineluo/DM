import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState, useEffect, useContext } from "react";
import { Icon } from "@iconify/react";
import { SongIdsContext } from "@/components/SongIdsContext";
import LazyLoad from 'react-lazy-load';
import SongButton from "@/components/SongButton";

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
        console.log(songDetails)
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
    <div className="max-w-7xl mx-auto px-0 py-8 overflow-hidden">
      <Head>
        <title>新歌速递</title>
      </Head>

      <h2 className="px-6 text-neutral-700 dark:text-neutral-300 font-medium text-lg md:text-xl sm:text-2xl">
        新歌速递
      </h2>

      <div className="px-0 md:px-6 sm:px-6 mt-6 mb-16 w-full">
        {songDetails &&
          songDetails.map((track, index) => (
            <SongButton
            key={track.id}
            index={index}
            id={track.id}
            name={track.name}
            duration={track.dt}
            ar={track.ar.map((artist) => artist.name).join(" / ")}
            picUrl={track.al.picUrl}
          />
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

import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState, useEffect, useContext } from "react";
import { Icon } from "@iconify/react";
import { SongIdsContext } from "@/components/SongIdsContext";
import axios from "axios";
import FullSongButton from "@/components/FullSongButton";

export default function FM() {
  const router = useRouter();
  const [fm, setFm] = useState([]);
  const [songId, setSongId] = useState([]);
  const [songDetails, setSongDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  function cn(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  const fetchSongs = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`https://cf233.eu.org/personal_fm`, {
        withCredentials: true,
      });

      if (response.data.code === 200) {
        const data = response.data;
        setFm(data.data);
        setSongId(data.data.map((song) => song.id));
        fetchSongDetails(data.data.map((song) => song.id));
      } else {
        console.log("获取私人FM失败！");
      }
    } catch (error) {
      console.error(error);
      // 处理错误情况
    }
  };

  const { songIds, currentSongIndex, addToPlaylist } =
    useContext(SongIdsContext);

  const fetchSongDetails = async (songId) => {
    try {
      const response = await fetch(
        `https://cf233.eu.org/song/detail?ids=${songId.join(",")}`
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
    fetchSongs();
  }, [songIds[currentSongIndex]]);

  const handleAddToPlaylist = (trackId) => {
    addToPlaylist(trackId);
  };
  return (
    <div className="max-w-7xl mx-auto px-0 md:px-6 sm:px-6 py-8 mb-20 overflow-hidden">
      <Head>
        <title>私人FM</title>
      </Head>

      <h1 className="px-6 md:px-0 sm:px-0 font-semibold text-3xl md:text-4xl sm:text-5xl">
        私人FM
      </h1>

      <hr className="border-neutral-200 dark:border-neutral-800 my-3" />

      <div className="my-4 px-6 md:px-0 sm:px-0 columns-2 md:columns-4 sm:columns-5">
        {songDetails &&
          songDetails.map((track, index) => (
            <FullSongButton
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
    </div>
  );
}

import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState, useEffect, useContext } from "react";
import { Icon } from "@iconify/react";
import { SongIdsContext } from "@/components/SongIdsContext";
import axios from "axios";
import SongButton from "@/components/SongButton";

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
    <div className="max-w-7xl mx-auto px-0 py-8 overflow-hidden">
      <Head>
        <title>私人FM</title>
      </Head>

      <h2 className="px-6 text-neutral-700 dark:text-neutral-300 font-medium text-lg md:text-xl sm:text-2xl">
        私人FM
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
        <p className="flex flex-row px-6 md:px-6 sm:px-6 justify-start -mt-12">
          <Icon icon="eos-icons:loading" className="w-8 h-8" />
        </p>
      )}
    </div>
  );
}

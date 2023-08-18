import Head from "next/head";
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { Icon } from "@iconify/react";
import { SongIdsContext } from "@/components/SongIdsContext";
import LazyLoad from "react-lazy-load";
import FullSongButton from "@/components/FullSongButton";

export default function Home() {
  const router = useRouter();
  const [playlists, setPlaylists] = useState([]);
  const [newSongs, setNewSongs] = useState([]);
  const [songIds, setSongIds] = useState([]);
  const [songDetails, setSongDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaylistLoading, setIsPlaylistLoading] = useState(false);
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

  useEffect(() => {
    const fetchHighQualityPlaylists = async () => {
      try {
        setIsPlaylistLoading(true);
        const response = await fetch(
          `https://cf233.eu.org/top/playlist/highquality?cat=全部&limit=6`
        );
        const data = await response.json();
        if (data && data.code === 200) {
          setPlaylists(data.playlists);
          setIsPlaylistLoading(false);
        }
      } catch (error) {
        console.log(
          "An error occurred while fetching high quality playlists:",
          error
        );
      }
    };

    fetchHighQualityPlaylists();
  }, []);

  const { addToPlaylist } = useContext(SongIdsContext);

  const handleAddToPlaylist = (trackId) => {
    addToPlaylist(trackId);
  };
  return (
    <div className="max-w-7xl mx-auto px-0 py-8 overflow-hidden">
      <Head>
        <title>现在就听</title>
      </Head>
      <div className="flex flex-row justify-between">
        <h2 className="px-6 text-neutral-700 dark:text-neutral-300 font-medium text-lg md:text-xl sm:text-2xl">
          精品歌单
        </h2>

        <button
          onClick={() => router.push("/highquality")}
          className="rounded-xl px-6 py-2 text-red-600"
        >
          查看全部
        </button>
      </div>

      <div className="mt-6 px-6 md:px-6 sm:px-6 columns-1 md:columns-2 sm:columns-3 w-full">
        {playlists.length > 0 &&
          playlists.map((playlist, index) => (
            <button
              key={playlist.id}
              onClick={() => router.push(`/playlist?id=${playlist.id}`)}
              className="flex flex-col w-full mb-4 overflow-hidden"
            >
              <LazyLoad offset={100}>
                <img src={playlist.coverImgUrl} className="rounded-xl w-full" />
              </LazyLoad>

              <div className="px-2 py-2 md:py-4 sm:py-4">
                <h1 className="font-medium text-base md:text-xl sm:text-xl text-left">
                  {playlist.name}
                </h1>

                <p className="mt-2 opacity-75 text-xs md:text-sm sm:text-sm w-48 md:w-56 sm:w-96 truncate">
                  {playlist.description}
                </p>
              </div>
            </button>
          ))}
      </div>

      {isPlaylistLoading && (
        <p className="flex flex-row px-6 md:px-6 sm:px-6 justify-start mt-6 mb-12">
          <Icon icon="eos-icons:loading" className="w-8 h-8" />
        </p>
      )}

      <div className="mt-8 flex flex-row justify-between">
        <h2 className="px-6 text-neutral-700 dark:text-neutral-300 font-medium text-lg md:text-xl sm:text-2xl">
          新歌速递
        </h2>

        <button
          onClick={() => router.push("/newsongs")}
          className="rounded-xl px-6 py-2 text-red-600"
        >
          查看全部
        </button>
      </div>

      <div className="px-0 md:px-6 sm:px-6 mt-6 mb-16 columns-1 md:columns-2 sm:columns-2 w-full">
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
      {isLoading && (
        <p className="flex flex-row px-6 md:px-6 sm:px-6 justify-start -mt-6">
          <Icon icon="eos-icons:loading" className="w-8 h-8" />
        </p>
      )}
    </div>
  );
}

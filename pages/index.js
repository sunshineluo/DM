import Head from "next/head";
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { Icon } from "@iconify/react";
import { SongIdsContext } from "@/components/SongIdsContext";

export default function Home() {
  const router = useRouter();
  const [playlists, setPlaylists] = useState([]);
  const [newSongs, setNewSongs] = useState([]);
  const [songIds, setSongIds] = useState([]);
  const [songDetails, setSongDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchNewSongs = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("https://cf233.eu.org/top/song?type=0");
        const data = await response.json();
        if (data && data.code === 200) {
          setNewSongs(data.data);
          setSongIds(data.data.map((song) => song.id));
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

    fetchNewSongs();
    fetchSongDetails(songIds);
  }, []);

  useEffect(() => {
    const fetchHighQualityPlaylists = async () => {
      try {
        const response = await fetch(
          `https://cf233.eu.org/top/playlist/highquality?cat=全部&limit=2`
        );
        const data = await response.json();
        if (data && data.code === 200) {
          setPlaylists(data.playlists);
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

  const { addToPlaylist } =
    useContext(SongIdsContext);

  const handleAddToPlaylist = (trackId) => {
    addToPlaylist(trackId);
  };
  return (
    <div className="max-w-4xl mx-auto px-0 py-8">
      <Head>
        <title>现在就听</title>
      </Head>
      <div className="flex flex-row justify-between">
        <h2 className="px-6 text-neutral-700 dark:text-neutral-300 font-medium text-lg md:text-3xl sm:text-4xl">
          精品歌单
        </h2>

        <button
          onClick={() => router.push("/highquality")}
          className="rounded-xl px-6 py-2 text-red-600"
        >
          查看全部
        </button>
      </div>

      <div className="flex flex-row space-x-4 flex-nowrap overflow-x-auto mt-6 px-6 md:px-0 sm:px-0">
        {playlists.length > 0 &&
          playlists.map((playlist, index) => (
            <button
              key={playlist.ld}
              onClick={() => router.push(`/playlist?id=${playlist.id}`)}
              className="flex flex-col w-1/2 h-72 md:h-[35.5rem] sm:h-[35.5rem] overflow-hidden"
            >
              <img src={playlist.coverImgUrl} className="rounded-xl w-full" />
              <div className=" px-2 py-2 md:py-4 sm:py-4">
                <h1 className="font-medium text-base md:text-xl sm:text-xl text-left">
                  {playlist.name}
                </h1>

                <p className="mt-2 opacity-75 text-xs md:text-sm sm:text-sm">
                  {playlist.description}
                </p>
              </div>
            </button>
          ))}
      </div>

      <h2 className="mt-16 px-6 text-neutral-700 dark:text-neutral-300 font-medium text-lg md:text-3xl sm:text-4xl">
        新歌速递
      </h2>

      <div className="mt-6 columns-1 md:columns-2 sm:columns-2">
        {songDetails &&
          songDetails.slice(0,12).map((track, index) => (
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
                <span className="text-base opacity-75 text-left flex flex-row flex-wrap md:flex-nowrap sm:flex-nowrap overflow-hidden truncate w-1/2 md:w-2/3 sm:w-2/3">
                  {track.ar.map((artist) => artist.name).join(" / ")} -{" "}
                  {track.al.name}
                </span>
              </div>
            </button>
          ))}

        {isLoading && (
          <p className="flex flex-row px-6 md:px-6 sm:px-6 justify-start mt-6">
            <Icon icon="eos-icons:loading" className="w-8 h-8" />
          </p>
        )}
      </div>
    </div>
  );
}

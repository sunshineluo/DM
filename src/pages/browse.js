import Head from "next/head";
import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { SongIdsContext } from "@/components/SongIdsContext";
import FullSongButton from "@/components/FullSongButton";
import ArrowHeading from "@/components/ArrowHeading";
import PlaylistCard from "@/components/PlaylistCard";
import MvCard from "@/components/MvCard";

export default function Browse() {
  const router = useRouter();
  const [playlists, setPlaylists] = useState([]);
  const [newMv, setNewMv] = useState([]);
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
      const response = await fetch("https://cf233.eu.org/personalized/newsong?limit=6");
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

  const fetchNewMV = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("https://cf233.eu.org/personalized/mv");
      const data = await response.json();
      if (data && data.code === 200) {
        setNewMv(data.result);
      }
    } catch (error) {
      console.error("An error occurred while fetching new mvs:", error);
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
    fetchNewMV();
  }, []);

  useEffect(() => {
    const fetchHighQualityPlaylists = async () => {
      try {
        setIsPlaylistLoading(true);
        const response = await fetch(
          `https://cf233.eu.org/personalized?limit=4`
        );
        const data = await response.json();
        if (data && data.code === 200) {
          setPlaylists(data.result);
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
    <div className="max-w-7xl mx-auto px-0 md:px-6 sm:px-6 py-8 mb-20 overflow-hidden">
      <Head>
        <title>浏览 </title>
      </Head>

      <h1 className="px-6 md:px-0 sm:px-0 font-semibold text-3xl md:text-4xl sm:text-5xl">
        浏览
      </h1>

      <hr className="border-neutral-200 dark:border-neutral-800 my-3" />
      <ArrowHeading onClick={() => router.push("/highquality")}>
        推荐歌单
      </ArrowHeading>

      <div className="mt-4 px-6 md:px-0 sm:px-0 space-x-4 flex flex-row overflow-x-auto w-full">
        {playlists.length > 0 &&
          playlists.map((pl, index) => (
            <PlaylistCard
              index={index}
              picUrl={pl.picUrl}
              name={pl.name}
              id={pl.id}
            />
          ))}
      </div>

      <hr className="border-neutral-200 dark:border-neutral-800 my-3" />
      <ArrowHeading onClick={() => router.push("/newsongs")}>
        新歌速递
      </ArrowHeading>
      <div className="mt-4 px-6 md:px-0 sm:px-0 space-x-4 flex flex-row overflow-x-auto w-full">
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

      <hr className="border-neutral-200 dark:border-neutral-800 my-3" />
      <ArrowHeading>推荐MV</ArrowHeading>
      <div className="mt-4 px-6 md:px-0 sm:px-0 space-x-4 flex flex-row overflow-x-auto w-full">
        {newMv &&
          newMv.map((track, index) => (
            <MvCard
              index={index}
              id={track.id}
              name={track.name}
              ar={track.artists.map((artist) => artist.name).join(" / ")}
              picUrl={track.picUrl}
            />
          ))}
      </div>
    </div>
  );
}

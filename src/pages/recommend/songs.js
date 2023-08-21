import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import FullSongButton from "@/components/FullSongButton";
import axios from "axios";

export default function Highquality() {
  const [songs, setSongs] = useState([]);

  const fetchNewSongs = async () => {
    try {
      const response = await axios.get(
        "https://cf233.eu.org/recommend/songs?limit=8",
        {
          withCredentials: true,
        }
      );
      const data = response.data.data;
      const songData = data.dailySongs;
      setSongs(songData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchNewSongs();
  }, []);

  const router = useRouter();
  return (
    <div className="max-w-7xl mx-auto px-0 md:px-6 sm:px-6 py-8 mb-20 overflow-hidden">
      <Head>
        <title>每日推荐歌曲</title>
      </Head>
      <h1 className="px-6 md:px-0 sm:px-0 font-semibold text-2xl md:text-3xl sm:text-4xl">
        每日推荐歌曲
      </h1>
      <hr className="border-neutral-200 dark:border-neutral-800 my-3" />
      <div className="columns-2 md:columns-4 sm:columns-5 mt-6 px-6 md:px-0 sm:px-0">
        {songs &&
          songs.map((track, index) => (
            <FullSongButton
              key={track.id}
              index={index}
              id={track.id}
              name={track.name}
              duration={track.durationTime}
              ar={track.ar.map((artist) => artist.name).join(" / ")}
              picUrl={track.al.picUrl}
              reason={track.reason}
            />
          ))}
      </div>
    </div>
  );
}

import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import PlaylistCard from "@/components/PlaylistCard";
import axios from "axios";

export default function Highquality() {
  const [playlist, setPlaylist] = useState([]);

  const fetchNewPl = async () => {
    try {
      const response = await axios.get(
        "https://cf233.eu.org/recommend/resource",
        {
          withCredentials: true,
        }
      );
      const data = response.data;
      const plData = data.recommend;
      setPlaylist(plData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchNewPl();
  }, []);

  const router = useRouter();
  return (
    <div className="max-w-7xl mx-auto px-0 md:px-6 sm:px-6 py-8 mb-20 overflow-hidden">
      <Head>
        <title>每日推荐歌单</title>
      </Head>
      <h1 className="px-6 md:px-0 sm:px-0 font-semibold text-2xl md:text-3xl sm:text-4xl">
        每日推荐歌单
      </h1>
      <hr className="border-neutral-200 dark:border-neutral-800 my-3" />
      <div className="columns-1 md:columns-2 sm:columns-3 mt-6 px-6 md:px-0 sm:px-0">
        {playlist.length > 0 &&
          playlist.map((pl, index) => (
            <PlaylistCard
              key={pl.id}
              index={index}
              picUrl={pl.picUrl}
              name={pl.name}
              id={pl.id}
              copywriter={pl.copywriter}
            />
          ))}
      </div>
    </div>
  );
}

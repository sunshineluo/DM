import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import PlaylistCard from "@/components/PlaylistCard";

export default function Highquality() {
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchHighQualityPlaylists = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`https://cf233.eu.org/personalized`);
        const data = await response.json();
        if (data && data.code === 200) {
          setPlaylists(data.result);
          setIsLoading(false);
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
  const router = useRouter();
  return (
    <div className="max-w-7xl mx-auto px-0 md:px-6 sm:px-6 py-8 mb-20 overflow-hidden">
      <Head>
        <title>推荐歌单</title>
      </Head>
      <h1 className="px-6 md:px-0 sm:px-0 font-semibold text-3xl md:text-4xl sm:text-5xl">
        推荐歌单
      </h1>
      <hr className="border-neutral-200 dark:border-neutral-800 my-3" />
      <div className="columns-1 md:columns-2 sm:columns-3 mt-6 px-6 md:px-0 sm:px-0">
        {playlists.length > 0 &&
          playlists.map((pl, index) => (
            <PlaylistCard
              key={pl.id}
              index={index}
              picUrl={pl.picUrl}
              name={pl.name}
              id={pl.id}
            />
          ))}
      </div>
    </div>
  );
}

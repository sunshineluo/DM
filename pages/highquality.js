import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

export default function Highquality() {
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchHighQualityPlaylists = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `https://cf233.eu.org/top/playlist/highquality?cat=全部`
        );
        const data = await response.json();
        if (data && data.code === 200) {
          setPlaylists(data.playlists);
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
    <div className="max-w-4xl mx-auto px-0 py-8">
      <Head>
        <title>精品歌单</title>
      </Head>

      <h2 className="px-6 text-neutral-700 dark:text-neutral-300 font-medium text-lg md:text-3xl sm:text-4xl">
        精品歌单
      </h2>

      <div className="columns-1 md:columns-2 sm:columns-2 mt-6 px-6 md:px-0 sm:px-0">
        {playlists.length > 0 &&
          playlists.map((playlist, index) => (
            <button
              key={playlist.id}
              onClick={() => router.push(`/playlist?id=${playlist.id}`)}
              className="flex flex-col w-full h-[35.5rem] overflow-hidden"
            >
              <img
                src={playlist.coverImgUrl}
                className="rounded-xl w-full mt-8"
              />
              <div className=" px-2 py-2 md:py-4 sm:py-4">
                <h1 className="font-medium text-base md:text-xl sm:text-xl text-left">
                  {playlist.name}
                </h1>

                <p className="mt-2 opacity-75 text-xs md:text-sm sm:text-sm truncate">
                  {playlist.description}
                </p>
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

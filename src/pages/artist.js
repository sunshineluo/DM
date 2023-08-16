import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import moment from "moment";
import { Icon } from "@iconify/react";
import Head from "next/head";
import SongButton from "@/components/SongButton";
import LazyLoad from "react-lazy-load";

const Artist = () => {
  const [arData, setArData] = useState(null);
  const [arSongs, setArSongs] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  const getArDetail = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `https://cf233.eu.org/artist/detail?id=${id}`
      );
      if (response.data.code === 200) {
        setArData(response.data.data.artist);
        console.log(arData);
      }
    } catch (error) {
      console.log("An error occurred while fetching Ar data:", error);
    }
  };

  const getArSongs = async () => {
    try {
      const response = await axios.get(
        `https://cf233.eu.org/artist/top/song?id=${id}`
      );
      if (response.data.code === 200) {
        setArSongs(response.data.songs);
        setIsLoading(false);
      }
    } catch (error) {
      console.log("An error occurred while fetching ArSongs:", error);
    }
  };

  useEffect(() => {
    getArDetail();
    getArSongs();
  }, [id]);

  return (
    <div className="max-w-7xl mx-auto py-8 overflow-hidden px-0 md:px-6 sm:px-6 mb-20">
      <Head>{arData && <title>{arData.name}</title>}</Head>

      {arData && (
        <div>
          <div className="flex flex-col md:flex-row sm:flex-row space-y-4 md:space-y-0 sm:space-y-0 space-x-0 md:space-x-6 sm:space-x-6">
            <div className="w-full md:w-1/2 sm:w-1/2">
              <LazyLoad>
                <img
                  src={arData.cover}
                  className="rounded-none md:rounded-xl sm:rounded-xl"
                />
              </LazyLoad>
            </div>
            <div className="w-full md:w-1/2 sm:w-1/2 flex flex-col space-y-4">
              <div className="flex flex-row space-x-4 w-full rounded-none md:rounded-xl sm:rounded-xl px-6 py-4 bg-neutral-200 dark:bg-neutral-800">
                <img
                  src={arData.avatar}
                  className="rounded-full w-14 h-14 md:w-16 md:h-16 sm:w-16 sm:h-16"
                />
                <div className="space-y-2 flex flex-col">
                  <h1 className="font-medium text-base md:text-lg sm:text-xl mt-4">
                    {arData.name}
                  </h1>
                </div>
              </div>
              <div className="text-[0.64rem] md:text-xs sm:text-[0.925rem] leading-snug opacity-75 rounded-none md:rounded-xl sm:rounded-xl px-6 py-4 bg-neutral-200 dark:bg-neutral-800">
                <p>{arData.briefDesc}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <h2 className="mt-16 px-6 md:px-0 sm:px-0 text-neutral-700 dark:text-neutral-300 font-medium text-lg md:text-xl sm:text-2xl">
        歌手50首热门单曲
      </h2>

      <div className="px-0 mt-6 mb-16 columns-1 md:columns-2 sm:columns-2 w-full">
        {arSongs &&
          arSongs.map((track, index) => (
            <SongButton
              key={track.id}
              index={index}
              id={track.id}
              name={track.name}
              ar={track.ar.map((artist) => artist.name).join(" / ")}
              picUrl={track.al.picUrl}
            />
          ))}
      </div>

      {isLoading && (
        <p className="flex flex-row px-6 md:px-0 sm:px-0 justify-start -mt-6">
          <Icon icon="eos-icons:loading" className="w-8 h-8" />
        </p>
      )}
    </div>
  );
};

export default Artist;

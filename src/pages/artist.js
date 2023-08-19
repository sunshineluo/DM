import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import moment from "moment";
import { Icon } from "@iconify/react";
import Head from "next/head";
import SongButton from "@/components/SongButton";
import LazyLoad from "react-lazy-load";
import ReadMore from "@/components/ReadMore";
import Heading from "@/components/Heading";

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
          <div className="h-[36.5rem] overflow-hidden bg-center">
            <LazyLoad>
              <img
                src={arData.cover}
                className="rounded-none md:rounded-xl sm:rounded-xl object-cover w-full"
              />
            </LazyLoad>
          </div>
          <div className="absolute flex flex-row -mt-80 md:-mt-24 sm:-mt-24 px-6 md:px-12 sm:px-12 space-x-4 py-2 text-white text-2xl md:text-3xl sm:text-4xl">
            <Icon
              icon="bi:play-circle-fill"
              className="text-red-600 bg-white rounded-full cursor-pointer mt-5"
            />
            <h1 className="font-semibold mt-4">{arData.name}</h1>
          </div>
        </div>
      )}
      <br />
      <Heading>歌手50首热门单曲</Heading>

      <div className="px-0 mt-6 mb-16 w-full">
        {arSongs &&
          arSongs.map((track, index) => (
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
        <p className="flex flex-row px-6 md:px-0 sm:px-0 justify-start -mt-6">
          <Icon icon="eos-icons:loading" className="w-8 h-8" />
        </p>
      )}
    </div>
  );
};

export default Artist;

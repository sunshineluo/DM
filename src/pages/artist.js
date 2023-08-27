import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { Icon } from "@iconify/react";
import Head from "next/head";
import LazyLoad from "react-lazy-load";
import Heading from "@/components/Heading";
import SongButton from "@/components/SongButton";
import ArtistCard from "@/components/ArCard";
import MvCard from "@/components/MvCard";
import AlbumCard from "@/components/AlbumCard";
import ArReadMore from "@/components/ArtistReadMore";

const Artist = () => {
  const [arData, setArData] = useState(null);
  const [arSongs, setArSongs] = useState(null);
  const [arMVs, setArMVs] = useState(null);
  const [arAlbums, setArAlbums] = useState(null);
  const [similarArtists, setSimilarArtists] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      const getArDetail = async () => {
        try {
          setIsLoading(true);
          const arDataResponse = await axios.get(
            `https://cf233.eu.org/artist/detail?id=${id}`
          );
          if (arDataResponse.data.code === 200) {
            setArData(arDataResponse.data.data.artist);
          }
        } catch (error) {
          console.error("An error occurred while fetching Ar data:", error);
        }
      };

      const getArSongs = async () => {
        try {
          const arSongsResponse = await axios.get(
            `https://cf233.eu.org/artist/top/song?id=${id}`
          );
          if (arSongsResponse.data.code === 200) {
            setArSongs(arSongsResponse.data.songs);
          }
        } catch (error) {
          console.error("An error occurred while fetching ArSongs:", error);
        }
      };

      const getArMVs = async () => {
        try {
          const arMVsResponse = await axios.get(
            `https://cf233.eu.org/artist/mv?id=${id}`
          );
          if (arMVsResponse.data.code === 200) {
            setArMVs(arMVsResponse.data.mvs);
          }
        } catch (error) {
          console.error("An error occurred while fetching ArMVs:", error);
        }
      };

      const getArAlbums = async () => {
        try {
          const arAlbumsResponse = await axios.get(
            `https://cf233.eu.org/artist/album?id=${id}&limit=5`
          );
          if (arAlbumsResponse.data.code === 200) {
            setArAlbums(arAlbumsResponse.data.hotAlbums);
          }
        } catch (error) {
          console.error("An error occurred while fetching ArAlbums:", error);
        }
      };

      const getSimilarArtists = async () => {
        try {
          const similarArtistsResponse = await axios.get(
            `https://cf233.eu.org/simi/artist?id=${id}`,
            {
              withCredentials: true,
            }
          );
          if (similarArtistsResponse.data.code === 200) {
            setSimilarArtists(similarArtistsResponse.data.artists);
            console.log(similarArtists);
          }
        } catch (error) {
          console.error(
            "An error occurred while fetching SimilarArtists:",
            error
          );
        } finally {
          setIsLoading(false);
        }
      };

      getArDetail();
      getArSongs();
      getArMVs();
      getArAlbums();
      getSimilarArtists();
    }

    return () => {
      // 清理函数
    };
  }, [id]);

  return (
    <div className="max-w-7xl mx-auto py-8 overflow-hidden px-0 md:px-6 sm:px-6 mb-20">
      <Head>{arData && <title>{arData.name}</title>}</Head>

      {arData && (
        <div>
          <div className="h-[18.5rem] md:h-[36.5rem] sm:h-[36.5rem] overflow-hidden bg-center relative">
            <LazyLoad>
              <img
                src={arData.cover}
                className="rounded-none md:rounded-xl sm:rounded-xl object-cover w-full"
              />
            </LazyLoad>
            <div className="absolute flex flex-row bottom-6 md:bottom-8 sm:bottom-8 px-6 md:px-8 sm:px-12 space-x-4 py-2 text-white text-2xl md:text-3xl sm:text-4xl">
              <Icon
                icon="bi:play-circle-fill"
                className="text-red-600 cursor-pointer mt-5"
              />
              <h1 className="font-semibold mt-4">{arData.name}</h1>
            </div>
          </div>
        </div>
      )}

      <div className="px-6 md:px-0 sm:px-0 mt-12">
        {arData && <ArReadMore text={arData.briefDesc} maxCharCount={400} />}
      </div>

      <>
        <p className="mt-12 px-6 md:px-0 sm:px-0 flex flex-row overflow-x-auto space-x-3 text-sm opacity-75">
          <a href="#song" className="hover:underline">
            50首热门单曲
          </a>
          <a href="#mv" className="hover:underline">
            MV
          </a>
          <a href="#album" className="hover:underline">
            专辑
          </a>
          <a href="#related" className="hover:underline">
            相关歌手
          </a>
        </p>
        <div className="mt-6">
          <Heading id="song">歌手50首热门单曲</Heading>
        </div>

        <div className="px-0 mt-8 w-full">
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

        <div className="mt-6">
          <Heading id="mv">歌手MV</Heading>
        </div>
        <div className="px-0 mt-8 w-full">
          <div className="mt-4 px-6 md:px-0 sm:px-0 space-x-4 flex flex-row overflow-x-auto w-full">
            {arMVs &&
              arMVs.map((track, index) => (
                <MvCard
                  key={track.id}
                  index={index}
                  id={track.id}
                  name={track.name}
                  picUrl={track.imgurl}
                  ar={Array.from(track.artist)
                    .map((artist) => artist.name)
                    .join(" / ")}
                />
              ))}
          </div>
        </div>

        <div className="mt-6">
          <Heading id="album">歌手专辑</Heading>
        </div>
        <div className="px-0 mt-8 w-full">
          <div className="mt-4 px-6 md:px-0 sm:px-0 space-x-4 flex flex-row overflow-x-auto w-full">
            {arAlbums &&
              arAlbums.map((al, index) => (
                <AlbumCard
                  key={al.id}
                  index={index}
                  picUrl={al.picUrl}
                  name={al.name}
                  id={al.id}
                />
              ))}
          </div>
        </div>

        <div className="mt-6">
          <Heading id="related">相关歌手</Heading>
        </div>
        <div className="px-0 mt-8 w-full">
          <div className="px-6 md:px-0 sm:px-0 my-4 flex flex-row space-x-[-64px] overflow-x-auto">
            {similarArtists &&
              similarArtists.map((artist, index) => (
                <ArtistCard
                  key={artist.id}
                  picUrl={artist.picUrl}
                  name={artist.name}
                  id={artist.id}
                  index={index}
                />
              ))}
          </div>
        </div>
      </>
    </div>
  );
};

export default Artist;

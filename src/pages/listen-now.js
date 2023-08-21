import Head from "next/head";
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { SongIdsContext } from "@/components/SongIdsContext";
import ArrowHeading from "@/components/ArrowHeading";
import PlaylistCard from "@/components/PlaylistCard";
import FullSongButton from "@/components/FullSongButton";
import IsNotLogin from "@/components/IsNotLogin";

export default function ListenNow() {
  const router = useRouter();
  const [playlist, setPlaylist] = useState([]);
  const [songs, setSongs] = useState([]);
  const [fm, setFm] = useState([]);
  const [songId, setSongId] = useState([]);
  const [songDetails, setSongDetails] = useState([]);

  const fetchNewPl = async () => {
    try {
      const response = await axios.get(
        "https://cf233.eu.org/recommend/resource?limit=6",
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
    fetchNewPl();
    fetchNewSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const response = await axios.get(`https://cf233.eu.org/personal_fm`, {
        withCredentials: true,
      });

      if (response.data.code === 200) {
        const data = response.data;
        setFm(data.data);
        setSongId(data.data.map((song) => song.id));
        fetchSongDetails(data.data.map((song) => song.id));
      } else {
        console.log("获取私人FM失败！");
      }
    } catch (error) {
      console.error(error);
      // 处理错误情况
    }
  };

  const { songIds, currentSongIndex, addToPlaylist } =
    useContext(SongIdsContext);

  const fetchSongDetails = async (songId) => {
    try {
      const response = await fetch(
        `https://cf233.eu.org/song/detail?ids=${songId.join(",")}`
      );
      const data = await response.json();
      if (data && data.code === 200) {
        setSongDetails(data.songs);
      }
    } catch (error) {
      console.log("An error occurred while fetching song details:", error);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, [songIds[currentSongIndex]]);

  function cn(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  const handleAddToPlaylist = (trackId) => {
    addToPlaylist(trackId);
  };

  const userDataStr = localStorage.getItem("userData");
  const userData = JSON.parse(userDataStr);
  return (
    <div className="max-w-7xl mx-auto px-0 md:px-6 sm:px-6 py-8 mb-20 overflow-hidden">
      <Head>
        <title>现在就听</title>
      </Head>

      {userData && (
        <>
          <h1 className="px-6 md:px-0 sm:px-0 font-semibold text-3xl md:text-4xl sm:text-5xl">
            现在就听
          </h1>
          <hr className="border-neutral-200 dark:border-neutral-800 my-3" />
          <ArrowHeading onClick={() => router.push("/recommend/playlist")}>
            每日推荐歌单
          </ArrowHeading>
          <div className="mt-4 px-6 md:px-0 sm:px-0 space-x-4 flex flex-row overflow-x-auto w-full">
            {playlist &&
              playlist.length > 0 &&
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
          <hr className="border-neutral-200 dark:border-neutral-800 my-3" />
          <ArrowHeading onClick={() => router.push("/recommend/songs")}>
            每日推荐歌曲
          </ArrowHeading>
          <div className="mt-4 px-6 md:px-0 sm:px-0 space-x-4 flex flex-row overflow-x-auto w-full">
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
          <hr className="border-neutral-200 dark:border-neutral-800 my-3" />
          <ArrowHeading>每日私人漫游</ArrowHeading>
          <div className="mt-4 px-6 md:px-0 sm:px-0 space-x-4 md:space-x-[-86px] sm:space-x-[-512px]  flex flex-row overflow-x-auto w-full">
            {songDetails &&
              songDetails.map((track, index) => (
                <FullSongButton
                  key={track.id}
                  index={index}
                  id={track.id}
                  name={track.name}
                  duration={track.dt}
                  ar={track.ar.map((artist) => artist.name).join(" / ")}
                  picUrl={track.al.picUrl}
                />
              ))}
          </div>{" "}
        </>
      )}

      {!userData && <IsNotLogin />}
    </div>
  );
}

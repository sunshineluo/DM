import React, { useState, useEffect, useContext } from "react";
import { Icon } from "@iconify/react";
import { SongIdsContext } from "@/components/SongIdsContext";
import Head from "next/head";
import { useRouter } from "next/router";
import LazyLoad from "react-lazy-load";
import FullSongButton from "@/components/FullSongButton";
import Heading from "@/components/Heading";
import PlaylistCard from "@/components/PlaylistCard";
import MvCard from "@/components/MvCard";
import ArtistCard from "@/components/ArCard";
import AlbumCard from "@/components/AlbumCard";

const MusicSearch = () => {
  const [keywords, setKeywords] = useState("");
  const [word, setWord] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [songDetail, setSongDetail] = useState([]);
  const [artistDetail, setArtistDetail] = useState([]);
  const [playlistDetail, setPlaylistDetail] = useState([]);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [hotSearchList, setHotSearchList] = useState([]);
  const [albumDetail, setAlbumDetail] = useState([]);
  const [videoDetail, setVideoDetail] = useState([]);
  const [mvDetail, setMvDetail] = useState([]);

  useEffect(() => {
    const fetchHotSearchList = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("https://cf233.eu.org/search/hot/detail");
        const data = await response.json();
        if (data && data.code === 200) {
          setHotSearchList(data.data);
          setIsLoading(false);
        }
      } catch (error) {
        console.error(
          "An error occurred while fetching hot search list:",
          error
        );
      }
    };

    fetchHotSearchList();
  }, []);

  useEffect(() => {
    const storedKeywords = localStorage.getItem("searchKeywords");
    if (storedKeywords) {
      setKeywords(storedKeywords);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault(); // 阻止表单默认提交行为
    setIsLoading(true);
    setWord(keywords);

    try {
      const [
        songResponse,
        artistResponse,
        playlistResponse,
        albumResponse,
        mvResponse,
        videoResponse,
      ] = await Promise.all([
        fetch(
          `https://cf233.eu.org/search?keywords=${encodeURIComponent(keywords)}`
        ),
        fetch(
          `https://cf233.eu.org/search?type=100&keywords=${encodeURIComponent(
            keywords
          )}`
        ),
        fetch(
          `https://cf233.eu.org/search?type=1000&keywords=${encodeURIComponent(
            keywords
          )}`
        ),
        fetch(
          `https://cf233.eu.org/search?type=10&keywords=${encodeURIComponent(
            keywords
          )}`
        ),
        fetch(
          `https://cf233.eu.org/search?type=1004&keywords=${encodeURIComponent(
            keywords
          )}`
        ),
        fetch(
          `https://cf233.eu.org/search?type=1014&keywords=${encodeURIComponent(
            keywords
          )}`
        ),
      ]);

      const songData = await songResponse.json();
      const artistData = await artistResponse.json();
      const playlistData = await playlistResponse.json();
      const albumData = await albumResponse.json();
      const mvData = await mvResponse.json();
      const videoData = await videoResponse.json();

      if (songData && songData.code === 200) {
        const songIds = songData.result.songs.map((song) => song.id);
        await fetchSongDetails(songIds);
      }

      if (artistData && artistData.code === 200) {
        setArtistDetail(artistData.result.artists);
      }

      if (playlistData && playlistData.code === 200) {
        setPlaylistDetail(playlistData.result.playlists);
      }

      if (albumData && albumData.code === 200) {
        setAlbumDetail(albumData.result.albums);
      }

      if (mvData && mvData.code === 200) {
        setMvDetail(mvData.result.mvs);
      }

      if (videoData && videoData.code === 200) {
        setVideoDetail(videoData.result.videos);
      }

      localStorage.setItem("searchKeywords", keywords); // 将搜索关键词保存在本地存储中
    } catch (error) {
      console.log("An error occurred while searching:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSongDetails = async (songIds) => {
    try {
      const response = await fetch(
        `https://cf233.eu.org/song/detail?ids=${songIds.join(",")}`
      );
      const data = await response.json();
      if (data && data.code === 200) {
        setSongDetail(data.songs);
      }
    } catch (error) {
      console.log("An error occurred while fetching song details:", error);
    }
  };

  const {
    songIds,
    currentSongIndex,
    setCurrentSongIndex,
    addAllToPlaylist,
    addToPlaylist,
  } = useContext(SongIdsContext);

  const playingSongId = songIds[currentSongIndex];

  const handleAddToPlaylist = (trackId) => {
    addToPlaylist(trackId);
  };

  const handlePlayAll = () => {
    const trackIds = playlistTrack.map((track) => track.id);
    addAllToPlaylist(trackIds); // 将所有歌曲ID传递给 addAllToPlaylist 函数
  };

  return (
    <div className="max-w-7xl mx-auto px-0 md:px-6 sm:px-6 py-8 mb-20 overflow-hidden">
      <Head>
        <title>搜索</title>
      </Head>

      <h1 className="px-6 md:px-0 sm:px-0 font-semibold text-3xl md:text-4xl sm:text-5xl whitespace-nowrap">
        {songDetail.length > 0 ? <>"{word}" 的搜索结果</> : <>搜索</>}
      </h1>
      <hr className="border-neutral-200 dark:border-neutral-800 my-3" />
      <div className="mt-6 flex flex-row justify-start w-full px-6 md:px-0 sm:px-0">
        <form onSubmit={handleSearch}>
          <Icon
            icon="bi:search"
            className="absolute opacity-75 w-5 h-5 mt-2.5 md:mt-3 sm:mt-3 ml-2.5"
          />
          <input
            type="search"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="好音乐一搜即得"
            className="bg-neutral-100 dark:bg-neutral-900 dark:border-neutral-800 border-neutral-200 w-full md:w-[32rem] sm:w-[36rem] px-10 py-1.5 md:py-2 sm:py-2 focus:outline-none text-lg md:text-xl sm:text-xl focus:ring-2 focus:ring-red-600 border-[1.5px] rounded-xl"
          />
          <button type="submit" className="hidden">
            Search
          </button>{" "}
          {/* 隐藏实际的提交按钮 */}
        </form>
      </div>
      {songDetail && (
        <p className="px-6 md:px-0 sm:px-0 flex flex-row overflow-x-auto space-x-3 mt-4 text-sm opacity-75">
          <a href="#song" className="hover:underline">
            单曲
          </a>
          <a href="#artist" className="hover:underline">
            艺术家
          </a>
          <a href="#playlist" className="hover:underline">
            歌单
          </a>
          <a href="#album" className="hover:underline">
            专辑
          </a>
          <a href="#mv" className="hover:underline">
            MV
          </a>
        </p>
      )}
      <div className="px-6 md:px-0 sm:px-0 my-8">
        {!songDetail.length > 0 && isLoading === false && (
          <h1 className="text-3xl font-semibold flex align-middle items-center">
            试试搜索
            <span className="slider">
              {hotSearchList
                .sort(() => Math.random() - 1)
                .slice(0, 3)
                .map((item, index) => (
                  <span
                    onClick={() => setKeywords(item.searchWord)}
                    key={index}
                    className="slider__word text-red-600 cursor-pointer"
                  >
                    {item.searchWord}
                  </span>
                ))}
            </span>
          </h1>
        )}
      </div>
      {songDetail.length > 0 && (
        <>
          {songDetail && <Heading id="song">单曲</Heading>}
          <hr className="border-neutral-200 dark:border-neutral-800 my-3" />
          <div className="mt-4 px-6 md:px-0 sm:px-0 space-x-4 flex flex-row overflow-x-auto w-full">
            {songDetail &&
              !isLoading &&
              songDetail
                .slice(0, 15)
                .map((track, index) => (
                  <FullSongButton
                    key={track.id}
                    index={index}
                    id={track.id}
                    name={track.name}
                    ar={track.ar.map((artist) => artist.name).join(" / ")}
                    picUrl={track.al.picUrl}
                    duration={track.dt}
                  />
                ))}
          </div>

          <div className="mt-4 px-6 md:px-0 sm:px-0 space-x-4 flex flex-row overflow-x-auto w-full">
            {songDetail &&
              !isLoading &&
              songDetail
                .slice(16, 30)
                .map((track, index) => (
                  <FullSongButton
                    key={track.id}
                    index={index}
                    id={track.id}
                    name={track.name}
                    ar={track.ar.map((artist) => artist.name).join(" / ")}
                    picUrl={track.al.picUrl}
                    duration={track.dt}
                  />
                ))}
          </div>

          {songDetail && !isLoading && <Heading id="artist">艺术家</Heading>}
          <hr className="border-neutral-200 dark:border-neutral-800 my-3" />
          <div className="px-6 md:px-0 sm:px-0 my-4 flex flex-row space-x-[-64px] overflow-x-auto">
            {artistDetail &&
              !isLoading &&
              artistDetail.map((artist, index) => (
                <ArtistCard
                  key={artist.id}
                  index={index}
                  id={artist.id}
                  picUrl={artist.picUrl}
                  name={artist.name}
                />
              ))}
          </div>
          {songDetail && !isLoading && <Heading id="playlist">歌单</Heading>}
          <hr className="border-neutral-200 dark:border-neutral-800 my-3" />
          <div className="mt-4 px-6 md:px-0 sm:px-0 space-x-4 flex flex-row overflow-x-auto w-full">
            {playlistDetail.length > 0 &&
              playlistDetail
                .slice(0, 10)
                .map((pl, index) => (
                  <PlaylistCard
                    key={pl.id}
                    index={index}
                    picUrl={pl.coverImgUrl}
                    name={pl.name}
                    id={pl.id}
                  />
                ))}
          </div>
          <div className="mt-4 px-6 md:px-0 sm:px-0 space-x-4 flex flex-row overflow-x-auto w-full">
            {playlistDetail.length > 0 &&
              playlistDetail
                .slice(11, 20)
                .map((pl, index) => (
                  <PlaylistCard
                    key={pl.id}
                    index={index}
                    picUrl={pl.coverImgUrl}
                    name={pl.name}
                    id={pl.id}
                  />
                ))}
          </div>
          <div className="mt-4 px-6 md:px-0 sm:px-0 space-x-4 flex flex-row overflow-x-auto w-full">
            {playlistDetail.length > 0 &&
              playlistDetail
                .slice(20, 30)
                .map((pl, index) => (
                  <PlaylistCard
                    key={pl.id}
                    index={index}
                    picUrl={pl.coverImgUrl}
                    name={pl.name}
                    id={pl.id}
                  />
                ))}
          </div>
          {songDetail && !isLoading && <Heading id="album">专辑</Heading>}
          <hr className="border-neutral-200 dark:border-neutral-800 my-3" />
          <div className="mt-4 px-6 md:px-0 sm:px-0 space-x-4 flex flex-row overflow-x-auto w-full">
            {albumDetail &&
              !isLoading &&
              albumDetail
                .slice(0, 15)
                .map((al, index) => (
                  <AlbumCard
                    key={al.id}
                    index={index}
                    picUrl={al.picUrl}
                    name={al.name}
                    id={al.id}
                  />
                ))}
          </div>
          <div className="mt-4 px-6 md:px-0 sm:px-0 space-x-4 flex flex-row overflow-x-auto w-full">
            {albumDetail &&
              !isLoading &&
              albumDetail
                .slice(16, 30)
                .map((al, index) => (
                  <AlbumCard
                    key={al.id}
                    index={index}
                    picUrl={al.picUrl}
                    name={al.name}
                    id={al.id}
                  />
                ))}
          </div>
          {songDetail && !isLoading && <Heading id="mv">MV</Heading>}
          <hr className="border-neutral-200 dark:border-neutral-800 my-3" />
          <div className="mt-4 px-6 md:px-0 sm:px-0 space-x-4 flex flex-row overflow-x-auto w-full">
            {mvDetail &&
              !isLoading &&
              mvDetail
                .slice(0, 15)
                .map((track, index) => (
                  <MvCard
                    key={track.id}
                    index={index}
                    id={track.id}
                    name={track.name}
                    ar={track.artists.map((artist) => artist.name).join(" / ")}
                    picUrl={track.cover}
                  />
                ))}
          </div>
          <div className="mt-4 px-6 md:px-0 sm:px-0 space-x-4 flex flex-row overflow-x-auto w-full">
            {mvDetail &&
              !isLoading &&
              mvDetail
                .slice(16, 30)
                .map((track, index) => (
                  <MvCard
                    key={track.id}
                    index={index}
                    id={track.id}
                    name={track.name}
                    ar={track.artists.map((artist) => artist.name).join(" / ")}
                    picUrl={track.cover}
                  />
                ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MusicSearch;

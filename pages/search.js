import React, { useState, useEffect, useContext } from "react";
import { Icon } from "@iconify/react";
import { SongIdsContext } from "@/components/SongIdsContext";
import Head from "next/head";
import * as Tabs from "@radix-ui/react-tabs";
import { useRouter } from "next/router";
import LazyLoad from "react-lazy-load";
import SongButton from "@/components/SongButton";

const MusicSearch = () => {
  const [keywords, setKeywords] = useState("");
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
    <div className="max-w-7xl mx-auto px-0 py-8">
      <Head>
        <title>智能搜索</title>
      </Head>

      <div className="mt-6 flex flex-row justify-center w-full px-6">
        <form onSubmit={handleSearch}>
          <Icon
            icon="bi:search"
            className="absolute text-neutral-700 dark:text-neutral-300 opacity-75 w-5 h-5 mt-2.5 md:mt-3 sm:mt-3 ml-2.5"
          />
          <input
            type="search"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="好音乐一搜即得"
            className="text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 border-neutral-200 w-full md:w-[32rem] sm:w-[36rem] px-10 py-1.5 md:py-2 sm:py-2 focus:outline-none text-lg md:text-xl sm:text-xl focus:ring-2 focus:ring-red-600 border-[1.5px] rounded-xl"
          />
          <button type="submit" className="hidden">
            Search
          </button>{" "}
          {/* 隐藏实际的提交按钮 */}
        </form>
      </div>

      {!songDetail.length > 0 && isLoading === false && (
        <div className="opacity-75 text-center mt-4">
          <h1>热搜列表</h1>

          <div className="flex justify-center">
            <div className="px-6 md:px-0 sm:px-0 text-left mt-6 gap-4 md:gap-12 sm:gap-12 columns-2 md:columns-3 sm:columns-4 mx-auto">
              {hotSearchList.map((item, index) => (
                <p
                  onClick={() => setKeywords(item.searchWord)}
                  key={index}
                  className="cursor-pointer mb-4 text-base md:text-lg sm:text-xl font-medium py-2 px-4 md:px-6 sm:px-6 rounded-xl bg-neutral-200 dark:bg-neutral-800"
                >
                  <div className="flex flex-row truncate w-32 md:w-36 sm:w-[12rem]">
                    <div>
                      <span className="opacity-50"> {index + 1}</span>{" "}
                      <span className="">{item.searchWord}</span>
                    </div>
                    <div>
                      {item.iconUrl && (
                        <img
                          src={item.iconUrl}
                          className="h-4 md:h-6 sm:h-6 ml-1 md:ml-2 sm:ml-2 mt-1 md:mt-0 sm:mt-0"
                        />
                      )}
                    </div>
                  </div>
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      <Tabs.Root className="TabsRoot" defaultValue="tab1">
        <ul className="mb-16 px-0 md:px-6 sm:px-6">
          <div className="sticky top-2 px-6 md:px-0 sm:px-0 z-[9999] ">
            {" "}
            {songDetail.length > 0 && (
              <Tabs.List
                className="dark:border-neutral-800 border-neutral-200 border-[1.5px] bg-neutral-200/75 dark:bg-neutral-800/75 backdrop-blur-lg rounded-full TabsList py-1.5 mt-6 px-2 max-w-3xl mx-auto flex flex-row space-x-2 md:space-x-4 sm:space-x-4 overflow-x-auto"
                aria-label="类别"
              >
                <>
                  <Tabs.Trigger className="TabsTrigger" value="tab1">
                    单曲
                  </Tabs.Trigger>
                  <Tabs.Trigger className="TabsTrigger" value="tab2">
                    艺术家
                  </Tabs.Trigger>
                  <Tabs.Trigger className="TabsTrigger" value="tab3">
                    歌单
                  </Tabs.Trigger>
                  <Tabs.Trigger className="TabsTrigger" value="tab4">
                    专辑
                  </Tabs.Trigger>
                  <Tabs.Trigger className="TabsTrigger" value="tab5">
                    MV
                  </Tabs.Trigger>
                </>
              </Tabs.List>
            )}
          </div>
          <Tabs.Content className="mt-8 w-auto" value="tab1">
            <div className="columns-1 md:columns-1 sm:columns-2">
              {songDetail &&
                !isLoading &&
                songDetail.map((track, index) => (
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
              <p className="flex flex-row px-6 md:px-0 sm:px-0 justify-center mt-6">
                <Icon icon="eos-icons:loading" className="w-8 h-8" />
              </p>
            )}
          </Tabs.Content>
          <Tabs.Content className="TabsContent mt-8" value="tab2">
            <div className="columns-1 md:columns-1 sm:columns-2">
              {artistDetail &&
                !isLoading &&
                artistDetail.map((artist, index) => (
                  <button
                    key={artist.id}
                    className={`flex flex-row space-x-4 w-full rounded-none md:rounded-xl sm:rounded-xl px-6 py-4 ${
                      index % 2 === 0
                        ? "bg-neutral-200 dark:bg-neutral-800"
                        : "odd"
                    }`}
                  >
                    <LazyLoad offset={100}>
                      <img
                        src={artist.picUrl}
                        className="rounded-full w-14 h-14 md:w-16 md:h-16 sm:w-16 sm:h-16"
                      />
                    </LazyLoad>

                    <div className="flex flex-col space-y-1 mt-1">
                      <span className="font-medium text-left text-xl  mt-3 flex-nowrap flex truncate w-48 md:w-96 sm:w-96">
                        {artist.name}
                      </span>
                    </div>
                  </button>
                ))}
            </div>

            {isLoading && (
              <p className="flex flex-row px-6 md:px-0 sm:px-0 justify-center mt-6">
                <Icon icon="eos-icons:loading" className="w-8 h-8" />
              </p>
            )}
          </Tabs.Content>
          <Tabs.Content className="TabsContent mt-8" value="tab3">
            <div className="columns-1 md:columns-1 sm:columns-2">
              {playlistDetail &&
                !isLoading &&
                playlistDetail.map((playlist, index) => (
                  <button
                    key={playlist.id}
                    onClick={() => router.push(`/playlist?id=${playlist.id}`)}
                    className={`flex flex-row space-x-4 w-full rounded-none md:rounded-xl sm:rounded-xl px-6 py-4 ${
                      index % 2 === 0
                        ? "bg-neutral-200 dark:bg-neutral-800"
                        : "odd"
                    }`}
                  >
                    <LazyLoad offset={100}>
                      <img
                        src={playlist.coverImgUrl}
                        className="rounded-xl w-14 h-14 md:w-16 md:h-16 sm:w-16 sm:h-16"
                      />
                    </LazyLoad>

                    <div className="flex flex-col space-y-1 mt-1">
                      <span className="font-medium text-left w-full flex-nowrap flex overflow-hidden">
                        {playlist.name}
                      </span>
                      <span className="opacity-75 text-left truncate w-48 md:w-96 sm:w-96">
                        {playlist.description}
                      </span>
                    </div>
                  </button>
                ))}
            </div>

            {isLoading && (
              <p className="flex flex-row px-6 md:px-0 sm:px-0 justify-center mt-6">
                <Icon icon="eos-icons:loading" className="w-8 h-8" />
              </p>
            )}
          </Tabs.Content>
          <Tabs.Content className="TabsContent mt-8" value="tab4">
            <div className="columns-1 md:columns-1 sm:columns-2">
              {albumDetail &&
                !isLoading &&
                albumDetail.map((al, index) => (
                  <button
                    key={al.id}
                    onClick={() => router.push(`/album?id=${al.id}`)}
                    className={`flex flex-row space-x-4 w-full rounded-none md:rounded-xl sm:rounded-xl px-6 py-4 ${
                      index % 2 === 0
                        ? "bg-neutral-200 dark:bg-neutral-800"
                        : "odd"
                    }`}
                  >
                    <LazyLoad offset={100}>
                      <img
                        src={al.picUrl}
                        className="rounded-xl w-14 h-14 md:w-16 md:h-16 sm:w-16 sm:h-16"
                      />
                    </LazyLoad>

                    <div className="flex flex-col space-y-1 mt-1">
                      <span className="font-medium text-left truncate w-48 md:w-96 sm:w-96">
                        {al.name}
                      </span>
                      <span className="opacity-75 text-left truncate w-48 md:w-96 sm:w-96">
                        {al.company}
                      </span>
                    </div>
                  </button>
                ))}
            </div>

            {isLoading && (
              <p className="flex flex-row px-6 md:px-0 sm:px-0 justify-center mt-6">
                <Icon icon="eos-icons:loading" className="w-8 h-8" />
              </p>
            )}
          </Tabs.Content>
          <Tabs.Content className="TabsContent mt-8" value="tab5">
            <div className="columns-1 md:columns-2 sm:columns-2">
              {mvDetail &&
                !isLoading &&
                mvDetail.map((mv, index) => (
                  <button
                    key={mv.id}
                    onClick={() => router.push(`/mv?id=${mv.id}`)}
                    className={`flex flex-col space-y-4 w-full rounded-none md:rounded-xl sm:rounded-xl px-6 py-4 ${
                      index % 2 === 0
                        ? "bg-neutral-200 dark:bg-neutral-800"
                        : "odd"
                    }`}
                  >
                    <LazyLoad offset={100}>
                      <img
                        src={mv.cover}
                        className="rounded-xl w-full h-48 md:h-64 sm:h-72"
                      />
                    </LazyLoad>

                    <div className="flex flex-col space-y-1 mt-1">
                      <span className="font-medium text-left w-full flex-nowrap flex overflow-hidden">
                        {mv.name}
                      </span>
                      <span className="opacity-75 text-left truncate w-48 md:w-96 sm:w-96">
                        {mv.artists.map((artist) => artist.name).join(" / ")}
                      </span>
                    </div>
                  </button>
                ))}
            </div>

            {isLoading && (
              <p className="flex flex-row px-6 md:px-0 sm:px-0 justify-center mt-6">
                <Icon icon="eos-icons:loading" className="w-8 h-8" />
              </p>
            )}
          </Tabs.Content>
        </ul>
      </Tabs.Root>
    </div>
  );
};

export default MusicSearch;

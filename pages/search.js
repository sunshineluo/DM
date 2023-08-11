import React, { useState, useEffect, useContext } from "react";
import { Icon } from "@iconify/react";
import { SongIdsContext } from "@/components/SongIdsContext";
import Head from "next/head";
import * as Tabs from "@radix-ui/react-tabs";
import { useRouter } from "next/router";

const MusicSearch = () => {
  const [keywords, setKeywords] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [songDetail, setSongDetail] = useState([]);
  const [artistDetail, setArtistDetail] = useState([]);
  const [playlistDetail, setPlaylistDetail] = useState([]);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [hotSearchList, setHotSearchList] = useState([]);

  useEffect(() => {
    const fetchHotSearchList = async () => {
      try {
        const response = await fetch("https://cf233.eu.org/search/hot/detail");
        const data = await response.json();
        if (data && data.code === 200) {
          setHotSearchList(data.data);
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
      const [songResponse, artistResponse, playlistResponse] =
        await Promise.all([
          fetch(
            `https://cf233.eu.org/search?keywords=${encodeURIComponent(
              keywords
            )}`
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
        ]);

      const songData = await songResponse.json();
      const artistData = await artistResponse.json();
      const playlistData = await playlistResponse.json();

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

      localStorage.setItem("searchKeywords", keywords); // 将搜索关键词保存在本地存储中
      setIsLoading(false);
    } catch (error) {
      console.log("An error occurred while searching:", error);
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

  const { songIds, addAllToPlaylist, addToPlaylist } =
    useContext(SongIdsContext);

  const handleAddToPlaylist = (trackId) => {
    addToPlaylist(trackId);
  };

  const handlePlayAll = () => {
    const trackIds = playlistTrack.map((track) => track.id);
    addAllToPlaylist(trackIds); // 将所有歌曲ID传递给 addAllToPlaylist 函数
  };

  return (
    <div className="max-w-4xl mx-auto px-0 py-8">
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
            className="text-neutral-700 dark:text-neutral-300 bg-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 border-neutral-300 w-full md:w-[32rem] sm:w-[36rem] px-10 py-1.5 md:py-2 sm:py-2 focus:outline-none text-lg md:text-xl sm:text-xl focus:ring-2 focus:ring-red-600 border-2 rounded-xl"
          />
          <button type="submit" className="hidden">
            Search
          </button>{" "}
          {/* 隐藏实际的提交按钮 */}
        </form>
      </div>

      {!songDetail.length > 0 && (
        <div className="opacity-75 text-center mt-4">
          <h1>热搜列表</h1>

          <div className="flex justify-center">
            <div className="px-6 md:px-0 sm:px-0 text-left mt-6 gap-4 md:gap-12 sm:gap-12 columns-2 md:columns-3 sm:columns-3 mx-auto">
              {hotSearchList.map((item, index) => (
                <p
                  onClick={() => setKeywords(item.searchWord)}
                  key={item.id}
                  className="cursor-pointer my-4 text-lg md:text-xl sm:text-xl font-medium py-2 px-6 rounded-xl bg-neutral-200 dark:bg-neutral-800"
                >
                  <div className="flex flex-row">
                    <div>
                      <span className="opacity-50"> {index + 1}</span>{" "}
                      <span>{item.searchWord}</span>
                    </div>
                    <div>{item.iconUrl && (<img src={item.iconUrl} className="h-4 md:h-6 sm:h-6 ml-1 md:ml-2 sm:ml-2 mt-1 md:mt-0 sm:mt-0" />)}</div>
                  </div>
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      <Tabs.Root className="TabsRoot" defaultValue="tab1">
        <ul className="mb-16 px-0 md:px-6 sm:px-6">
          <Tabs.List
            className="TabsList mt-6 px-6 max-w-xl mx-auto flex flex-row space-x-4 overflow-x-auto"
            aria-label="类别"
          >
            {songDetail.length > 0 && (
              <>
                <Tabs.Trigger className="TabsTrigger" value="tab1">
                  单曲
                </Tabs.Trigger>
                <Tabs.Trigger className="TabsTrigger" value="tab2">
                  歌手
                </Tabs.Trigger>
                <Tabs.Trigger className="TabsTrigger" value="tab3">
                  歌单
                </Tabs.Trigger>
              </>
            )}
          </Tabs.List>
          <Tabs.Content className="mt-8 w-auto" value="tab1">
            {songDetail &&
              songDetail.map((track, index) => (
                <button
                  key={track.id}
                  className={`flex flex-row space-x-4 w-full rounded-none md:rounded-xl sm:rounded-xl px-6 py-4 ${
                    index % 2 === 0
                      ? "bg-neutral-200 dark:bg-neutral-800"
                      : "odd"
                  }`}
                  onClick={() => handleAddToPlaylist(track.id)}
                >
                  <img
                    src={track.al.picUrl}
                    className="rounded-xl w-14 h-14 md:w-16 md:h-16 sm:w-16 sm:h-16"
                  />
                  <div className="flex flex-col space-y-1 mt-1">
                    <span className="font-medium text-left w-full flex-nowrap flex overflow-hidden">
                      {track.name}
                    </span>
                    <span className="text-base opacity-75 text-left">
                      {track.ar.map((artist) => artist.name).join(" / ")} -{" "}
                      {track.al.name}
                    </span>
                  </div>
                </button>
              ))}

            {isLoading && (
              <p className="flex flex-row px-6 md:px-0 sm:px-0 justify-center mt-6">
                <Icon icon="eos-icons:loading" className="w-8 h-8" />
              </p>
            )}
          </Tabs.Content>
          <Tabs.Content className="TabsContent mt-8" value="tab2">
            {artistDetail &&
              artistDetail.map((artist, index) => (
                <button
                  key={artist.id}
                  className={`flex flex-row space-x-4 w-full rounded-none md:rounded-xl sm:rounded-xl px-6 py-4 ${
                    index % 2 === 0
                      ? "bg-neutral-200 dark:bg-neutral-800"
                      : "odd"
                  }`}
                >
                  <img
                    src={artist.picUrl}
                    className="rounded-full w-14 h-14 md:w-16 md:h-16 sm:w-16 sm:h-16"
                  />
                  <div className="flex flex-col space-y-1 mt-1">
                    <span className="font-medium text-left w-full text-xl  mt-3 flex-nowrap flex overflow-hidden">
                      {artist.name}
                    </span>
                  </div>
                </button>
              ))}
            {isLoading && (
              <p className="flex flex-row px-6 md:px-0 sm:px-0 justify-center mt-6">
                <Icon icon="eos-icons:loading" className="w-8 h-8" />
              </p>
            )}
          </Tabs.Content>
          <Tabs.Content className="TabsContent mt-8" value="tab3">
            {playlistDetail &&
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
                  <img
                    src={playlist.coverImgUrl}
                    className="rounded-xl w-14 h-14 md:w-16 md:h-16 sm:w-16 sm:h-16"
                  />
                  <div className="flex flex-col space-y-1 mt-1">
                    <span className="font-medium text-left w-full flex-nowrap flex overflow-hidden">
                      {playlist.name}
                    </span>
                    <span className="opacity-75 text-left">
                      {playlist.description}
                    </span>
                  </div>
                </button>
              ))}
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

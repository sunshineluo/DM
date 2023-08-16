import { useState, useEffect } from "react";
import axios from "axios";
import Head from "next/head";
import { Icon } from "@iconify/react";
import LazyLoad from "react-lazy-load";

export default function Playlist() {
  const [playlists, setPlaylists] = useState([]);
  const [userDetail, setUserDetail] = useState([]);
  const [isPlaylistLoading, setIsPlaylistLoading] = useState(false);
  const userDataStr = localStorage.getItem("userData");
  const userData = JSON.parse(userDataStr);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(
          `https://cf233.eu.org/user/detail?uid=${userData.data.account.id}`
        );
        const userDetails = response.data;
        setUserDetail([userDetails]);

        setIsPlaylistLoading(true);

        const playlistResponse = await axios.get(
          `https://cf233.eu.org/user/playlist?uid=${userData.data.account.id}`
        );
        const playlistData = playlistResponse.data;
        setPlaylists(playlistData.playlist);
      } catch (error) {
        console.error(error);
        // 处理错误
      } finally {
        setIsPlaylistLoading(false);
      }
    }

    fetchData(); // 调用 fetchData 函数来获取用户详情和歌单数据
  }, []); // 空数组作为依赖项，确保只在组件挂载后调用一次
  return (
    <div className="max-w-7xl mx-auto px-0 py-8 overflow-y-auto mb-20">
      <Head>
        <title>用户歌单</title>
      </Head>
      <h2 className="mb-6 px-6 text-neutral-700 dark:text-neutral-300 font-medium text-lg md:text-xl sm:text-2xl">
        用户歌单
      </h2>

      <div className="columns-1 md:columns-2 sm:columns-2 px-0 md:px-6 sm:px-6 mt-8">
        {playlists.length > 0 &&
          playlists.map((playlist, index) => (
            <button
              key={playlist.id}
              onClick={() => router.push(`/playlist?id=${playlist.id}`)}
              className={`flex flex-row space-x-4 w-full rounded-none md:rounded-xl sm:rounded-xl px-6 py-4 ${
                index % 2 === 0 ? "bg-neutral-200 dark:bg-neutral-800" : "odd"
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
                <span className="opacity-75 text-left">
                  {playlist.playCount}次播放
                </span>
              </div>
            </button>
          ))}
      </div>
      {isPlaylistLoading && (
        <p className="flex flex-row px-6 md:px-6 sm:px-6">
          <Icon icon="eos-icons:loading" className="w-8 h-8" />
        </p>
      )}
    </div>
  );
}

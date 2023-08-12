import { useState, useEffect } from "react";
import moment from "moment";
import axios from "axios";
import { useRouter } from "next/router";
import Head from "next/head";
import { Icon } from "@iconify/react";

export default function Dashboard() {
  const [userDetail, setUserDetail] = useState([]);
  const [playlists, setPlaylists] = useState([]);
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
  
    fetchData();  // 调用 fetchData 函数来获取用户详情和歌单数据
  }, []);  // 空数组作为依赖项，确保只在组件挂载后调用一次


  const router = useRouter();

  const handlePlaylistClick = (playlistId) => {
    // 将歌单id添加到URL中
    router.push(`/playlist?id=${playlistId}`);
  };
  return (
    <div>
      <Head>
        <title>{userData.data.profile.nickname}, 您今天看上去很聪明！</title>
      </Head>
      <img
        src={userData.data.profile.backgroundUrl}
        className="fixed z-[-1] w-full blur-lg h-screen hidden"
      />
      <div className="bg-neutral-100/75 dark:bg-neutral-900/75 backdrop-blur-3xl w-full min-h-screen">
        <div className="max-w-4xl mx-auto px-0 py-8 overflow-y-auto">
          <div className="px-6">
            <img
              src={userData.data.profile.avatarUrl}
              className="opacity-75 mb-10 border-2 border-neutral-200/50 dark:border-neutral-800/50 w-32 h-32 rounded-full"
            />
          </div>
          <h1 className="px-6 text-3xl md:text-4xl sm:text-5xl flex flex-col md:flex-row sm:flex-row">
            <span className="font-medium text-neutral-700 dark:text-neutral-400">
              {userData.data.profile.nickname},
            </span>{" "}
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              您今天看上去很聪明！
            </span>
          </h1>

          <div className="px-6 mt-12 columns-1 md:columns-2 sm:columns-2">
            <p className="mt-0 flex flex-row space-x-6">
              <span className="opacity-75">简介</span>
              <span className="text-lg md:text-xl sm:text-2xl -mt-1">
                {userData.data.profile.signature}
              </span>
            </p>

            <p className="flex flex-row space-x-6 mt-6">
              <span className="opacity-75">加入</span>
              <span className="text-lg md:text-xl sm:text-2xl -mt-1">
                {moment(userData.data.account.createTime).format(
                  "YYYY年MM月DD日"
                )}
              </span>
            </p>

            <p className="flex flex-row space-x-6 mt-6">
              <span className="opacity-75">生日</span>
              <span className="text-lg md:text-xl sm:text-2xl -mt-1">
                {moment(userData.data.profile.birthday).format(
                  "YYYY年MM月DD日"
                )}
              </span>
            </p>

            <p className="flex flex-row space-x-6 mt-6">
              <span className="opacity-75">最后登录</span>
              <span className="text-lg md:text-xl sm:text-2xl -mt-1">
                {moment(userData.data.profile.lastLoginTime).format(
                  "YYYY年MM月DD日"
                )}
              </span>
            </p>

            <p className="flex flex-row space-x-6 mt-6">
              <span className="opacity-75">等级</span>
              <span className="text-lg md:text-xl sm:text-2xl -mt-1">
                Lv.
                {userDetail.length > 0 &&
                  userDetail.map((user, index) => (
                    <span key={index}>{user.level}</span>
                  ))}
              </span>
            </p>

            <p className="flex flex-row space-x-6 mt-6">
              <span className="opacity-75">听歌</span>
              <span className="text-lg md:text-xl sm:text-2xl -mt-1">
                {userDetail.length > 0 &&
                  userDetail.map((user, index) => (
                    <span key={index}>{user.listenSongs}</span>
                  ))}
                首
              </span>
            </p>
          </div>
          <div className="mt-16">
            <h2 className="px-6 text-neutral-700 dark:text-neutral-300 font-medium text-lg md:text-3xl sm:text-4xl">
              用户歌单
            </h2>

            <div className="px-0 md:px-6 sm:px-6 mt-10 mb-16">
              {playlists.length > 0 &&
                playlists.map((playlist, index) => (
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
                      <span className="font-medium text-lg text-left w-full flex-nowrap flex overflow-hidden">
                        {playlist.name}
                      </span>
                      <span className="opacity-75 text-left">
                        {playlist.playCount}次播放
                      </span>
                    </div>
                  </button>
                ))}

              {isPlaylistLoading && (
                <p className="flex flex-row px-6 md:px-0 sm:px-0 justify-start mt-6 mb-12">
                  <Icon icon="eos-icons:loading" className="w-8 h-8" />
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

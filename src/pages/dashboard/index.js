import { useState, useEffect } from "react";
import moment from "moment";
import axios from "axios";
import { useRouter } from "next/router";
import Head from "next/head";
import { Icon } from "@iconify/react";
import LazyLoad from "react-lazy-load";

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

    fetchData(); // 调用 fetchData 函数来获取用户详情和歌单数据
  }, []); // 空数组作为依赖项，确保只在组件挂载后调用一次

  const router = useRouter();

  const logout = () => {
    // 清除本地存储的 cookie 和用户数据
    localStorage.removeItem("cookie");
    localStorage.removeItem("userData");
    router.reload;
  };

  const handlePlaylistClick = (playlistId) => {
    // 将歌单id添加到URL中
    router.push(`/playlist?id=${playlistId}`);
  };
  return (
    <div>
      <Head>
        <title>我的</title>
      </Head>
      <div className="max-w-7xl mx-auto px-0 py-8 overflow-y-auto mb-20">
        {userData && (
          <div>
            <div className="flex flex-col md:flex-row sm:flex-row space-y-4 md:space-y-0 sm:space-y-0 space-x-0 md:space-x-6 sm:space-x-6">
              <div className="w-full md:w-1/2 sm:w-1/2">
                <LazyLoad>
                  <img
                    src={userData.data.profile.backgroundUrl}
                    className="rounded-none md:rounded-xl sm:rounded-xl"
                  />
                </LazyLoad>
              </div>
              <div className="w-full md:w-1/2 sm:w-1/2 flex flex-col space-y-4">
                <div className="flex flex-row space-x-4 w-full rounded-none md:rounded-xl sm:rounded-xl px-6 py-4 bg-neutral-200 dark:bg-neutral-800">
                  <img
                    src={userData.data.profile.avatarUrl}
                    className="rounded-full w-14 h-14 md:w-16 md:h-16 sm:w-16 sm:h-16"
                  />
                  <div className="space-y-2 flex flex-col">
                    <h1 className="font-medium text-base md:text-lg sm:text-xl mt-4">
                      {userData.data.profile.nickname}
                    </h1>
                  </div>
                </div>
                <div className="columns-2 text-xs md:text-[0.8rem] sm:text-base leading-snug rounded-none md:rounded-xl sm:rounded-xl px-6 py-4 bg-neutral-200 dark:bg-neutral-800">
                  <p>
                    <span className="mr-3">简介</span>
                    <span className="opacity-75 w-36 md:w-56 sm:w-96 truncate">
                      {userData.data.profile.signature}
                    </span>
                  </p>
                  <p className="mt-6">
                    <span className="mr-3">加入</span>
                    <span className="opacity-75">
                      {moment(userData.data.account.createTime).format(
                        "YYYY年MM月DD日"
                      )}
                    </span>
                  </p>

                  <p className="mt-6">
                    <span className="mr-3">生日</span>
                    <span className="opacity-75">
                      {moment(userData.data.profile.birthday).format(
                        "YYYY年MM月DD日"
                      )}
                    </span>
                  </p>

                  <p>
                    <span className="mr-3">最后登录</span>
                    <span className="opacity-75">
                      {moment(userData.data.profile.lastLoginTime).format(
                        "YYYY年MM月DD日"
                      )}
                    </span>
                  </p>

                  <p className="mt-6">
                    <span className="mr-3">等级</span>
                    <span className="opacity-75">
                      Lv.
                      {userDetail.length > 0 &&
                        userDetail.map((user, index) => (
                          <span key={index}>{user.level}</span>
                        ))}
                    </span>
                  </p>

                  <p className="mt-6">
                    <span className="mr-3">听歌</span>
                    <span className="opacity-75">
                      {userDetail.length > 0 &&
                        userDetail.map((user, index) => (
                          <span key={index}>{user.listenSongs}</span>
                        ))}
                      首
                    </span>
                  </p>
                </div>

                <div className="text-xs md:text-xs sm:text-base leading-snug rounded-none md:rounded-xl sm:rounded-xl px-6 py-4 bg-neutral-200 dark:bg-neutral-800">
                  <div className="flex flex-row justify-between">
                    <h2 className="font-medium mb-2">用户歌单</h2>
                    <p className="text-red-600 cursor-pointer" onClick={()=>router.push('/dashboard/playlist')}>查看全部</p>
                  </div>
                  <div className="columns-2">
                    {playlists.length > 0 &&
                      playlists.slice(0, 2).map((playlist, index) => (
                        <button
                          key={playlist.id}
                          onClick={() =>
                            router.push(`/playlist?id=${playlist.id}`)
                          }
                          className={`flex flex-row space-x-4 w-full rounded-none md:rounded-xl sm:rounded-xl py-4 ${
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
                            <span className="opacity-75 text-left">
                              {playlist.playCount}次播放
                            </span>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>

                <div className="text-xs md:text-xs sm:text-base leading-snug rounded-none md:rounded-xl sm:rounded-xl px-6 py-4 bg-neutral-200 dark:bg-neutral-800">
                  <h2 className="font-medium mb-2 text-red-600">危险操作</h2>
                  <button
                    onClick={logout}
                    className="bg-red-600 text-white px-6 py-2 rounded-xl"
                  >
                    退出当前账户
                  </button>

                  <p className="text-[0.54rem] md:text-[0.64rem] sm:text-sm opacity-75 mt-2">
                    ***请注意：登出后所有存储在本地的用户信息将被抹掉，您可能需要再次登录以访问您的账户信息。您可以在/login页面查看实时登录信息（显示在console.log中）
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {!userData && (
          <div className="">
            <div className="max-w-lg mx-auto flex justify-center align-middle py-32">
              <button
                onClick={() => router.push("/login")}
                className="bg-red-600 text-white px-6 py-2 rounded-xl shadow-md"
              >
                使用网易云音乐扫码登录
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

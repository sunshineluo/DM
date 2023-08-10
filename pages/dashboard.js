import { useState, useEffect } from "react";
import moment from "moment";
import axios from "axios";
import { useRouter } from "next/router";
import Head from "next/head";

export default function Dashboard() {
  const [userDetail, setUserDetail] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const userDataStr = localStorage.getItem("userData");
  const userData = JSON.parse(userDataStr);

  async function getUserDetail(userData) {
    try {
      const response = await axios.get(
        `https://cf233.eu.org/user/detail?uid=${userData.data.account.id}`
      );
      const userDetails = response.data;
      setUserDetail([userDetails]);
      // 处理用户详情数据

      // 获取用户歌单
      const playlistResponse = await axios.get(
        `https://cf233.eu.org/user/playlist?uid=${userData.data.account.id}`
      );
      const playlistData = playlistResponse.data;
      setPlaylists(playlistData.playlist);

      // 处理用户歌单数据
    } catch (error) {
      console.error(error);
      // 处理错误
    }
  }

  // 调用函数并传入 userData 作为参数
  getUserDetail(userData);

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
      <div className="bg-neutral-100/75 backdrop-blur-3xl w-full min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-8 overflow-y-auto">
          <img
            src={userData.data.profile.avatarUrl}
            className="opacity-75 mb-10 border-2 border-neutral-200/50 w-32 h-32 rounded-full"
          />
          <h1 className="text-3xl md:text-4xl sm:text-5xl flex flex-col md:flex-row sm:flex-row">
            <span className="font-medium text-neutral-700">
              {userData.data.profile.nickname},
            </span>{" "}
            <span className="font-medium text-neutral-900">您今天看上去很聪明！</span>
          </h1>

          <div className="mt-12 columns-1 md:columns-2 sm:columns-2">
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
            <h2 className="text-neutral-700 font-medium text-lg md:text-3xl sm:text-4xl">
              用户歌单
            </h2>

            <div className="mt-10 columns-1 md:columns-2 sm:columns-2 mb-12">
              {playlists.length > 0 &&
                playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => handlePlaylistClick(playlist.id)}
                    className="flex flex-row space-x-4 rounded-xl py-3"
                  >
                    <img
                      src={playlist.coverImgUrl}
                      className="rounded-xl w-16 h-16 "
                    />
                    <div className="flex flex-col space-y-1">
                      <span className="text-lg md:text-xl sm:text-2xl">{playlist.name}</span>
                      <span className="text-base md:text-lg sm:text-xl opacity-75 text-left">
                        {playlist.playCount}次播放
                      </span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

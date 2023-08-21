import { useState, useEffect } from "react";
import moment from "moment";
import axios from "axios";
import { useRouter } from "next/router";
import Head from "next/head";
import { Icon } from "@iconify/react";
import Heading from "@/components/Heading";
import PlaylistCard from "@/components/PlaylistCard";
import IsNotLogin from "@/components/IsNotLogin";

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
        console.log(userDetail);

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

  const handleSignin = async () => {
    try {
      const response = await axios.get("https://cf233.eu.org/daily_signin", {
        withCredentials: true,
      });
      console.log("签到成功", response.data);
      alert("签到成功，经验 + 3.请勿重复签到！");
      // 处理签到结果
      // ...
    } catch (error) {
      console.error("签到失败", error);
      alert("签到失败，需要登录.请勿重复签到！");
    }
  };

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
            <div className="h-[36.5rem] overflow-hidden bg-center">
              {userDetail.length > 0 &&
                userDetail.map((user, index) => (
                  <img
                    key={index}
                    src={user.profile.backgroundUrl}
                    className="rounded-none md:rounded-xl sm:rounded-xl object-cover w-full"
                  />
                ))}
            </div>
            <div className="absolute flex flex-row -mt-96 md:-mt-24 sm:-mt-24 px-6 md:px-8 sm:px-12 space-x-4 py-2 text-white text-2xl md:text-3xl sm:text-4xl">
              <Icon
                icon="bi:patch-check-fill"
                className="text-red-600 rounded-full cursor-pointer mt-5"
              />
              <h1 className="font-semibold mt-4">
                {userDetail.length > 0 &&
                  userDetail.map((user, index) => (
                    <span key={index}>{user.profile.nickname}</span>
                  ))}
              </h1>
            </div>
          </div>
        )}
        {userData && (
          <>
            <p className="-mt-56 md:mt-12 sm:mt-12 px-6 md:px-0 sm:px-0 flex flex-row overflow-x-auto space-x-3 text-sm opacity-75">
              <a href="#info" className="hover:underline">
                个人信息
              </a>
              <a href="#playlist" className="hover:underline">
                歌单
              </a>
              <a href="#logout" className="hover:underline">
                登出
              </a>
            </p>
            <div className="mt-6">
              <Heading id="info">个人信息</Heading>
            </div>

            {userData && (
              <div className="mt-8 font-medium text-2xl md:text-3xl sm:text-4xl">
                <p className="px-6 md:px-0 sm:px-0 leading-normal">
                  加入于
                  <span className="text-red-600 font-semibold">
                    {moment(userData.data.account.createTime).format(
                      "YYYY年MM月DD日"
                    )}
                  </span>
                  的
                  {userDetail.length > 0 &&
                    userDetail.map((user, index) => (
                      <span key={index} className="font-semibold">
                        {user.profile.nickname}
                      </span>
                    ))}
                  先生/女士, 您已经在
                  <span className="font-semibold text-red-600">云村</span>
                  度过了
                  <span className="text-red-600 font-semibold">
                    {parseInt(
                      moment(userData.data.account.createTime)
                        .fromNow(true)
                        .split(" ")[0]
                    )}
                  </span>
                  个春秋。 您最近登录于
                  <span className="font-semibold text-red-600">
                    {moment(userData.data.profile.lastLoginTime).format(
                      "YYYY年MM月DD日"
                    )}
                  </span>
                  。 作为等级
                  <span className="font-semibold text-red-600">
                    Lv.
                    {userDetail.length > 0 &&
                      userDetail.map((user, index) => (
                        <span key={index}>{user.level}</span>
                      ))}
                  </span>
                  的用户。您已经累计听歌
                  <span className="font-semibold text-red-600">
                    {userDetail.length > 0 &&
                      userDetail.map((user, index) => (
                        <span key={index}>{user.listenSongs}</span>
                      ))}
                    首
                  </span>
                  。 不忘初心，继续努力！ 希望您和您对自己的简介一样：
                  <span className="font-semibold text-red-600">
                    {userDetail.length > 0 &&
                      userDetail.map((user, index) => (
                        <span key={index}>{user.profile.signature}</span>
                      ))}
                  </span>{" "}
                  —— 表里如一，如如不动。 新的一天，也要拥有好心情！
                </p>
              </div>
            )}

            <div className="flex flex-row justify-between mt-8">
              <Heading id="playlist">歌单</Heading>
            </div>

            <div className="px-6 md:px-0 sm:px-0 my-6 columns-1 md:columns-2 sm:columns-3">
              {playlists.length > 0 &&
                playlists.map((pl, index) => (
                  <PlaylistCard
                    key={pl.id}
                    index={index}
                    picUrl={pl.coverImgUrl}
                    name={pl.name}
                    id={pl.id}
                  />
                ))}
            </div>

            <div className="flex flex-row justify-between mt-8">
              <Heading id="playlist">登出</Heading>
            </div>

            <div className="my-6">
              <h2
                onClick={logout}
                className="font-semibold mb-2 text-red-600 text-2xl md:text-3xl sm:text-4xl cursor-pointer hover:underline px-6 md:px-0 sm:px-0"
              >
                危险操作!!! 三思后行
              </h2>
            </div>
          </>
        )}

        {!userData && <IsNotLogin />}
      </div>
    </div>
  );
}

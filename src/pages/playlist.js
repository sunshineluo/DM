import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import moment from "moment";
import { Icon } from "@iconify/react";
import Head from "next/head";
import { SongIdsContext } from "@/components/SongIdsContext";
import LazyLoad from "react-lazy-load";
import SongButton from "@/components/SongButton";

const Playlist = () => {
  const router = useRouter();
  const id = router.query.id || null;
  const [playlistDetail, setPlaylistDetail] = useState(null);
  const [playlistTrack, setPlaylistTrack] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // 搜索关键词状态

  const filteredTracks = playlistTrack
    ? playlistTrack.filter((track) =>
        track.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const getPlaylistDetail = async () => {
    try {
      const response = await axios.get("https://cf233.eu.org/playlist/detail", {
        params: {
          id: id,
        },
      });

      setPlaylistDetail([response.data.playlist]);
    } catch (error) {
      // 处理错误
      console.error(error);
    }
  };

  const getPlaylistTracks = async () => {
    try {
      const response = await axios.get(
        "https://cf233.eu.org/playlist/track/all",
        {
          params: {
            id: id,
            limit: 1000,
          },
        }
      );

      setPlaylistTrack(response.data.songs);
    } catch (error) {
      // 处理错误
      console.error(error);
    }
  };

  useEffect(() => {
    if (id !== null) {
      getPlaylistDetail();
      getPlaylistTracks();
    }
  }, [id]);

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
    <div>
      <Head>
        {playlistDetail !== null &&
          playlistDetail.map(
            (detail, index) =>
              detail && <title key={index}>{detail.name}</title>
          )}
      </Head>
      {playlistDetail !== null &&
        playlistDetail.map(
          (detail) =>
            detail &&
            detail.coverImgUrl && (
              <img
                key={detail.id}
                src={detail.coverImgUrl}
                className="fixed w-full h-screen z-[-1] blur-lg hidden"
              />
            )
        )}
      <div className="bg-neutral-100/75 dark:bg-neutral-900/75 backdrop-blur-3xl min-h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto py-8 px-0 md:px-6 sm:px-6">
          {playlistDetail !== null &&
            playlistDetail.map(
              (detail, index) =>
                detail && (
                  <div key={index}>
                    <div className="">
                      <div className="flex flex-row space-x-4 md:space-x-6 sm:space-x-8 ml-4 md:ml-0 sm:ml-0">
                        {detail.coverImgUrl && (
                          <LazyLoad offset={100}>
                            <img
                              src={detail.coverImgUrl}
                              className="rounded-xl w-24 h-24 md:h-36 md:w-36 sm:w-48 sm:h-48"
                            />
                          </LazyLoad>
                        )}
                        <div className="flex flex-col space-y-4 mt-3 md:mt-6 sm:mt-6">
                          <h1 className="font-medium text-xl md:text-3xl sm:text-3xl w-48 md:w-full sm:w-full truncate">
                            {detail.name}
                          </h1>
                          <p className="text-base md:text-lg sm:text-lg opacity-75 w-48 md:w-[36rem] sm:w-[54rem] truncate md:text-ellipsis sm:text-ellipsis">
                            {detail.description}
                          </p>
                          <p className="text-base md:text-lg sm:text-lg opacity-75">
                            更新于
                            {moment(detail.updateTime).format("YYYY年MM月DD日")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
            )}

          <div className="flex flex-row justify-between">
            <div>
              <button
                className="text-base md:text-lg sm:text-lg mt-12 bg-red-600 text-white px-4 py-1.5 rounded-xl flex flex-row space-x-2 ml-4 md:ml-0 sm:ml-0"
                onClick={handlePlayAll}
              >
                <svg
                  t="1692268110901"
                  fill="currentColor"
                  className="icon mt-0.5 md:mt-1 sm:mt-1 mr-1 w-5 h-5"
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="4017"
                >
                  <path
                    d="M793.6 549.802667c33.621333-19.413333 50.389333-29.098667 56.021333-41.813334a42.666667 42.666667 0 0 0 0-34.688c-5.632-12.672-22.4-22.357333-56.021333-41.770666L326.4 161.792c-33.621333-19.370667-50.389333-29.098667-64.213333-27.648a42.666667 42.666667 0 0 0-30.037334 17.365333c-8.149333 11.221333-8.149333 30.634667-8.149333 69.418667v539.477333c0 38.826667 0 58.197333 8.149333 69.418667a42.666667 42.666667 0 0 0 30.037334 17.365333c13.824 1.450667 30.592-8.277333 64.213333-27.648l467.2-269.738666z"
                    p-id="4018"
                  ></path>
                </svg>
                播放
              </button>
            </div>
            <div className="mt-10 flex flex-row w-1/2 md:w-1/3 sm:w-1/3">
              <Icon
                icon="bi:search"
                className="absolute text-neutral-700 dark:text-neutral-300 opacity-75 w-5 h-5 mt-2.5 md:mt-3 sm:mt-3 ml-2.5"
              />
              <input
                type="search"
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索歌单..."
                className="w-full px-10  py-1.5 focus:outline-none bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 text-base md:text-lg sm:text-lg focus:ring-2 focus:ring-red-600 border-2 rounded-xl"
              />
            </div>
          </div>
          <div className="mt-6 mb-16">
            {filteredTracks.length > 0 || searchTerm !== "" ? (
              filteredTracks.map((track, index) => (
                <SongButton
                  key={track.id}
                  picUrl={track.al.picUrl}
                  index={index}
                  duration={track.dt}
                  id={track.id}
                  ar={track.ar.map((artist) => artist.name).join(" / ")}
                  name={track.name}
                />
              ))
            ) : (
              <p className="flex flex-row px-6 md:px-0 sm:px-0">
                <Icon icon="eos-icons:loading" className="w-8 h-8" />
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Playlist;

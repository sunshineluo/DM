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
                className="text-lg md:text-xl sm:text-xl mt-12 text-red-600 flex flex-row space-x-2 ml-4 md:ml-0 sm:ml-0"
                onClick={handlePlayAll}
              >
                <Icon icon="bi:play-circle-fill" className="mt-1 mr-1.5" />
                播放全部
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
                className="w-full px-10  py-1.5 focus:outline-none bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 text-lg focus:ring-2 focus:ring-red-600 border-2 rounded-xl"
              />
            </div>
          </div>
          <div className="columns-1 md:columns-1 sm:columns-2 mt-6 mb-16">
            {filteredTracks.length > 0 || searchTerm !== "" ? (
              filteredTracks.map((track, index) => (
                <SongButton
                  key={track.id}
                  picUrl={track.al.picUrl}
                  index={index}
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

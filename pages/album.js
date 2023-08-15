import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import moment from "moment";
import { Icon } from "@iconify/react";
import Head from "next/head";
import { SongIdsContext } from "@/components/SongIdsContext";
import LazyLoad from "react-lazy-load";
import SongButton from "@/components/SongButton";

const Album = () => {
  const router = useRouter();
  const id = router.query.id || null;
  const [albumDetail, setAlbumDetail] = useState(null);
  const [albumTrack, setAlbumTrack] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // 搜索关键词状态

  const filteredTracks = albumTrack
    ? albumTrack.filter((track) =>
        track.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const getAlbumDetail = async () => {
    try {
      const response = await axios.get("https://cf233.eu.org/album", {
        params: {
          id: id,
        },
      });

      setAlbumDetail([response.data]);
    } catch (error) {
      // 处理错误
      console.error(error);
    }
  };

  const getAlbumTracks = async () => {
    if (albumDetail === null || !Array.isArray(albumDetail[0].songs)) {
      alert("An error occurred while fetching song details");
    }

    const songIds = albumDetail.songs.map((song) => song.id);

    try {
      const response = await fetch(
        `https://cf233.eu.org/song/detail?ids=${songIds.join(",")}`
      );
      const data = await response.json();
      if (data && data.code === 200) {
        setAlbumTrack(data.songs);
      }
    } catch (error) {
      console.log("An error occurred while fetching song details:", error);
    }
  };

  useEffect(() => {
    if (id !== null) {
      getAlbumDetail();
      getAlbumTracks();
    }
  }, [id]);

  const { songIds, addAllToPlaylist, addToPlaylist } =
    useContext(SongIdsContext);

  const handleAddToPlaylist = (trackId) => {
    addToPlaylist(trackId);
  };

  const handlePlayAll = () => {
    const trackIds = albumTrack.map((track) => track.id);
    addAllToPlaylist(trackIds); // 将所有歌曲ID传递给 addAllToPlaylist 函数
  };

  return (
    <div>
      <Head>
        {albumDetail !== null &&
          albumDetail.map(
            (detail, index) =>
              detail && <title key={index}>{detail.album.name}</title>
          )}
      </Head>
      {albumDetail !== null &&
        albumDetail.map(
          (detail) =>
            detail &&
            detail.picUrl && (
              <img
                key={detail.id}
                src={detail.picUrl}
                className="fixed w-full h-screen z-[-1] blur-lg hidden"
              />
            )
        )}
      <div className="bg-neutral-100/75 dark:bg-neutral-900/75 backdrop-blur-3xl min-h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto py-8 px-0 md:px-6 sm:px-6">
          {albumDetail !== null &&
            albumDetail.slice(0, 1).map(
              (detail, index) =>
                detail && (
                  <div key={index}>
                    <div className="">
                      <div className="flex flex-row space-x-4 md:space-x-6 sm:space-x-8 ml-4 md:ml-0 sm:ml-0">
                        {detail.album.picUrl && (
                          <LazyLoad offset={100}>
                            <img
                              src={detail.album.picUrl}
                              className="rounded-xl w-24 h-24 md:h-32  md:w-32 sm:w-32 sm:h-32"
                            />
                          </LazyLoad>
                        )}
                        <div className="flex flex-col space-y-2 mt-3 md:mt-6 sm:mt-6">
                          <h1 className="font-medium text-xl md:text-3xl sm:text-3xl">
                            {detail.album.name}
                          </h1>
                          <p className="text-base md:text-lg sm:text-lg opacity-75">
                            {detail.album.artists
                              .map((artist) => artist.name)
                              .join(" / ")}
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
                placeholder="搜索专辑..."
                className="w-full px-10  py-1.5 focus:outline-none bg-neutral-50 dark:bg-neutral-950 dark:border-neutral-800 text-lg focus:ring-2 focus:ring-red-600 border-2 rounded-xl"
              />
            </div>
          </div>
          <div className="columns-1 md:columns-1 sm:columns-2 mt-6 mb-16">
            {filteredTracks.length > 0 || searchTerm !== "" ? (
              filteredTracks.map((track, index) => (
                <SongButton
                  key={track.id}
                  index={index}
                  id={track.id}
                  name={track.name}
                  ar={track.ar.map((artist) => artist.name).join(" / ")}
                  picUrl={track.al.picUrl}
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

export default Album;

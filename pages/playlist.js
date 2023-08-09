import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import moment from "moment";
import { Icon } from "@iconify/react";
import Head from "next/head";
import { SongIdsContext } from "@/components/SongIdsContext";

const Playlist = () => {
  const router = useRouter();
  const id = router.query.id || null;
  const [playlistDetail, setPlaylistDetail] = useState(null);
  const [playlistTrack, setPlaylistTrack] = useState(null);

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
            limit: 100,
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

  const { songIds, addToPlaylist } = useContext(SongIdsContext);

  const handleAddToPlaylist = (trackId) => {
    addToPlaylist(trackId);
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
      <div className="bg-neutral-100/75 backdrop-blur-3xl min-h-screen overflow-y-auto">
        <div className="max-w-4xl mx-auto py-24 px-0 md:px-6 sm:px-6">
          {playlistDetail !== null &&
            playlistDetail.map(
              (detail, index) =>
                detail && (
                  <div key={index}>
                    <div className="">
                      <div className="flex flex-row space-x-4 md:space-x-6 sm:space-x-8 ml-4 md:ml-0 sm:ml-0">
                        {detail.coverImgUrl && (
                          <img
                            src={detail.coverImgUrl}
                            className="rounded-xl w-24 h-24 md:h-32  md:w-32 sm:w-32 sm:h-32"
                          />
                        )}
                        <div className="flex flex-col space-y-2 mt-3 md:mt-6 sm:mt-6">
                          <h1 className="font-medium text-3xl">
                            {detail.name}
                          </h1>
                          <p className="text-lg opacity-75">
                            更新于
                            {moment(detail.updateTime).format("YYYY年MM月DD日")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
            )}

          <button className="text-xl mt-12 text-red-600 flex flex-row space-x-2 ml-4 md:ml-0 sm:ml-0">
            <Icon icon="bi:play-circle-fill" className="mt-1 mr-1.5" />
            播放所有
          </button>
          <div className="mt-6">
            {playlistTrack !== null &&
              playlistTrack.map((track, index) => (
                <button
                  key={track.id}
                  className={`flex flex-row space-x-4 w-full rounded-none md:rounded-xl sm:rounded-xl px-6 py-4 ${
                    index % 2 === 0 ? "bg-neutral-200" : "odd"
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
                      {track.ar.map((artist) => artist.name).join(" / ")} -
                      {track.al.name}
                    </span>
                  </div>
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Playlist;
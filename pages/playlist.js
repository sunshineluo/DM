import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import moment from "moment";
import { Icon } from "@iconify/react";

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

  return (
    <div>
      {playlistDetail !== null &&
        playlistDetail.map(
          (detail) =>
            detail &&
            detail.coverImgUrl && (
              <img
                key={detail.id}
                src={detail.coverImgUrl}
                className="fixed w-full h-screen z-[-1] blur-lg"
              />
            )
        )}
      <div className="bg-neutral-100/50 backdrop-blur-3xl min-h-screen overflow-y-auto">
        <div className="max-w-4xl mx-auto py-24 px-6">
          {playlistDetail !== null &&
            playlistDetail.map(
              (detail, index) =>
                detail && (
                  <div key={index}>
                    <div className="px-8">
                      <div className="flex flex-row space-x-4">
                        {detail.coverImgUrl && (
                          <img
                            src={detail.coverImgUrl}
                            className="rounded-xl w-16 h-16"
                          />
                        )}
                        <div className="flex flex-col space-y-1">
                          <h1 className="font-medium text-2xl">
                            {detail.name}
                          </h1>
                          <p>
                            更新于
                            {moment(detail.updateTime).format("YYYY年MM月DD日")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
            )}

          <button className="text-xl mt-12 flex flex-row space-x-2">
            <Icon icon="bi:play-circle-fill" className="mt-1 mr-1.5"/>
            播放所有
          </button>
          <div className="columns-1 md:columns-2 sm:columns-2 mt-6">
            {playlistTrack !== null &&
              playlistTrack.map((track) => (
                <button
                  key={track.id}
                  className="flex flex-row space-x-4 rounded-xl py-3"
                >
                  <img
                    src={track.al.picUrl}
                    className="rounded-xl w-16 h-16 "
                  />
                  <div className="flex flex-col space-y-1">
                    <span className="text-lg text-left w-full flex-nowrap flex overflow-hidden">
                      {track.name}
                    </span>
                    <span className="text-base opacity-75 text-left">
                      {track.ar.map((artist) => artist.name).join(" / ")}
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

import React, { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import moment from "moment";
import { Icon } from "@iconify/react";
import Head from "next/head";
import { SongIdsContext } from "@/components/SongIdsContext";
import LazyLoad from "react-lazy-load";
import SongButton from "@/components/SongButton";
import ReadMore from "@/components/ReadMore";

const Album = () => {
  const router = useRouter();
  const id = router.query.id || null;
  const [albumDetail, setAlbumDetail] = useState([]);
  const [albumTrack, setAlbumTrack] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // 搜索关键词状态

  const Track =
    albumDetail !== null && albumDetail.songs !== null && albumDetail.songs;

  const filteredTracks =
    Track &&
    Track !== null &&
    Track.filter((track) =>
      track.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getAlbumDetail = async () => {
    try {
      const response = await fetch(`https://cf233.eu.org/album?id=${id}`);
      const data = await response.json();
      console.log(data);
      setAlbumDetail([data]);
      console.log(albumDetail);
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
        {albumDetail &&
          albumDetail.map(
            (detail, index) =>
              detail && <title key={index}>{detail.album.name}</title>
          )}
      </Head>
      <div className="max-w-7xl mx-auto px-0 md:px-6 sm:px-6 py-8 mb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto py-8 px-0 md:px-6 sm:px-6">
          {albumDetail &&
            albumDetail.slice(0, 1).map(
              (detail, index) =>
                detail && (
                  <div key={index}>
                    <div className="">
                      <div className="flex flex-col md:flex-row sm:flex-row space-y-6 md:space-y-0 sm:space-y-0 space-x-0 md:space-x-6 sm:space-x-8 px-6 md:px-0 sm:px-0">
                        <div className="w-full md:w-1/3 sm:w-1/4">
                          {detail.album.picUrl && (
                            <LazyLoad offset={100}>
                              <img
                                src={detail.album.picUrl}
                                className="rounded-xl w-full shadow-md"
                              />
                            </LazyLoad>
                          )}
                        </div>
                        <div className="w-full md:w-2/3 sm:w-3/4 flex flex-col space-y-4">
                          <h1 className="font-semibold text-2xl md:text-3xl sm:text-3xl">
                            {detail.album.name}
                          </h1>
                          <p className="text-base md:text-lg sm:text-xl">
                            {detail && detail.album.artists && (
                              <span>
                                {detail.album.artists.map((artist, index) => (
                                  <span key={index}>
                                    <a
                                      className="cursor-pointer hover:underline"
                                      onClick={() =>
                                        router.push(`/artist?id=${artist.id}`)
                                      }
                                    >
                                      {artist.name}
                                    </a>
                                    {index !==
                                      detail.album.artists.length - 1 && " / "}
                                  </span>
                                ))}
                              </span>
                            )}{" "}
                            ·{" "}
                            <span className=" text-red-600">
                              {moment(detail.album.publishTime).format(
                                "YYYY年"
                              )}
                            </span>
                          </p>
                          <ReadMore
                            text={detail.album.description}
                            maxCharCount={150}
                          />
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
          </div>
          <div className="mt-6 mb-16">
            {albumDetail &&
              albumDetail.songs &&
              albumDetail.songs.map((track, index) => (
                <SongButton
                  key={track.id}
                  index={index}
                  id={track.id}
                  name={track.name}
                  duration={track.dt}
                  ar={track.ar.map((artist) => artist.name).join(" / ")}
                  picUrl={track.al.picUrl}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Album;

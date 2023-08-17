import { useRef, useEffect, useState, useContext } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import ReactPlayer from "react-player";
import { Icon } from "@iconify/react";
import * as Slider from "@radix-ui/react-slider";
import { SongIdsContext } from "./SongIdsContext";
import * as Dialog from "@radix-ui/react-dialog";
import { useAnimation } from "framer-motion";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Player({ ids, full }) {
  const [lyrics, setLyrics] = useState([]);
  const [isFull, setIsFull] = useState(full);
  const [highlightedLine, setHighlightedLine] = useState("");
  const [highlightedLineTimestamp, setHighlightedLineTimestamp] = useState("");
  const { songIds, currentSongIndex, setCurrentSongIndex } =
    useContext(SongIdsContext);
  const [playMode, setPlayMode] = useState("default"); // 默认为顺序播放模式
  const [translatedLyrics, setTranslatedLyrics] = useState([]);
  const [songInfo, setSongInfo] = useState([]);
  const audioRef = useRef(null);
  const lyricsContainerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [seekValue, setSeekValue] = useState(0);
  const [currentTime, setCurrentTime] = useState(() => {
    const storedCurrentTime = localStorage.getItem("playedTime");
    return storedCurrentTime !== 0 ? parseFloat(storedCurrentTime) : 0;
  });
  const [remainingTime, setRemainingTime] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [display, setDisplay] = useState(() => {
    const storedDisplay = localStorage.getItem("display");
    return storedDisplay !== null ? JSON.parse(storedDisplay) : true; // 设置默认值为true
  });
  const {
    addToPlaylist,
    removeFromPlaylist,
    currentTrackIndex,
    setCurrentTrackIndex,
  } = useContext(SongIdsContext);
  const [playlistDetails, setPlaylistDetails] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [more, setMore] = useState(false);

  useEffect(() => {
    const storedIsPlaying = localStorage.getItem("isPlaying");
    const storedCurrentTime = localStorage.getItem("playedTime");

    console.log(storedCurrentTime);

    setIsPlaying(JSON.parse(storedIsPlaying));

    setCurrentTime(parseFloat(storedCurrentTime));
    console.log(currentTime);

    localStorage.setItem("currentSongIndex", JSON.stringify(currentSongIndex));

    return () => {
      // 在组件卸载时保存当前的播放时间到本地存储
      localStorage.setItem("playedTime", currentTime.toString());
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("isPlaying", JSON.stringify(isPlaying));
  }, [isPlaying]);

  useEffect(() => {
    localStorage.setItem("playedTime", currentTime.toString());
  }, [currentTime]);

  useEffect(() => {
    audioRef.current.seekTo(currentTime);
  }, []);

  useEffect(() => {
    const savedPlayedTime = localStorage.getItem("playedTime");
    if (savedPlayedTime) {
      const parsedTime = parseFloat(savedPlayedTime);
      setPlayed(parsedTime);
      setCurrentTime(parsedTime);
      audioRef.current.seekTo(parsedTime);
    }
  }, []);

  useEffect(() => {
    if (currentSongIndex >= songIds.length) {
      setCurrentSongIndex(0); // 如果 currentSongIndex 不再有效，则将其设置为默认索引 0
    }
  }, [songIds]);

  useEffect(() => {
    localStorage.setItem("playedTime", currentTime.toString());
  }, [currentTime]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 767) {
        setDisplay(false);
      } else {
        setDisplay(true);
      }
    };

    // 监听窗口大小改变事件
    window.addEventListener("resize", handleResize);

    // 组件销毁时移除事件监听器
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchSongData = async () => {
      try {
        const currentSongId = songIds[currentSongIndex];

        const [songResponse, lyricsResponse, translatedLyricsResponse] =
          await Promise.all([
            axios.get(`https://cf233.eu.org/song/detail?ids=${currentSongId}`),
            axios.get(`https://cf233.eu.org/lyric?id=${currentSongId}`),
            axios.get(
              `https://cf233.eu.org/lyric/translate?id=${currentSongId}`
            ),
          ]);

        const songData = songResponse.data;
        const songDetail = songData.songs;
        setSongInfo(songDetail);

        const lyricsData = lyricsResponse.data;
        const lyricsText = lyricsData.lrc.lyric;
        const parsedLyrics = parseLyrics(lyricsText);
        setLyrics(parsedLyrics);

        const translatedLyricsData = translatedLyricsResponse.data;
        const translatedLyricsText = translatedLyricsData.tlyric.lyric;
        const parsedTranslatedLyrics = parseLyrics(translatedLyricsText);
        setTranslatedLyrics(parsedTranslatedLyrics);
      } catch (error) {
        console.log(error);
      }
    };

    fetchSongData();
  }, [songIds, currentSongIndex]);

  const parseLyrics = (lyricsText) => {
    const lines = lyricsText.split("\n");
    const parsedLyrics = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.length > 0) {
        const regex = /\[(\d+):(\d+)\.\d+\]/;
        const match = line.match(regex);

        if (match) {
          const [, minutes, seconds] = match;
          const currentTimeInSeconds =
            parseInt(minutes) * 60 + parseInt(seconds);

          parsedLyrics.push({
            timestamp: currentTimeInSeconds,
            text: line.replace(regex, "").trim(),
          });
        }
      }
    }

    return parsedLyrics;
  };

  const handleTimeUpdate = ({ playedSeconds }) => {
    if (!lyrics.length || !audioRef.current || !lyricsContainerRef.current) {
      return;
    }

    const matchingLines = [];

    for (let i = 0; i < lyrics.length; i++) {
      const { timestamp, text } = lyrics[i];
      const diff = Math.abs(playedSeconds - timestamp);

      if (playedSeconds >= timestamp) {
        matchingLines.push({
          text,
          diff,
          timestamp,
        });
      }
    }

    // 根据差值排序，选择最小差值对应的歌词行
    matchingLines.sort((a, b) => a.diff - b.diff);
    const currentHighlightedLine = matchingLines[0]?.text || null;
    const currentHighlightedLineTimestamp = matchingLines[0]?.timestamp || null;

    setHighlightedLine(currentHighlightedLine);
    setHighlightedLineTimestamp(currentHighlightedLineTimestamp);
  };

  useEffect(() => {
    if (
      typeof highlightedLineTimestamp === "number" &&
      lyricsContainerRef.current
    ) {
      const targetElement = lyricsContainerRef.current.querySelector(
        `p[data-text="${String(highlightedLineTimestamp)}"]`
      );

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [highlightedLineTimestamp]);

  const handleProgress = (progress) => {
    const playedTime = progress.playedSeconds;
    setPlayed(progress.played);
    setCurrentTime(playedTime);
    setRemainingTime(audioRef.current.getDuration() - playedTime);
    localStorage.setItem("playedTime", playedTime.toString());
  };

  const handleSeekChange = (newValue) => {
    setSeekValue(parseFloat(newValue));
  };

  const handleSeek = () => {
    audioRef.current.seekTo(seekValue);
  };

  useEffect(() => {
    if (audioRef.current && audioRef.current.getDuration() && played === 1) {
      setPlayed(0);
      setIsPlaying(false);
    }
  }, [played]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const handleVolumeChange = (newValue) => {
    const newVolume = parseFloat(newValue);
    setVolume(newVolume);
  };

  const handlePlayMode = () => {
    // 切换播放模式
    if (playMode === "default") {
      setPlayMode("loop");
    } else if (playMode === "loop") {
      setPlayMode("shuffle");
    } else {
      setPlayMode("default");
    }
  };

  function shuffleArray(array) {
    const newArray = [...array]; // 创建一个新数组，并复制原始数组的元素

    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]]; // 交换位置
    }

    return newArray;
  }

  const handleEnded = () => {
    if (playMode === "default") {
      // 播放下一首音频
      setCurrentSongIndex((prevIndex) => (prevIndex + 1) % songIds.length);
      setIsPlaying(true);
    } else if (playMode === "loop") {
      // 继续播放当前音频
      audioRef.current.seekTo(0);
      setIsPlaying(true);
    } else if (playMode === "shuffle") {
      // 创建一个随机排列的数组
      const shuffledIndexes = shuffleArray(
        Array.from({ length: songIds.length }, (_, i) => i)
      );
      // 获取当前音频索引
      const currentIndex = shuffledIndexes.findIndex(
        (index) => index === currentSongIndex
      );
      // 播放下一首随机音频
      setCurrentSongIndex(
        shuffledIndexes[(currentIndex + 1) % shuffledIndexes.length]
      );
      setIsPlaying(true);
    }
  };

  const { getAllSongIds, removeAllFromPlaylist, addAllToPlaylist } =
    useContext(SongIdsContext);
  const playIds = getAllSongIds();

  const handleRemoveAll = () => {
    removeAllFromPlaylist();
  };

  useEffect(() => {
    const fetchPlaylistDetails = async () => {
      try {
        const response = await axios.get("https://cf233.eu.org/song/detail", {
          params: {
            ids: playIds.join(","),
          },
        });
        setPlaylistDetails(response.data.songs);
      } catch (error) {
        console.error("Error fetching playlist details: ", error);
      }
    };

    if (playIds.length > 0) {
      fetchPlaylistDetails();
    }
  }, [playIds]);

  const handlePlayAll = () => {
    const trackIds = playlistDetails.map((track) => track.id);
    addAllToPlaylist(trackIds); // 将所有歌曲ID传递给 addAllToPlaylist 函数
  };

  const handleAddToPlaylist = (trackId) => {
    addToPlaylist(trackId);
  };

  const songId = songIds[currentSongIndex];
  const userDataStr = localStorage.getItem("userData");
  const userData = JSON.parse(userDataStr);

  useEffect(() => {
    if (userData) {
      checkLikedMusic(userData.data.account.id, songId);
    }
  }, [songId]);

  useEffect(() => {
    localStorage.setItem("isLiked", isLiked); // 每次 isLiked 更新后保存到本地存储
  }, [isLiked]);

  const checkLikedMusic = async (userId, songId) => {
    try {
      const response = await axios.get(
        `https://cf233.eu.org/likelist?uid=${userId}`,
        {
          withCredentials: true,
        }
      );

      if (response.data.code === 200) {
        const likedMusicIds = response.data.ids;
        const isLiked = likedMusicIds.includes(songId);
        setIsLiked(isLiked);
      } else {
        console.log("获取喜欢音乐列表失败");
      }
    } catch (error) {
      console.error(error);
      // 处理错误情况
    }
  };

  const toggleLikeMusic = async () => {
    try {
      setIsLiked(!isLiked); // 直接更新喜欢状态，不等待服务器响应

      const response = await axios.get(`https://cf233.eu.org/like`, {
        params: {
          id: songId,
          like: !isLiked, // 反转当前的喜欢状态
        },
        withCredentials: true,
      });

      if (response.data.code !== 200) {
        console.log("喜欢失败");
      }
    } catch (error) {
      console.error(error);
      // 处理错误情况
    }
  };

  return (
    <div className="fixed w-full max-h-screen h-screen z-[10000]">
      <div></div>
      <ReactPlayer
        ref={audioRef}
        playing={isPlaying}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        volume={volume}
        url={`https://music.163.com/song/media/outer/url?id=${songIds[currentSongIndex]}.mp3`}
        onProgress={(progress) => {
          handleTimeUpdate(progress);
          handleProgress(progress);
        }}
        onEnded={handleEnded}
        className="fixed top-0 hidden"
      />
      {isFull === "false" && (
        <div className="fixed bottom-0 w-full overflow-x-auto bg-neutral-200/75 dark:bg-neutral-800/75 backdrop-blur-lg border-t-[1.5px] border-t-neutral-200/50 dark:border-t-neutral-800/50">
          <div className="max-w-7xl mx-auto px-0 md:px-8 sm:px-8">
            {songInfo &&
              songInfo.length > 0 &&
              songInfo.map((song) => (
                <div key={song.id} className="flex flex-row overflow-x-auto">
                  <div className="flex flex-row space-y-4 space-x-2 md:space-x-4 sm:space-x-4">
                    <div className="py-2 md:py-4 sm:py-4 flex flex-row space-x-4 px-6 md:px-4 sm:px-4 w-56 md:w-72 sm:w-72">
                      <img
                        key={song.id}
                        src={song.al.picUrl}
                        alt="Album Cover"
                        onClick={() => setIsFull("true")}
                        className="rounded-xl w-14 h-14 md:w-16 md:h-16 sm:w-16 sm:h-16 cursor-pointer"
                      />
                      <div className="flex flex-col space-y-1 mt-1 ">
                        <span className="text-base font-medium text-center w-32 md:w-72 sm:w-96 flex-nowrap flex truncate">
                          {song.name}
                        </span>
                        <span className="text-base opacity-75 text-left w-32 md:w-72 sm:w-96 truncate flex-nowrap flex">
                          {song.ar.map((artist) => artist.name).join(" / ")}
                        </span>
                      </div>
                    </div>
                    <div className="py-0 md:py-4 sm:py-4 flex flex-col space-y-1 justify-center w-full">
                      {" "}
                      <div className="flex flex-row space-x-4 w-56 md:w-96 sm:w-96 justify-between text-neutral-700 dark:text-neutral-300 px-6 md:px-8 sm:px-10">
                        {" "}
                        <div className="flex flex-row space-x-4">
                          <button onClick={handlePlayMode}>
                            {playMode === "default" && (
                              <Icon
                                icon="bi:repeat"
                                className="w-4 md:w-6 sm:w-6 h-6 opacity-75"
                              />
                            )}
                            {playMode === "loop" && (
                              <Icon
                                icon="bi:repeat-1"
                                className="w-4 md:w-6 sm:w-6 h-6 opacity-75"
                              />
                            )}
                            {playMode === "shuffle" && (
                              <Icon
                                icon="bi:shuffle"
                                className="w-4 md:w-6 sm:w-6 h-6 opacity-75"
                              />
                            )}
                          </button>
                          <button onClick={toggleLikeMusic}>
                            {isLiked ? (
                              <Icon
                                icon="bi:heart-fill"
                                className="w-4 md:w-6 sm:w-6 h-6 opacity-75"
                              />
                            ) : (
                              <Icon
                                icon="bi:heart"
                                className="w-4 md:w-6 sm:w-6 h-6 opacity-75"
                              />
                            )}
                          </button>
                        </div>
                        <div className="w-[57.5%] md:w-[45%] sm:w-[45%] mx-auto">
                          <div className="mx-auto flex flex-row justify-between space-x-4 z-30">
                            <button
                              onClick={() =>
                                setCurrentSongIndex(
                                  (currentSongIndex - 1 + songIds.length) %
                                    songIds.length
                                )
                              }
                            >
                              <Icon
                                className="font-bold w-7 md:w-9 sm:w-9 h-9  opacity-80 hover:opacity-100"
                                icon="bi:rewind-fill"
                              />
                            </button>
                            <button onClick={() => setIsPlaying(!isPlaying)}>
                              {isPlaying === true ? (
                                <Icon
                                  className="font-bold w-7 md:w-9 sm:w-9 h-9 "
                                  icon="clarity:pause-solid"
                                />
                              ) : (
                                <Icon
                                  className="font-bold w-7 md:w-9 sm:w-9 h-9 "
                                  icon="clarity:play-solid"
                                />
                              )}
                            </button>
                            <button
                              onClick={() =>
                                setCurrentSongIndex(
                                  (currentSongIndex + 1) % songIds.length
                                )
                              }
                            >
                              <Icon
                                className="font-bold w-7 md:w-9 sm:w-9 h-9 opacity-80 hover:opacity-100"
                                icon="bi:fast-forward-fill"
                              />
                            </button>
                          </div>
                        </div>
                        <Dialog.Root>
                          <div className="flex flex-row space-x-4">
                            <button>
                              <Icon
                                className="hidden font-bold w-7 md:w-9 sm:w-9 h-9 opacity-80 hover:opacity-100"
                                icon="bi:fast-forward-fill"
                              />
                            </button>
                            <Dialog.Trigger asChild>
                              <button>
                                <Icon
                                  icon="bi:card-list"
                                  className="w-4 md:w-6 sm:w-6 h-6 opacity-75"
                                />
                              </button>
                            </Dialog.Trigger>
                          </div>
                          <Dialog.Portal>
                            <Dialog.Overlay className="DialogOverlay bg-black/25 backdrop-blur-3xl" />
                            <Dialog.Content className="DialogContent fixed max-w-4xl mx-auto w-full h-screen bg-neutral-100 dark:bg-neutral-900 overflow-y-auto backdrop-blur-lg z-[999]">
                              <Dialog.Title className="DialogTitle font-medium text-3xl">
                                播放列表({playlistDetails.length})
                              </Dialog.Title>

                              <div className="flex flex-row justify-between text-red-600 dark:text-red-400 mt-6 px-3">
                                <button onClick={handlePlayAll}>
                                  播放全部
                                </button>
                                <button onClick={handleRemoveAll}>
                                  删除全部
                                </button>
                              </div>

                              <div className="flex flex-col justify-start mt-4 overflow-y-auto">
                                {playlistDetails.length > 0 &&
                                  playlistDetails.map((track, index) => {
                                    const handleDeleteSong = (id) => {
                                      // 在这里处理删除操作，使用传入的id参数
                                      removeFromPlaylist(id);
                                    };
                                    return (
                                      <div key={track.id}>
                                        <div
                                          key={track.id}
                                          className={`cursor-pointer flex flex-row justify-between w-full rounded-xl px-6 py-4 ${
                                            index % 2 === 0
                                              ? "bg-neutral-200 dark:bg-neutral-800"
                                              : "odd"
                                          }`}
                                        >
                                          <div
                                            onClick={() =>
                                              handleAddToPlaylist(track.id)
                                            }
                                            className="flex flex-row space-x-4"
                                          >
                                            <img
                                              src={track.al.picUrl}
                                              className="rounded-xl w-14 h-14 md:w-16 md:h-16 sm:w-16 sm:h-16"
                                            />
                                            <div className="flex flex-col space-y-1 mt-1">
                                              <span className="font-medium text-left w-full flex-nowrap flex overflow-hidden">
                                                {track.name}
                                              </span>
                                              <span className="text-base opacity-75 text-left truncate w-48 md:w-96 sm:w-96">
                                                {track.ar
                                                  .map((artist) => artist.name)
                                                  .join(" / ")}
                                              </span>
                                            </div>
                                          </div>
                                          <button
                                            onClick={() =>
                                              handleDeleteSong(track.id)
                                            }
                                            className="text-red-600 dark:text-red-400 w-24 md:w-16 sm:w-8 text-right"
                                          >
                                            删除
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            </Dialog.Content>
                          </Dialog.Portal>
                        </Dialog.Root>
                      </div>
                      <div></div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
      {isFull === "true" && (
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: isFull === "true" ? 0 : 200 }}
          className={cn(
            "top-0 w-full h-screen max-h-screen",
            isFull === "true" && "fixed"
          )}
        >
          <div>
            {songInfo.map((song) => (
              <img
                key={song.id}
                src={song.al.picUrl}
                alt="Album Cover"
                className="bg-no-repeat absolute h-screen z-[-1] left-0 top-0 inset-x-0 right-0 w-full"
              />
            ))}
          </div>
          <div className="flex flex-row w-full h-screen bg-neutral-100/75 dark:bg-neutral-900/75 backdrop-blur-3xl overflow-y-hidden md:overflow-y-auto sm:overflow-y-auto">
            <div
              className={cn(
                "transition-all duration-500 w-full md:w-1/2 sm:w-1/2  h-screen left-0 right-0 z-50 select-none bottom-0 overflow-y-auto ",
                !display
                  ? "top-0 md:top-0 sm:top-0 w-screen"
                  : "fixed left-0 right-0 inset-x-0 md:relative sm:relative top-[50vh] md:top-0 sm:top-0 z-[99999] py-0 md:py-6 sm:py-0 "
              )}
            >
              {songInfo.map((song) => (
                <div
                  key={song.id}
                  className="flex flex-col mx-auto h-screen px-4 md:px-8 sm:px-0"
                >
                  <div key={song.id} className="mx-auto">
                    <button
                      className="z-[99999] flex text-center mx-auto"
                      onClick={() => setIsFull("false")}
                    >
                      <Icon
                        icon="pepicons-pop:line-x"
                        className="items-center w-10 md:w-12 h-10 md:h-12 sm:w-16 sm:h-16 opacity-75 text-neutral-700 dark:text-neutral-300"
                      />
                    </button>
                    <motion.img
                      src={song.al.picUrl}
                      alt="Album Cover"
                      initial={{ scale: 1 }}
                      animate={{ scale: isPlaying ? 1 : 0.9 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 10,
                      }}
                      className={cn(
                        "shadow-md mx-auto w-auto md:w-96 sm:w-[28rem] object-contain item-center rounded-xl",
                        display ? "hidden md:block sm:block" : "hidden"
                      )}
                    />
                    <motion.img
                      src={song.al.picUrl}
                      alt="Album Cover"
                      initial={{ scale: 1 }}
                      animate={{ scale: isPlaying ? 1 : 0.9 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 10,
                      }}
                      className={cn(
                        "mx-auto object-cover item-center rounded-xl",
                        !display ? "block" : "hidden"
                      )}
                    />
                    <div className="flex flex-row justify-between w-full">
                      <div>
                        {" "}
                        <h1 className="font-semibold text-lg md:text-xl sm:text-xl mt-6 w-36 md:w-72 sm:w-[90%] truncate">
                          {song.name}
                        </h1>
                        <h2 className="font-semibold text-lg md:text-xl sm:text-xl opacity-75 w-full truncate">
                          {song.ar.map((artist) => artist.name).join(" / ")}
                        </h2>
                      </div>
                      <div className="flex flex-row space-x-3 justify-start">
                        {more && (
                          <button
                            onClick={() =>
                              setDisplay(display === false ? true : false)
                            }
                            className={cn(
                              "mt-6 w-9 h-9 justify-center align-middle rounded-full bg-neutral-300/50 dark:bg-neutral-400/75 backdrop-blur-3xl",
                              more ? "flex md:hidden sm:hidden " : "hidden"
                            )}
                          >
                            <span className="w-5 h-5 mt-1.5">词</span>
                          </button>
                        )}

                        <button
                          onClick={toggleLikeMusic}
                          className={cn(
                            "mt-6 w-9 h-9 justify-center align-middle rounded-full bg-neutral-300/50 dark:bg-neutral-400/75 backdrop-blur-3xl",
                            more ? "flex" : "hidden"
                          )}
                        >
                          {isLiked ? (
                            <Icon
                              icon="bi:heart-fill"
                              className="w-5 h-5 mt-2.5 file:opacity-75"
                            />
                          ) : (
                            <Icon
                              icon="bi:heart"
                              className="w-5 h-5 mt-2.5 opacity-75"
                            />
                          )}
                        </button>

                        {more && (
                          <Dialog.Root>
                            <div className="flex flex-row space-x-3 md:space-x-6 sm:space-x-6 justify-end">
                              <Dialog.Trigger asChild>
                                <button
                                  className={cn(
                                    "mt-6 w-9 h-9 justify-center align-middle rounded-full bg-neutral-300/50 dark:bg-neutral-400/75 backdrop-blur-3xl",
                                    more ? "flex" : "hidden"
                                  )}
                                >
                                  <Icon
                                    icon="bi:card-list"
                                    className="w-5 h-5 mt-2 opacity-75"
                                  />
                                </button>
                              </Dialog.Trigger>
                            </div>
                            <Dialog.Portal>
                              <Dialog.Overlay className="DialogOverlay bg-black/25 backdrop-blur-3xl" />
                              <Dialog.Content className="DialogContent fixed max-w-4xl mx-auto w-full h-screen bg-neutral-100 dark:bg-neutral-900 overflow-y-auto backdrop-blur-lg z-[999]">
                                <Dialog.Title className="DialogTitle font-medium text-3xl">
                                  播放列表({playlistDetails.length})
                                </Dialog.Title>

                                <div className="flex flex-row justify-between text-red-600 dark:text-red-400 mt-6 px-3">
                                  <button onClick={handlePlayAll}>
                                    播放全部
                                  </button>
                                  <button onClick={handleRemoveAll}>
                                    删除全部
                                  </button>
                                </div>

                                <div className="flex flex-col justify-start mt-4 overflow-y-auto">
                                  {playlistDetails.length > 0 &&
                                    playlistDetails.map((track, index) => {
                                      const handleDeleteSong = (id) => {
                                        // 在这里处理删除操作，使用传入的id参数
                                        removeFromPlaylist(id);
                                      };
                                      return (
                                        <div key={track.id}>
                                          <div
                                            key={track.id}
                                            className={`cursor-pointer flex flex-row justify-between w-full rounded-xl px-6 py-4 ${
                                              index % 2 === 0
                                                ? "bg-neutral-200 dark:bg-neutral-800"
                                                : "odd"
                                            }`}
                                          >
                                            <div
                                              onClick={() =>
                                                handleAddToPlaylist(track.id)
                                              }
                                              className="flex flex-row space-x-4"
                                            >
                                              <img
                                                src={track.al.picUrl}
                                                className="rounded-xl w-14 h-14 md:w-16 md:h-16 sm:w-16 sm:h-16"
                                              />
                                              <div className="flex flex-col space-y-1 mt-1">
                                                <span className="font-medium text-left w-full flex-nowrap flex overflow-hidden">
                                                  {track.name}
                                                </span>
                                                <span className="text-base opacity-75 text-left truncate w-48 md:w-96 sm:w-96">
                                                  {track.ar
                                                    .map(
                                                      (artist) => artist.name
                                                    )
                                                    .join(" / ")}
                                                </span>
                                              </div>
                                            </div>
                                            <button
                                              onClick={() =>
                                                handleDeleteSong(track.id)
                                              }
                                              className="text-red-600 dark:text-red-400 w-24 md:w-16 sm:w-8 text-right"
                                            >
                                              删除
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                </div>
                              </Dialog.Content>
                            </Dialog.Portal>
                          </Dialog.Root>
                        )}
                        <button
                          onClick={() => setMore(!more)}
                          className="mt-6 w-9 h-9 flex justify-center align-middle rounded-full bg-neutral-300/50 dark:bg-neutral-400/75 backdrop-blur-3xl"
                        >
                          {!more ? (
                            <Icon icon="tabler:dots" className="w-5 h-5 mt-2" />
                          ) : (
                            <Icon icon="bi:x" className="w-5 h-5 mt-2" />
                          )}
                        </button>
                      </div>
                    </div>
                    <Slider.Root
                      className="SliderRoot mx-auto"
                      min={0}
                      max={1}
                      step={0.01}
                      value={[played]}
                      onValueChange={(newValue) => handleSeekChange(newValue)}
                      onPointerUp={handleSeek}
                    >
                      <Slider.Track className="SliderTrack mt-6 backdrop-blur-lg bg-opacity-75 cursor-pointer">
                        <Slider.Range
                          className={cn(
                            "SliderRange cursor-pointer",
                            played === 0 ? "rounded-l-full" : "rounded-none",
                            played === 1 ? "rounded-full" : "rounded-l-full"
                          )}
                        />
                        <Slider.Thumb
                          className="SliderThumb focus:outline-none -mt-1"
                          aria-label="Progress"
                        />
                      </Slider.Track>
                    </Slider.Root>
                    <div className="mx-auto mt-3 flex flex-row justify-between font-medium">
                      <div className="text-xs md:text-sm sm:text-sm opacity-75">
                        {formatTime(currentTime)}
                      </div>
                      <div className="text-xs md:text-sm sm:text-sm opacity-75">
                        -{formatTime(remainingTime)}
                      </div>
                    </div>
                    <div className="flex flex-row justify-between text-neutral-700 dark:text-neutral-300">
                      <div className="flex flex-row">
                        <button
                          onClick={() =>
                            setPlayMode(
                              playMode === "default" ? "loop" : "default"
                            )
                          }
                        >
                          {playMode === "default" && (
                            <Icon
                              icon="bi:repeat"
                              className="w-4 md:w-5 sm:w-6 h-6 opacity-75"
                            />
                          )}
                          {playMode === "loop" && (
                            <Icon
                              icon="bi:repeat-1"
                              className="w-4 md:w-5 sm:w-6 h-6 opacity-75"
                            />
                          )}
                        </button>
                      </div>
                      <div className="w-1/2 mx-auto mt-4 mb-4">
                        <div className="mx-auto flex flex-row justify-between z-30">
                          <button
                            onClick={() =>
                              setCurrentSongIndex(
                                (currentSongIndex - 1 + songIds.length) %
                                  songIds.length
                              )
                            }
                          >
                            <svg
                              t="1692268477966"
                              fill="currentColor"
                              className="icon w-11 md:w-12 sm:w-14 h-14 opacity-80 hover:opacity-100"
                              viewBox="0 0 1024 1024"
                              version="1.1"
                              xmlns="http://www.w3.org/2000/svg"
                              p-id="4289"
                            >
                              <path
                                d="M519.893333 569.984c-30.890667-19.2-46.336-28.842667-51.626666-41.130667a42.666667 42.666667 0 0 1 0-33.706666c5.290667-12.288 20.736-21.930667 51.626666-41.130667l218.453334-135.808c34.048-21.162667 51.114667-31.786667 65.152-30.634667a42.666667 42.666667 0 0 1 30.762666 17.109334c8.405333 11.349333 8.405333 31.402667 8.405334 71.509333v271.616c0 40.106667 0 60.16-8.405334 71.509333a42.666667 42.666667 0 0 1-30.762666 17.066667c-14.08 1.152-31.104-9.386667-65.152-30.592l-218.453334-135.808z"
                                p-id="4290"
                              ></path>
                              <path
                                d="M142.634667 569.984c-30.933333-19.2-46.378667-28.842667-51.626667-41.130667a42.666667 42.666667 0 0 1 0-33.706666c5.248-12.288 20.693333-21.930667 51.626667-41.130667l218.453333-135.808c34.048-21.162667 51.072-31.786667 65.109333-30.634667a42.666667 42.666667 0 0 1 30.762667 17.109334c8.405333 11.349333 8.405333 31.402667 8.405333 71.509333v271.616c0 40.106667 0 60.16-8.405333 71.509333a42.666667 42.666667 0 0 1-30.762667 17.066667c-14.08 1.152-31.061333-9.386667-65.152-30.592l-218.453333-135.808z"
                                p-id="4291"
                              ></path>
                            </svg>
                          </button>
                          <button onClick={() => setIsPlaying(!isPlaying)}>
                            {isPlaying === true ? (
                              <svg
                                t="1692268156116"
                                fill="currentColor"
                                className="icon w-12 md:w-14 sm:w-16 h-16"
                                viewBox="0 0 1024 1024"
                                version="1.1"
                                xmlns="http://www.w3.org/2000/svg"
                                p-id="4153"
                              >
                                <path
                                  d="M298.666667 196.266667c0-23.893333 0-35.84 4.650666-44.970667a42.666667 42.666667 0 0 1 18.645334-18.645333C331.093333 128 343.04 128 366.933333 128h34.133334c23.893333 0 35.84 0 44.970666 4.650667a42.666667 42.666667 0 0 1 18.645334 18.645333C469.333333 160.426667 469.333333 172.373333 469.333333 196.266667v588.8c0 23.893333 0 35.84-4.650666 44.970666a42.666667 42.666667 0 0 1-18.645334 18.645334C436.906667 853.333333 424.96 853.333333 401.066667 853.333333h-34.133334c-23.893333 0-35.84 0-44.970666-4.650666a42.666667 42.666667 0 0 1-18.645334-18.645334C298.666667 820.906667 298.666667 808.96 298.666667 785.066667V196.266667zM554.666667 196.266667c0-23.893333 0-35.84 4.650666-44.970667a42.666667 42.666667 0 0 1 18.645334-18.645333C587.093333 128 599.04 128 622.933333 128h34.133334c23.893333 0 35.84 0 44.970666 4.650667a42.666667 42.666667 0 0 1 18.645334 18.645333C725.333333 160.426667 725.333333 172.373333 725.333333 196.266667v588.8c0 23.893333 0 35.84-4.650666 44.970666a42.666667 42.666667 0 0 1-18.645334 18.645334C692.906667 853.333333 680.96 853.333333 657.066667 853.333333h-34.133334c-23.893333 0-35.84 0-44.970666-4.650666a42.666667 42.666667 0 0 1-18.645334-18.645334C554.666667 820.906667 554.666667 808.96 554.666667 785.066667V196.266667z"
                                  p-id="4154"
                                ></path>
                              </svg>
                            ) : (
                              <svg
                                t="1692268110901"
                                fill="currentColor"
                                className="icon w-12 md:w-14 sm:w-16 h-16"
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
                            )}
                          </button>
                          <button
                            onClick={() =>
                              setCurrentSongIndex(
                                (currentSongIndex + 1) % songIds.length
                              )
                            }
                          >
                            <svg
                              t="1692268552716"
                              fill="currentColor"
                              className="icon w-11 md:w-12 sm:w-14 h-14 opacity-80 hover:opacity-100"
                              viewBox="0 0 1024 1024"
                              version="1.1"
                              xmlns="http://www.w3.org/2000/svg"
                              p-id="4426"
                              width="200"
                              height="200"
                            >
                              <path
                                d="M504.106667 569.984c30.890667-19.2 46.336-28.842667 51.626666-41.130667a42.666667 42.666667 0 0 0 0-33.706666c-5.290667-12.288-20.736-21.930667-51.626666-41.130667l-218.453334-135.808c-34.048-21.162667-51.114667-31.786667-65.152-30.634667a42.666667 42.666667 0 0 0-30.762666 17.109334c-8.405333 11.349333-8.405333 31.402667-8.405334 71.509333v271.616c0 40.106667 0 60.16 8.405334 71.509333a42.666667 42.666667 0 0 0 30.762666 17.066667c14.08 1.152 31.104-9.386667 65.152-30.592l218.453334-135.808z"
                                p-id="4427"
                              ></path>
                              <path
                                d="M881.365333 569.984c30.933333-19.2 46.378667-28.842667 51.626667-41.130667a42.666667 42.666667 0 0 0 0-33.706666c-5.248-12.288-20.693333-21.930667-51.626667-41.130667l-218.453333-135.808c-34.048-21.162667-51.072-31.786667-65.109333-30.634667a42.666667 42.666667 0 0 0-30.762667 17.109334c-8.405333 11.349333-8.405333 31.402667-8.405333 71.509333v271.616c0 40.106667 0 60.16 8.405333 71.509333a42.666667 42.666667 0 0 0 30.762667 17.066667c14.08 1.152 31.061333-9.386667 65.152-30.592l218.453333-135.808z"
                                p-id="4428"
                              ></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-row">
                        <button onClick={() => setPlayMode("shuffle")}>
                          <Icon
                            icon="bi:shuffle"
                            className={cn(
                              "w-4 md:w-5 sm:w-6 h-6",
                              playMode === "shuffle"
                                ? "opacity-100"
                                : "opacity-75"
                            )}
                          />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-row mx-auto space-x-3">
                      <button onClick={() => setVolume(0)}>
                        <Icon
                          icon="ion:volume-off"
                          className="font-bold w-5 md:w-5 sm:w-6 h-6 text-neutral-700 dark:text-neutral-300 mt-4 md:mt-[1.375rem] sm:mt-[1.375rem]"
                        />
                      </button>

                      <Slider.Root
                        className="SliderRoot"
                        min={0}
                        max={1}
                        step={0.01}
                        value={[volume]}
                        onValueChange={(newValue) =>
                          handleVolumeChange(newValue)
                        }
                      >
                        <Slider.Track className="SliderTrack mt-9 md:mt-12 sm:mt-12 backdrop-blur-lg bg-opacity-75 cursor-pointer">
                          <Slider.Range
                            className={cn(
                              "SliderRange cursor-pointer",
                              volume === 1 ? "rounded-full" : "rounded-l-full"
                            )}
                          />
                          <Slider.Thumb
                            className="SliderThumb focus:outline-none -mt-1"
                            aria-label="Volume"
                          />
                        </Slider.Track>
                      </Slider.Root>

                      <button onClick={() => setVolume(1)}>
                        <Icon
                          icon="fa-solid:volume-up"
                          className="font-bold w-5 md:w-5 sm:w-6 h-6 text-neutral-700 dark:text-neutral-300 mt-4 md:mt-[1.375rem] sm:mt-[1.375rem]"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <AnimatePresence>
              <motion.div
                className={cn(
                  "py-12 overflow-y-auto z-20 select-none",
                  !display
                    ? "hidden"
                    : "fixed md:static sm:static block h-[50vh] md:h-screen sm:h-screen px-4 right-0 w-full md:w-1/2 sm:w-1/2"
                )}
              >
                <div ref={lyricsContainerRef} style={{ maxHeight: "100%" }}>
                  {lyrics.map((line, index) => {
                    const translationLine = translatedLyrics.find(
                      (translatedLine) =>
                        translatedLine.timestamp === line.timestamp &&
                        line.text !== ""
                    );
                    const highlightedIndex = lyrics.findIndex(
                      (lyric) =>
                        lyric.text === highlightedLine &&
                        lyric.timestamp === highlightedLineTimestamp
                    );
                    const isHighlightedRow = index === highlightedIndex;
                    const isPreviousRowHighlighted =
                      index === highlightedIndex - 1;
                    const isNextRowHighlighted = index === highlightedIndex + 1;
                    const isTwoRowsBeforeHighlighted =
                      index === highlightedIndex - 2;
                    const isTwoRowsAfterHighlighted =
                      index === highlightedIndex + 2;
                    const isThreeRowsBeforeHighlighted =
                      index === highlightedIndex - 3;
                    const isThreeRowsAfterHighlighted =
                      index === highlightedIndex + 3;
                    const isFourRowsBeforeHighlighted =
                      index === highlightedIndex - 4;
                    const isFourRowsAfterHighlighted =
                      index === highlightedIndex + 4;
                    return (
                      <motion.p
                        key={index}
                        className={cn(
                          "text-neutral-700 dark:text-neutral-300 text-3xl md:text-4xl sm:text-5xl font-semibold flex flex-col space-y-1 tracking-tighter transition-all duration-500 cursor-pointer px-2.5 md:px-0 sm:px-0 py-4 md:py-7 sm:py-10 leading-normal",
                          isHighlightedRow &&
                            highlightedIndex !== -1 &&
                            "text-[2rem] md:text-[2.4rem] sm:text-[3.2rem] blur-0",
                          isPreviousRowHighlighted &&
                            highlightedIndex !== -1 &&
                            "opacity-40 blur-[0.5px]",
                          isNextRowHighlighted &&
                            highlightedIndex !== -1 &&
                            "opacity-40 blur-[0.5px]",
                          isTwoRowsBeforeHighlighted &&
                            highlightedIndex !== -1 &&
                            "opacity-25 blur-[1px]",
                          isTwoRowsAfterHighlighted &&
                            highlightedIndex !== -1 &&
                            "opacity-25 blur-[1px]",
                          isThreeRowsBeforeHighlighted &&
                            highlightedIndex !== -1 &&
                            "opacity-25 blur-[1.5px]",
                          isThreeRowsAfterHighlighted &&
                            highlightedIndex !== -1 &&
                            "opacity-25 blur-[1.5px]",
                          isFourRowsBeforeHighlighted &&
                            highlightedIndex !== -1 &&
                            "opacity-25 blur-[2px]",
                          isFourRowsAfterHighlighted &&
                            highlightedIndex !== -1 &&
                            "opacity-25 blur-[2px]",
                          !isHighlightedRow &&
                            !isPreviousRowHighlighted &&
                            !isNextRowHighlighted &&
                            !isTwoRowsBeforeHighlighted &&
                            !isTwoRowsAfterHighlighted &&
                            !isThreeRowsBeforeHighlighted &&
                            !isThreeRowsAfterHighlighted &&
                            !isFourRowsBeforeHighlighted &&
                            !isFourRowsAfterHighlighted &&
                            highlightedIndex !== -1 &&
                            "opacity-25 blur-[2.5px]",
                          highlightedIndex === -1 &&
                            line.text !== "" &&
                            "opacity-25 blur-[2.5px]"
                        )}
                        onClick={() => audioRef.current.seekTo(line.timestamp)}
                        data-text={String(line.timestamp)}
                      >
                        <span className="mb-1 md:mb-2 sm:mb-2 leading-normal break-words hyphens-auto">
                          {line.text ? (
                            <>{line.text}</>
                          ) : (
                            <>
                              <div
                                className={cn(
                                  "dots",
                                  highlightedIndex === -1
                                    ? "flex blur-0"
                                    : "invisible"
                                )}
                              >
                                <div></div>
                                <div></div>
                                <div></div>
                              </div>
                            </>
                          )}
                        </span>
                        {translationLine?.text && (
                          <span className="text-[1.325rem] md:text-[1.675rem] sm:text-[2.1rem] text-neutral-600 dark:text-neutral-400 font-medium leading-normal">
                            {translationLine.text}
                          </span>
                        )}
                      </motion.p>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
}

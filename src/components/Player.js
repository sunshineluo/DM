import { useRef, useEffect, useState, useContext, Fragment } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import ReactPlayer from "react-player";
import { Icon } from "@iconify/react";
import * as Slider from "@radix-ui/react-slider";
import { SongIdsContext } from "./SongIdsContext";
import * as Dialog from "@radix-ui/react-dialog";
import { useAnimation } from "framer-motion";
import { Menu, Transition } from "@headlessui/react";
import SongButton from "./SongButton";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Player() {
  const [lyrics, setLyrics] = useState([]);
  const [isFull, setIsFull] = useState("false");
  const [highlightedLine, setHighlightedLine] = useState("");
  const [highlightedLineTimestamp, setHighlightedLineTimestamp] = useState("");
  const {
    isPlaying,
    setIsPlaying,
    songIds,
    currentSongIndex,
    setCurrentSongIndex,
  } = useContext(SongIdsContext);
  const [playMode, setPlayMode] = useState("default"); // 默认为顺序播放模式
  const [translatedLyrics, setTranslatedLyrics] = useState([]);
  const [songInfo, setSongInfo] = useState([]);
  const audioRef = useRef(null);
  const lyricsContainerRef = useRef(null);
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
  const [hasLoadedPlaybackTime, setHasLoadedPlaybackTime] = useState(false);
  const [selectedTime, setSelectedTime] = useState(-1);
  const [showTimeMenu, setShowTimeMenu] = useState(false);
  const [closeTimer, setCloseTimer] = useState(null);
  const handleTimingCloseClick = () => {
    setShowTimeMenu(true); // 点击 "定时关闭" 时显示第二个 Menu
  };

  useEffect(() => {
    if (selectedTime !== "") {
      clearTimeout(closeTimer);

      const newCloseTimer = setTimeout(() => {
        setIsPlaying(false);
      }, parseInt(selectedTime) * 60 * 1000);

      setCloseTimer(newCloseTimer);
    }
  }, [selectedTime]);

  const handleSelectTime = (event) => {
    setSelectedTime(event.target.value);

    clearTimeout(closeTimer);
    setIsPlaying(true);
  };

  const timeOptions = [
    { label: "无限制", value: "" },
    { label: "1分钟", value: "1" },
    { label: "5分钟", value: "5" },
    { label: "15分钟", value: "15" },
    { label: "30分钟", value: "30" },
    { label: "45分钟", value: "45" },
    { label: "60分钟", value: "60" },
    { label: "120分钟", value: "120" },
  ];

  useEffect(() => {
    const storedCurrentTime = localStorage.getItem("playedTime");
    setCurrentTime(
      storedCurrentTime !== null ? parseFloat(storedCurrentTime) : 0
    );
    // 将hasLoadedPlaybackTime设置为true，表示已经从localStorage中读取了播放时间
    setHasLoadedPlaybackTime(true);
  }, []);

  useEffect(() => {
    // 判断是否已经从localStorage中读取了播放时间
    if (hasLoadedPlaybackTime) {
      audioRef.current.seekTo(currentTime);
    }
  }, [hasLoadedPlaybackTime]);

  useEffect(() => {
    const storedIsPlaying = localStorage.getItem("isPlaying");
    const storedCurrentTime = localStorage.getItem("playedTime");

    setIsPlaying(storedIsPlaying ? JSON.parse(storedIsPlaying) : false);

    setCurrentTime(storedCurrentTime ? parseFloat(storedCurrentTime) : 0);

    localStorage.setItem("currentSongIndex", JSON.stringify(currentSongIndex));

    return () => {
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
      setCurrentSongIndex(0);
    }
  }, [songIds]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 767) {
        setDisplay(false);
      } else {
        setDisplay(true);
      }
    };

    window.addEventListener("resize", handleResize);

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

  useEffect(() => {
    const storedCurrentTime = localStorage.getItem("playedTime");
    setCurrentTime(
      storedCurrentTime !== null ? parseFloat(storedCurrentTime) : 0
    );
  }, []);

  useEffect(() => {
    audioRef.current.seekTo(currentTime);
  }, []);

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
    <div className="transition-all duration-500 fixed w-full max-h-screen z-[10000]">
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

      <motion.div
        initial={{ y: 0, borderRadius: 0 }}
        transition={{
          type: "spring",
          duration: 0.75,
        }}
        className={cn(
          "fixed transition-all duration-500",
          isFull === "true"
            ? "z-[99999] top-0 w-full h-screen"
            : "bottom-0 w-full"
        )}
      >
        <div className="transition-all duration-500">
          {songInfo.map((song) => (
            <img
              key={song.id}
              src={song.al.picUrl}
              alt="Album Cover"
              className={cn(
                "transition-all duration-500",
                isFull === "true"
                  ? "bg-no-repeat absolute h-screen z-[-1] left-0 top-0 inset-x-0 right-0 w-full"
                  : "hidden"
              )}
            />
          ))}
        </div>
        <div
          className={cn(
            "transition-all duration-500 flex flex-row overflow-y-hidden md:overflow-y-auto sm:overflow-y-auto",
            isFull === "true"
              ? "bg-neutral-100/75 dark:bg-neutral-900/75 backdrop-blur-3xl h-screen"
              : "w-full overflow-x-auto bg-neutral-100/75 dark:bg-neutral-900/75 backdrop-blur-3xl border-t-[1.5px] border-t-neutral-200/50 dark:border-t-neutral-800/50"
          )}
        >
          <div
            className={cn(
              "transition-all duration-500 select-none bottom-0 ",
              !display
                ? "top-0 md:top-0 sm:top-0 w-screen"
                : "fixed md:relative sm:relative top-0 py-0 md:py-6 sm:py-0",
              isFull === "true"
                ? "z-[99999] min-h-screen w-full md:w-1/2 sm:w-1/2 overflow-y-auto left-0 right-0 "
                : "max-w-7xl w-full mx-auto z-50"
            )}
          >
            {songInfo.map((song) => (
              <div
                key={song.id}
                className={cn(
                  "transition-all duration-500",
                  isFull === "true"
                    ? "mx-auto flex flex-col h-screen px-6 md:px-8 sm:px-0"
                    : "flex flex-row px-0 md:px-4 sm:px-4 py-2 md:py-0 sm:py-3"
                )}
              >
                <div
                  key={song.id}
                  className={cn(
                    "transition-all duration-500",
                    isFull === "true" ? "mx-auto" : "flex flex-row space-x-4"
                  )}
                >
                  <button
                    className={cn(
                      "transition-all duration-500 z-[10000000] text-center mx-auto",
                      isFull === "true" ? "flex" : "hidden"
                    )}
                    onClick={() =>
                      setIsFull(isFull === "true" ? "false" : "true")
                    }
                  >
                    <Icon
                      icon="pepicons-pop:line-x"
                      className={cn(
                        "items-center text-neutral-700 dark:text-neutral-300",
                        display
                          ? "opacity-0 md:opacity-75 sm:opacity-75"
                          : "opacity-75 ",
                        isFull === "true"
                          ? "w-10 md:w-12 h-10 md:h-12 sm:w-16 sm:h-16"
                          : "w-0 h-0"
                      )}
                    />
                  </button>
                  <motion.img
                    src={song.al.picUrl}
                    alt="Album Cover （PC）"
                    initial={{ scale: 1 }}
                    animate={{ scale: isPlaying ? 1 : 0.9 }}
                    onClick={() => setIsFull("true")}
                    className={cn(
                      "shadow-md object-contain item-center rounded-xl transition-all duration-500",
                      display ? "hidden md:block sm:block" : "hidden",
                      isFull === "true"
                        ? "mx-auto w-auto md:w-[26rem] sm:w-[28rem] "
                        : "w-14 h-14 md:w-16 md:h-16 sm:w-16 sm:h-16 cursor-pointer"
                    )}
                  />
                  <motion.img
                    src={song.al.picUrl}
                    alt="Album Cover （Mobile）"
                    initial={{ scale: 1 }}
                    animate={{ scale: isPlaying ? 1 : 0.9 }}
                    onClick={() => setIsFull("true")}
                    className={cn(
                      "shadow-md mx-auto w-auto md:w-[26rem] sm:w-[28rem] object-contain item-center rounded-xl transition-all duration-500",
                      !display
                        ? "opacity-100 z-0"
                        : "block md:hidden sm:hidden pointer-events-none select-none opacity-0 z-0",
                      isFull === "true"
                        ? "mx-auto w-auto md:w-[26rem] sm:w-[28rem] "
                        : "w-14 h-14 md:w-16 md:h-16 sm:w-16 sm:h-16 cursor-pointer"
                    )}
                  />
                  <div className="flex flex-row justify-between z-[99999]">
                    <div>
                      <h1
                        className={cn(
                          "font-semibold truncate",
                          isFull === "true"
                            ? "w-64 md:w-96 sm:w-[25.5rem] text-lg md:text-xl sm:text-xl mt-6 "
                            : "w-36 md:w-56 sm:w-72 text-base md:text-lg sm:text-lg mt-1"
                        )}
                      >
                        {song.name}
                      </h1>
                      <h2
                        className={cn(
                          "font-semibold opacity-75  truncate",
                          isFull === "true"
                            ? "w-64 md:w-96 sm:w-[25.5rem] text-lg md:text-xl sm:text-xl "
                            : "w-36 md:w-56 sm:w-72 text-base md:text-lg sm:text-lg"
                        )}
                      >
                        {song.ar.map((artist) => artist.name).join(" / ")}
                      </h2>
                    </div>
                    <div
                      className={cn(
                        isFull === "true" ? "block" : "hidden w-0 z-0"
                      )}
                    >
                      <Dialog.Root>
                        <Menu
                          as="div"
                          className="relative inline-block text-left"
                        >
                          <div>
                            <Menu.Button className="mt-6 w-9 h-9 flex justify-center align-middle rounded-full bg-neutral-200/50 dark:bg-neutral-600/50">
                              <Icon
                                icon="tabler:dots"
                                className="w-5 h-5 mt-2"
                              />
                            </Menu.Button>
                          </div>
                          <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                          >
                            <Menu.Items className="absolute border border-neutral-300 dark:border-neutral-700  right-0 mt-2 w-36 py-2 text-red-600 text-base md:text-base sm:text-lg origin-top-right bg-neutral-200 dark:bg-neutral-800 rounded-xl z-[99999]">
                              <div className="px-4 py-1 flex flex-col">
                                <Menu.Item
                                  as="button"
                                  onClick={() =>
                                    setDisplay(display === false ? true : false)
                                  }
                                  className="block md:hidden sm:hidden text-center rounded-xl px-3 py-0.5"
                                >
                                  {display ? "隐藏" : "显示"}歌词
                                </Menu.Item>
                                <hr className="my-2 border-neutral-300 dark:border-neutral-700 block md:hidden sm:hidden " />
                                <Menu.Item
                                  as="button"
                                  onClick={toggleLikeMusic}
                                  className="text-center rounded-xl px-3 py-0.5"
                                >
                                  {isLiked ? "取消喜欢" : "喜欢音乐"}
                                </Menu.Item>
                                <hr className="my-2 border-neutral-300 dark:border-neutral-700 " />

                                <Menu
                                  as="div"
                                  show={showTimeMenu}
                                  className="relative inline-block text-left"
                                >
                                  <button
                                    as="button"
                                    onClick={handleTimingCloseClick}
                                    className="text-center rounded-xl px-3 py-0.5 flex justify-center"
                                  >
                                    <Menu.Button className="ml-2.5 md:ml-2.5 sm:ml-1.5 w-full">
                                      定时关闭
                                    </Menu.Button>
                                  </button>
                                  <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                  >
                                    <Menu.Items className="absolute border border-neutral-300 dark:border-neutral-700  right-0 mt-2 w-36 py-2 text-red-600 text-base md:text-base sm:text-lg origin-top-right bg-neutral-200 dark:bg-neutral-800 rounded-xl z-[99999]">
                                      <div className="px-2 py-2">
                                        <select
                                          id="time-select"
                                          value={selectedTime}
                                          onChange={handleSelectTime}
                                        >
                                          <option value="">请选择</option>
                                          {timeOptions.map((option) => (
                                            <option
                                              key={option.value}
                                              value={option.value}
                                            >
                                              {option.label}
                                            </option>
                                          ))}
                                        </select>
                                        {selectedTime && <span>已选</span>}
                                        {!selectedTime && <span>无限</span>}
                                      </div>
                                    </Menu.Items>
                                  </Transition>
                                </Menu>

                                <hr className="my-2 border-neutral-300 dark:border-neutral-700 " />

                                <Dialog.Trigger asChild>
                                  <Menu.Item
                                    as="button"
                                    className="text-center rounded-xl px-3 py-0.5"
                                  >
                                    播放列表
                                  </Menu.Item>
                                </Dialog.Trigger>
                              </div>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                        <Dialog.Portal>
                          <Dialog.Overlay className="DialogOverlay bg-black/25 backdrop-blur-3xl" />
                          <Dialog.Content className="DialogContent fixed max-w-4xl mx-auto w-full h-screen bg-neutral-50 dark:bg-neutral-950 overflow-y-auto backdrop-blur-lg z-[999]">
                            <Dialog.Title className="DialogTitle font-medium text-3xl">
                              播放列表({playlistDetails.length})
                            </Dialog.Title>

                            <div className="flex flex-row justify-between text-red-600 dark:text-red-400 mt-6 px-6 md:px-0 sm:px-0">
                              <button onClick={handlePlayAll}>播放全部</button>
                              <button onClick={handleRemoveAll}>
                                删除全部
                              </button>
                            </div>

                            <div className="flex flex-col justify-start mt-4 overflow-y-auto">
                              {playlistDetails.length > 0 &&
                                playlistDetails.map((track, index) => {
                                  return (
                                    <SongButton
                                      key={track.id}
                                      picUrl={track.al.picUrl}
                                      index={index}
                                      duration={track.dt}
                                      id={track.id}
                                      ar={track.ar
                                        .map((artist) => artist.name)
                                        .join(" / ")}
                                      name={track.name}
                                      allowDel="true"
                                    />
                                  );
                                })}
                            </div>
                          </Dialog.Content>
                        </Dialog.Portal>
                      </Dialog.Root>
                    </div>
                  </div>

                  <Slider.Root
                    className={cn(
                      "transition-all duration-500 SliderRoot ",
                      isFull === "true"
                        ? "mx-auto"
                        : "hidden w-0 pointer-events-none z-0"
                    )}
                    min={0}
                    max={1}
                    step={0.01}
                    value={[played]}
                    onValueChange={(newValue) => handleSeekChange(newValue)}
                    onPointerUp={handleSeek}
                  >
                    <Slider.Track className="SliderTrack mt-4 backdrop-blur-lg bg-opacity-75 cursor-pointer">
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

                  <div
                    className={cn(
                      "transition-all duration-500 mx-auto mt-3 flex-row justify-between font-medium",
                      isFull === "true" ? "flex" : "hidden z-0"
                    )}
                  >
                    <div className="text-xs md:text-sm sm:text-sm opacity-75">
                      {formatTime(currentTime)}
                    </div>
                    <div className="text-xs md:text-sm sm:text-sm opacity-75">
                      -{formatTime(remainingTime)}
                    </div>
                  </div>

                  <div className="transition-all duration-500 flex flex-row justify-between text-neutral-700 dark:text-neutral-300">
                    <div
                      className={cn(
                        "transition-all duration-500 flex flex-row ",
                        isFull === "true" ? "w-8" : "w-0"
                      )}
                    >
                      <button
                        onClick={() =>
                          setPlayMode(
                            playMode === "default" ? "loop" : "default"
                          )
                        }
                        className={cn(
                          "px-1",
                          playMode === "loop" &&
                            "bg-neutral-200/50 dark:bg-neutral-600/50 rounded-md",
                          isFull === "true" ? "my-8 " : "hidden"
                        )}
                      >
                        {playMode !== "loop" && (
                          <svg
                            t="1692332614486"
                            fill="currentColor"
                            className="icon w-5 h-5 opacity-75"
                            viewBox="0 0 1024 1024"
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                            p-id="5598"
                          >
                            <path
                              d="M629.284571 749.714286l41.947429 41.910857a18.285714 18.285714 0 0 1-25.892571 25.892571l-73.142858-73.142857a18.285714 18.285714 0 0 1 0-25.892571l73.142858-73.142857a18.285714 18.285714 0 0 1 25.892571 25.892571L629.284571 713.142857H694.857143a201.142857 201.142857 0 0 0 0-402.285714h-146.285714a18.285714 18.285714 0 1 1 0-36.571429h146.285714a237.714286 237.714286 0 1 1 0 475.428572h-65.572572z m-234.569142-475.428572L352.768 232.374857a18.285714 18.285714 0 1 1 25.892571-25.892571l73.142858 73.142857a18.285714 18.285714 0 0 1 0 25.892571l-73.142858 73.142857a18.285714 18.285714 0 0 1-25.892571-25.892571L394.715429 310.857143H329.142857a201.142857 201.142857 0 0 0 0 402.285714h146.285714a18.285714 18.285714 0 1 1 0 36.571429H329.142857a237.714286 237.714286 0 1 1 0-475.428572h65.572572z"
                              p-id="5599"
                            ></path>
                          </svg>
                        )}
                        {playMode === "loop" && (
                          <svg
                            t="1692332614486"
                            fill="currentColor"
                            className="icon w-5 h-5 opacity-75"
                            viewBox="0 0 1024 1024"
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                            p-id="5598"
                          >
                            <path
                              d="M629.284571 749.714286l41.947429 41.910857a18.285714 18.285714 0 0 1-25.892571 25.892571l-73.142858-73.142857a18.285714 18.285714 0 0 1 0-25.892571l73.142858-73.142857a18.285714 18.285714 0 0 1 25.892571 25.892571L629.284571 713.142857H694.857143a201.142857 201.142857 0 0 0 0-402.285714h-146.285714a18.285714 18.285714 0 1 1 0-36.571429h146.285714a237.714286 237.714286 0 1 1 0 475.428572h-65.572572z m-234.569142-475.428572L352.768 232.374857a18.285714 18.285714 0 1 1 25.892571-25.892571l73.142858 73.142857a18.285714 18.285714 0 0 1 0 25.892571l-73.142858 73.142857a18.285714 18.285714 0 0 1-25.892571-25.892571L394.715429 310.857143H329.142857a201.142857 201.142857 0 0 0 0 402.285714h146.285714a18.285714 18.285714 0 1 1 0 36.571429H329.142857a237.714286 237.714286 0 1 1 0-475.428572h65.572572z"
                              p-id="5599"
                            ></path>
                          </svg>
                        )}
                      </button>
                    </div>

                    <div
                      className={cn(
                        "transition-all duration-500",
                        isFull === "true"
                          ? "mx-auto mt-4 mb-4 w-1/2 z-30"
                          : "w-full"
                      )}
                    >
                      <div className="mx-auto flex flex-row justify-between transition-all duration-500">
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
                            className={
                              ("icon z-50",
                              isFull === "true"
                                ? "w-10 md:w-11 sm:w-12 h-12 opacity-80 hover:opacity-100"
                                : "w-10 md:w-11 sm:w-12 h-12 mt-2 md:mt-1 sm:mt-1 opacity-80 hover:opacity-100")
                            }
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
                        <motion.button
                          initial={{ scale: 1 }}
                          animate={{
                            scale: isPlaying ? [0.85, 1] : [1, 0.85],
                            transition: {
                              type: "spring",
                              stiffness: 220,
                              damping: 10,
                            },
                          }}
                          onClick={() => setIsPlaying(!isPlaying)}
                        >
                          {isPlaying === true ? (
                            <svg
                              t="1692268156116"
                              fill="currentColor"
                              className={
                                ("icon ",
                                isFull === "true"
                                  ? "w-12 md:w-14 sm:w-16 h-16"
                                  : "w-10 md:w-12 sm:w-14 mt-2 md:mt-1 sm:mt-1")
                              }
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
                              className={
                                ("icon ",
                                isFull === "true"
                                  ? "w-12 md:w-14 sm:w-16 h-16"
                                  : "w-10 md:w-12 sm:w-14 mt-2 md:mt-1 sm:mt-1")
                              }
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
                        </motion.button>
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
                            className={
                              ("icon",
                              isFull === "true"
                                ? "w-10 md:w-11 sm:w-12 h-12 opacity-80 hover:opacity-100"
                                : "w-10 md:w-11 sm:w-12 h-12 mt-2 md:mt-1 sm:mt-1 opacity-80 hover:opacity-100")
                            }
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

                    <div
                      className={cn(
                        "transition-all duration-500 flex flex-row ",
                        isFull === "true" ? "w-8" : "w-0"
                      )}
                    >
                      <button
                        onClick={() =>
                          setPlayMode(
                            playMode === "shuffle" ? "default" : "shuffle"
                          )
                        }
                        className={cn(
                          "px-1",
                          playMode === "shuffle" &&
                            "bg-neutral-200/50 dark:bg-neutral-600/50 rounded-md",
                          isFull === "true" ? "my-8 " : "hidden"
                        )}
                      >
                        <svg
                          t="1692331981990"
                          fill="currentColor"
                          className={cn(
                            "w-6 h-6 icon",
                            playMode === "shuffle"
                              ? "opacity-100"
                              : "opacity-75"
                          )}
                          viewBox="0 0 1024 1024"
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          p-id="3392"
                          width="200"
                          height="200"
                        >
                          <path
                            d="M758.86592 676.00384a20.43904 20.43904 0 0 0 28.9792 0l51.712-51.65056a20.41856 20.41856 0 0 0 0-28.95872l-51.712-51.67104a20.48 20.48 0 1 0-28.9792 28.95872l16.73216 16.71168H634.2656l-38.44096-38.37952a20.43904 20.43904 0 0 0-28.95872 0.04096 20.45952 20.45952 0 0 0 0.02048 28.95872l44.4416 44.35968a20.48 20.48 0 0 0 14.47936 5.98016h149.79072l-16.71168 16.6912a20.48 20.48 0 0 0-0.02048 28.95872zM210.67776 405.99552h182.08768l39.30112 39.19872a20.48 20.48 0 1 0 28.91776-28.99968l-45.28128-45.17888a20.48 20.48 0 0 0-14.45888-5.98016h-190.54592a20.48 20.48 0 0 0-0.02048 40.96z"
                            p-id="3393"
                          ></path>
                          <path
                            d="M210.67776 630.33344h192.59392a20.48 20.48 0 0 0 14.47936-6.00064l218.58304-218.33728h139.24352l-16.71168 16.67072a20.50048 20.50048 0 0 0 28.95872 28.9792l51.712-51.63008a20.48 20.48 0 0 0 0-28.9792l-51.712-51.67104a20.48 20.48 0 1 0-28.9792 28.95872l16.73216 16.71168h-147.74272a20.48 20.48 0 0 0-14.47936 6.00064L394.79296 589.37344h-184.1152a20.48 20.48 0 1 0 0 40.96z"
                            p-id="3394"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "transition-all duration-500 flex-row mx-auto space-x-3",
                      isFull === "true" ? "flex" : "hidden"
                    )}
                  >
                    <button onClick={() => setVolume(0)}>
                      <Icon
                        icon="ion:volume-off"
                        className="font-bold w-5 md:w-5 sm:w-6 h-6 text-neutral-700 dark:text-neutral-300 mt-4 md:mt-[1.375rem] sm:mt-[1.375rem]"
                      />
                    </button>

                    <Slider.Root
                      className="SliderRoot transition-all duration-500"
                      min={0}
                      max={1}
                      step={0.01}
                      value={[volume]}
                      onValueChange={(newValue) => handleVolumeChange(newValue)}
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
                "py-12 overflow-y-auto select-none ",
                !display
                  ? "hidden"
                  : "z-[99999] block h-[50vh] md:h-screen sm:h-screen px-4 left-0 right-0 w-full md:w-1/2 sm:w-1/2",
                isFull === "true"
                  ? "block z-[99999]"
                  : "hidden z-0 pointer-events-none"
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
    </div>
  );
}

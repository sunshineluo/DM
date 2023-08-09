import { useRef, useEffect, useState, useContext } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import ReactPlayer from "react-player";
import { Icon } from "@iconify/react";
import * as Slider from "@radix-ui/react-slider";
import { SongIdsContext } from "./SongIdsContext";
import * as Dialog from "@radix-ui/react-dialog";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Player({ ids, full }) {
  const [lyrics, setLyrics] = useState([]);
  const [isFull, setIsFull] = useState(full);
  const [highlightedLine, setHighlightedLine] = useState("");
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
  const [currentTime, setCurrentTime] = useState(0);
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

  useEffect(() => {
    // 从 localStorage 中获取之前存储的索引值
    const storedIndex = localStorage.getItem("currentSongIndex");
    if (storedIndex !== null) {
      setCurrentSongIndex(JSON.parse(storedIndex));
    }
  }, []);

  useEffect(() => {
    // 每当 currentSongIndex 变化时，将其存储到 localStorage 中
    localStorage.setItem("currentSongIndex", JSON.stringify(currentSongIndex));
  }, [currentSongIndex]);

  const handleSongChange = (index) => {
    addToPlaylist(index); // 将新添加的歌曲索引传递给 addToPlaylist
    setCurrentSongIndex(index);
  };

  useEffect(() => {
    if (currentSongIndex >= songIds.length) {
      setCurrentSongIndex(0); // 如果 currentSongIndex 不再有效，则将其设置为默认索引 0
    }
  }, [songIds]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 1023) {
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
    // 在本地存储中保存display的值
    localStorage.setItem("display", JSON.stringify(display));
  }, [display]);

  useEffect(() => {
    const fetchSongData = async () => {
      try {
        const currentSongId = songIds[currentSongIndex];

        const songResponse = await axios.get(
          `https://cf233.eu.org/song/detail?ids=${currentSongId}`
        );
        const songData = songResponse.data;
        const songDetail = songData.songs;
        setSongInfo(songDetail);

        const lyricsResponse = await axios.get(
          `https://cf233.eu.org/lyric?id=${currentSongId}`
        );
        const lyricsData = lyricsResponse.data;
        const lyricsText = lyricsData.lrc.lyric;
        const parsedLyrics = parseLyrics(lyricsText);
        setLyrics(parsedLyrics);

        const translatedLyricsResponse = await axios.get(
          `https://cf233.eu.org/lyric/translate?id=${currentSongId}`
        );
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
        // 过滤空行
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

    let currentHighlightedLine = null;

    for (let i = 0; i < lyrics.length; i++) {
      const { timestamp, text } = lyrics[i];

      if (playedSeconds >= timestamp) {
        currentHighlightedLine = text;
      } else {
        break;
      }
    }

    setHighlightedLine(currentHighlightedLine);
  };

  useEffect(() => {
    if (highlightedLine) {
      const targetElement = lyricsContainerRef.current?.querySelector(
        `p[data-text="${highlightedLine
          .replace(/"/g, '\\"')
          .replace(/'/g, "\\'")}"]`
      );

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [highlightedLine]);

  const handleProgress = (progress) => {
    setPlayed(progress.played);
    setCurrentTime(progress.playedSeconds);
    setRemainingTime(audioRef.current.getDuration() - progress.playedSeconds);
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

  const shouldHideTranslation = (text) => {
    const commonWords = [
      "作曲 :",
      "作词 :",
      "演唱",
      "编曲",
      "制作",
      "配乐",
      "混音",
      "发行",
      "录音",
      "导演",
      "制片",
      "出品",
      "编剧",
      "监制",
      "设计",
      "和声",
      "贝斯",
      "吉他",
      "母带后期",
      "发行公司",
      "出品方",
    ]; // 添加需要隐藏翻译的常用词

    return commonWords.some((word) => text.includes(word));
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

  let originalIndex = 0;
  let translatedIndex = -1;

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

  const elementRef = useRef(null);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      elementRef.current.requestFullscreen();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  }, []);

  const handleKeydown = (event) => {
    if (event.key === "F11") {
      event.preventDefault();
      toggleFullscreen();
    }
  };

  const { getAllSongIds } = useContext(SongIdsContext);
  const playIds = getAllSongIds();

  useEffect(() => {
    const fetchPlaylistDetails = async () => {
      try {
        const response = await axios.get("https://cf233.eu.org/song/detail", {
          params: {
            ids: playIds.join(","),
          },
        });
        setPlaylistDetails(response.data.songs);
        console.log(playlistDetails);
      } catch (error) {
        console.error("Error fetching playlist details: ", error);
      }
    };

    if (playIds.length > 0) {
      fetchPlaylistDetails();
    }
  }, [playIds]);

  const handleAddToPlaylist = (trackId) => {
    addToPlaylist(trackId);
  };

  return (
    <div ref={elementRef} className="w-full max-h-screen h-screen fixed">
      <div>
        <Dialog.Root>
          <Dialog.Trigger asChild>
            <button className="fixed top-12 md:top-12 sm:top-32 left-2 md:left-8 sm:left-12 z-[9999] flex flex-col">
              <Icon
                icon="bi:archive-fill"
                className="w-4 md:w-8 h-4 md:h-8 sm:w-8 sm:h-8 opacity-75 text-neutral-700"
              />
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="DialogOverlay bg-black/25 backdrop-blur-3xl" />
            <Dialog.Content className="DialogContent fixed max-w-4xl mx-auto w-full h-screen bg-neutral-100 overflow-y-auto backdrop-blur-lg z-[999]">
              <Dialog.Title className="DialogTitle font-medium text-3xl">
                播放列表({playlistDetails.length})
              </Dialog.Title>

              <div className="flex flex-col justify-start mt-6 overflow-y-auto">
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
                            index % 2 === 0 ? "bg-neutral-200" : "odd"
                          }`}
                        >
                          <div
                            onClick={() => handleAddToPlaylist(track.id)}
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
                              <span className="text-base opacity-75 text-left">
                                {track.ar
                                  .map((artist) => artist.name)
                                  .join(" / ")}{" "}
                                -{track.al.name}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteSong(track.id)}
                            className="text-red-600 w-24 md:w-16 sm:w-8 text-right"
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
        <div className="fixed bottom-0 w-full bg-neutral-200/75 backdrop-blur-lg border-t-[1.5px] border-t-neutral-200/50">
          <div className="max-w-4xl mx-auto px-0 md:px-8 sm:px-8">
            {songInfo && songInfo.length > 0 &&
              songInfo.map((song) => (
                <div key={song.id} className="flex flex-row">
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
                        <span className="text-base font-medium text-center w-full flex-nowrap flex overflow-hidden truncate">
                          {song.name}
                        </span>
                        <span className="text-base opacity-75 text-left whitespace-nowrap">
                          {song.ar.map((artist) => artist.name).join(" / ")}
                        </span>
                      </div>
                    </div>
                    <div className="py-0 md:py-4 sm:py-4 flex flex-col space-y-1 justify-center w-full">
                      {" "}
                      <div className="flex flex-row w-56 md:w-96 sm:w-96 justify-between text-neutral-700 px-6 md:px-8 sm:px-10">
                        {" "}
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
                        <div className="w-[57.5%] md:w-[45%] sm:w-[45%] mx-auto">
                          <div className="mx-auto flex flex-row justify-between z-30">
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
                        <button
                          onClick={() =>
                            setDisplay(display === false ? true : false)
                          }
                        >
                          <Icon
                            icon="solar:password-minimalistic-bold"
                            className="w-4 md:w-6 sm:w-6 h-6 opacity-75 block md:block sm:hidden"
                          />
                        </button>
                        <button onClick={toggleFullscreen}>
                          <Icon
                            icon="bi:card-list"
                            className="w-6 h-6 opacity-75 hidden md:hidden sm:block"
                          />
                        </button>
                      </div>
                      <div>
                        <Slider.Root
                          className="SliderRoot mx-auto hidden md:inline sm:inline"
                          min={0}
                          max={1}
                          step={0.01}
                          value={[played]}
                          onValueChange={(newValue) =>
                            handleSeekChange(newValue)
                          }
                          onPointerUp={handleSeek}
                        >
                          <Slider.Track className="SliderTrack backdrop-blur-lg bg-opacity-75 cursor-pointer">
                            <Slider.Range
                              className={cn(
                                "SliderRange cursor-pointer",
                                played === 1 ? "rounded-full" : "rounded-l-full"
                              )}
                            />
                            <Slider.Thumb
                              className="SliderThumb focus:outline-none -mt-1"
                              aria-label="Progress"
                            />
                          </Slider.Track>
                        </Slider.Root>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
      {isFull === "true" && (
        <motion.div className="fixed top-0 w-full h-screen">
          <button
            className="fixed top-2 md:top-24 sm:top-8 inset-x-0 left-0 md:left-4 sm:left-8 right-0 z-[99999]"
            onClick={() => setIsFull("false")}
          >
            <Icon
              icon="bi:x"
              className="w-8 md:w-12 h-8 md:h-12 sm:w-16 sm:h-16 opacity-75 text-neutral-700"
            />
          </button>
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
          <div className="flex flex-row w-full h-screen bg-neutral-100/75 backdrop-blur-3xl">
            <div
              className={cn(
                "transition-all duration-500 w-full md:w-full sm:w-1/2 h-screen left-0 right-0 z-50 fixed select-none bottom-0 overflow-y-auto",
                display === false
                  ? "top-0 md:top-0 sm:top-0 w-screen"
                  : "top-[50vh] md:top-[60vh] sm:top-0 z-[99999] py-0 md:py-12 sm:py-0 "
              )}
            >
              {songInfo.map((song) => (
                <div
                  key={song.id}
                  className="flex flex-col mx-auto h-screen px-0 md:px-32 sm:px-32 py-4 md:py-12 sm:py-12"
                >
                  <div key={song.id} className="mx-auto">
                    <motion.img
                      src={song.al.picUrl}
                      alt="Album Cover"
                      initial={{ scale: 1 }}
                      animate={
                        display === false
                          ? { scale: isPlaying ? 1 : 0.85 }
                          : { scale: 1 }
                      }
                      className={cn(
                        "hidden md:hidden sm:block mx-auto w-5/6 item-center rounded-xl"
                      )}
                    />
                    <motion.img
                      src={song.al.picUrl}
                      alt="Album Cover"
                      initial={{ scale: 1 }}
                      animate={{ scale: isPlaying ? 1 : 0.85 }}
                      className={cn(
                        "mx-auto w-5/6 item-center rounded-xl",
                        display === false ? "block" : "hidden"
                      )}
                    />
                    <h1 className="text-center font-semibold text-lg mt-4">
                      {song.name}
                    </h1>
                    <h2 className="text-center font-medium text-lg opacity-75">
                      {song.ar.map((artist) => artist.name).join(" / ")}
                    </h2>
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
                          played === 1 ? "rounded-full" : "rounded-l-full"
                        )}
                      />
                      <Slider.Thumb
                        className="SliderThumb focus:outline-none -mt-1"
                        aria-label="Progress"
                      />
                    </Slider.Track>
                  </Slider.Root>

                  <div className="w-[85%] mx-auto mt-3 flex flex-row justify-between font-medium">
                    <div className="opacity-75">{formatTime(currentTime)}</div>
                    <div className="opacity-75">
                      -{formatTime(remainingTime)}
                    </div>
                  </div>

                  <div className="flex flex-row justify-between text-neutral-700 px-6 md:px-8 sm:px-10">
                    {" "}
                    <button onClick={handlePlayMode}>
                      {playMode === "default" && (
                        <Icon icon="bi:repeat" className="w-8 h-8 opacity-75" />
                      )}
                      {playMode === "loop" && (
                        <Icon
                          icon="bi:repeat-1"
                          className="w-8 h-8 opacity-75"
                        />
                      )}
                      {playMode === "shuffle" && (
                        <Icon
                          icon="bi:shuffle"
                          className="w-8 h-8 opacity-75"
                        />
                      )}
                    </button>
                    <div className="w-[57.5%] md:w-[45%] sm:w-[45%] mx-auto mt-5 mb-5">
                      <div className="mx-auto flex flex-row justify-between z-30">
                        <button
                          onClick={() =>
                            setCurrentSongIndex(
                              (currentSongIndex - 1 + songIds.length) %
                                songIds.length
                            )
                          }
                        >
                          <Icon
                            className="font-bold w-12 h-12 opacity-80 hover:opacity-100"
                            icon="bi:rewind-fill"
                          />
                        </button>
                        <button onClick={() => setIsPlaying(!isPlaying)}>
                          {isPlaying === true ? (
                            <Icon
                              className="font-bold w-12 h-12"
                              icon="clarity:pause-solid"
                            />
                          ) : (
                            <Icon
                              className="font-bold w-12 h-12"
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
                            className="font-bold w-12 h-12 opacity-80 hover:opacity-100"
                            icon="bi:fast-forward-fill"
                          />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setDisplay(display === false ? true : false)
                      }
                    >
                      <Icon
                        icon="solar:password-minimalistic-bold"
                        className="w-8 h-8 opacity-75 block md:block sm:hidden"
                      />
                    </button>
                    <button onClick={toggleFullscreen}>
                      <Icon
                        icon="solar:full-screen-square-bold"
                        className="w-8 h-8 opacity-75 hidden md:hidden sm:block"
                      />
                    </button>
                  </div>

                  <div className="flex flex-row mx-auto w-[85%] space-x-3">
                    <button onClick={() => setVolume(0)}>
                      <Icon
                        icon="ion:volume-off"
                        className="font-bold w-6 h-6 text-neutral-700 mt-[1.375rem]"
                      />
                    </button>

                    <Slider.Root
                      className="SliderRoot"
                      min={0}
                      max={1}
                      step={0.01}
                      value={[volume]}
                      onValueChange={(newValue) => handleVolumeChange(newValue)}
                    >
                      <Slider.Track className="SliderTrack mt-12 backdrop-blur-lg bg-opacity-75 cursor-pointer">
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
                        className="font-bold w-6 h-6 text-neutral-700 mt-[1.375rem]"
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <AnimatePresence>
              <motion.div
                className={cn(
                  "text-left flex right-0 py-12 overflow-y-auto fixed z-20 select-none",
                  display === false
                    ? "hidden"
                    : "block h-[50vh] md:h-[65vh] mx-auto md:mx-auto sm:mr-auto sm:h-screen max-w-sm md:max-w-3xl sm:max-w-none right-0 w-full md:w-full sm:w-[55%] ",
                  "justify-center md:justify-center sm:justify-start"
                )}
              >
                <div ref={lyricsContainerRef} style={{ maxHeight: "100%" }}>
                  {lyrics.map((line, index) => {
                    if (line.text) {
                      originalIndex++;
                      if (!shouldHideTranslation(line.text)) {
                        translatedIndex++;
                      }
                    }

                    const shouldMoveTranslation =
                      line.text &&
                      (shouldHideTranslation(line.text) || !line.text);
                    const isHidden =
                      !line.text && !shouldHideTranslation(line.text); // 是否隐藏空行

                    return (
                      <motion.p
                        key={index}
                        className={cn(
                          "text-left h-auto max-h-min w-full max-w-3xl flex flex-col space-y-1 tracking-tighter transition-all duration-500 cursor-pointer text-neutral-700 rounded-3xl px-8 py-4 md:py-7 sm:py-10 leading-normal flex-1 font-semibold",
                          line.text === highlightedLine
                            ? "font-semibold text-4xl md:text-5xl sm:text-6xl text-neutral-600"
                            : "text-3xl md:text-4xl sm:text-5xl blur-[2px] text-neutral-600 font-semibold"
                        )}
                        onClick={() => audioRef.current.seekTo(line.timestamp)}
                        data-text={line.text}
                      >
                        <span className="mb-1 md:mb-2 sm:mb-4 leading-normal">
                          {line.text}
                        </span>

                        {!shouldHideTranslation(line.text) && (
                          <span
                            className={`font-medium mt-8 text-2xl md:text-3xl sm:text-4xl text-neutral-500 ${
                              shouldMoveTranslation ? "moved-translation" : ""
                            } ${
                              shouldMoveTranslation || isHidden ? "hidden" : ""
                            }`}
                          >
                            {translatedLyrics[translatedIndex]?.text}
                          </span>
                        )}

                        {shouldMoveTranslation && (
                          <motion.p className="hidden">&nbsp;</motion.p>
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

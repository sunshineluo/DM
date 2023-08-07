import { useRef, useEffect, useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import ReactPlayer from "react-player";
import { Icon } from "@iconify/react";
import * as Slider from "@radix-ui/react-slider";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Beta() {
  const [lyrics, setLyrics] = useState([]);
  const [highlightedLine, setHighlightedLine] = useState("");
  const [songIds, setSongIds] = useState([
    "1321998668",
    "496869422",
    "443860",
    "4010229",
    "1377372517",
    "17423737",
    "441120082",
    "1410490086",
    "4010198",
    "1352247646",
    "2020818962",
  ]); // 歌曲ID数组
  const [currentSongIndex, setCurrentSongIndex] = useState(0); // 当前歌曲索引
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

    // 滚动到当前高亮行
    const targetElement = lyricsContainerRef.current.querySelector(
      `p[data-text="${currentHighlightedLine
        .replace(/"/g, '\\"')
        .replace(/'/g, "\\'")}"]`
    );
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

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
      "作曲",
      "作词",
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

  let originalIndex = 0;
  let translatedIndex = -1;

  return (
    <div className="w-full max-h-screen h-screen fixed">
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
            "transition-all duration-500 w-full md:w-full sm:w-1/2 h-screen left-0 right-0 z-50 fixed bottom-0 overflow-y-auto",
            display === false
              ? "w-screen"
              : "top-[45vh] md:top-[60vh] sm:top-0 z-[99999] py-0 md:py-12 sm:py-0 "
          )}
        >
          {songInfo.map((song) => (
            <div
              key={song.id}
              className="flex flex-col mx-auto h-screen px-0 md:px-32 sm:px-32 py-12"
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
                  <Slider.Range className="SliderRange cursor-pointer" />
                  <Slider.Thumb
                    className="SliderThumb focus:outline-none -mt-1"
                    aria-label="Progress"
                  />
                </Slider.Track>
              </Slider.Root>

              <div className="w-[85%] mx-auto mt-3 flex flex-row justify-between font-medium">
                <div className="opacity-75">{formatTime(currentTime)}</div>
                <div className="opacity-75">-{formatTime(remainingTime)}</div>
              </div>

              <div className="flex flex-row justify-between text-neutral-700 px-6">
                {" "}
                <button>
                  <Icon
                    icon="icon-park-outline:play-cycle"
                    className="w-6 h-6 opacity-75 "
                  />
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
                  onClick={() => setDisplay(display === false ? true : false)}
                >
                  <Icon
                    icon="fa6-solid:file-word"
                    className="w-6 h-6 opacity-75 block md:block sm:hidden"
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
                    <Slider.Range className="SliderRange cursor-pointer" />
                    <Slider.Thumb
                      className="SliderThumb focus:outline-none -mt-1"
                      aria-label="Volume"
                    />
                  </Slider.Track>
                </Slider.Root>

                <button>
                  <Icon
                    icon="fa-solid:volume-up"
                    className="font-bold w-6 h-6 text-neutral-700 mt-[1.375rem]"
                  />
                </button>
              </div>
            </div>
          ))}

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
            className="fixed top-0"
          />
        </div>

        <AnimatePresence>
          <motion.div
            className={cn(
              "text-left flex right-0 py-12 overflow-y-auto fixed z-20 pointer-events-none select-none",
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
                  line.text && (shouldHideTranslation(line.text) || !line.text);
                const isHidden =
                  !line.text && !shouldHideTranslation(line.text); // 是否隐藏空行

                return (
                  <motion.p
                    key={index}
                    className={cn(
                      "text-left h-auto max-h-min w-full flex flex-col space-y-1 tracking-tighter transition-all duration-500 cursor-pointer text-neutral-700 rounded-3xl px-8 py-6 md:py-8 sm:py-10 leading-snug flex-1 font-semibold",
                      line.text === highlightedLine
                        ? "font-semibold text-4xl md:text-5xl sm:text-6xl  text-neutral-600"
                        : "text-3xl md:text-4xl sm:text-5xl blur-[2px] text-neutral-600 font-semibold"
                    )}
                    onClick={() => audioRef.current.seekTo(line.timestamp)}
                    data-text={line.text}
                  >
                    <span>{line.text}</span>
                    {!shouldHideTranslation(line.text) && (
                      <span
                        className={`font-medium text-2xl md:text-3xl sm:text-4xl text-neutral-500 ${
                          shouldMoveTranslation ? "moved-translation" : ""
                        } ${shouldMoveTranslation || isHidden ? "hidden" : ""}`}
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
    </div>
  );
}

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
  const [songId, setSongId] = useState("38592976");
  const [translatedLyrics, setTranslatedLyrics] = useState([]);
  const [songInfo, setSongInfo] = useState([]);
  const audioRef = useRef(null);
  const lyricsContainerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [seekValue, setSeekValue] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [display, setDisplay] = useState("");

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 1360) {
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
  }, []); // 仅在组件挂载时执行一次

  useEffect(() => {
    const fetchSongData = async () => {
      try {
        const songResponse = await axios.get(
          `https://cf233.eu.org/song/detail?ids=${songId}`
        );
        const songData = songResponse.data;
        const songDetail = songData.songs;
        setSongInfo(songDetail);

        const lyricsResponse = await axios.get(
          `https://cf233.eu.org/lyric?id=${songId}`
        );
        const lyricsData = lyricsResponse.data;
        const lyricsText = lyricsData.lrc.lyric;
        const parsedLyrics = parseLyrics(lyricsText);
        setLyrics(parsedLyrics);

        const translatedLyricsResponse = await axios.get(
          `https://cf233.eu.org/lyric/translate?id=${songId}`
        );
        const translatedLyricsData = translatedLyricsResponse.data;
        const translatedLyricsText = translatedLyricsData.tlyric.lyric;
        const parsedTranslatedLyrics = parseLyrics(translatedLyricsText);
        setTranslatedLyrics(parsedTranslatedLyrics);
      } catch (error) {
        console.log(error);
      }
    };

    if (songId) {
      fetchSongData();
    }
  }, [songId]);

  const parseLyrics = (lyricsText) => {
    const lines = lyricsText.split("\n");
    const parsedLyrics = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const regex = /\[(\d+):(\d+)\.\d+\]/;
      const match = line.match(regex);
      if (match) {
        const [, minutes, seconds] = match;
        const currentTimeInSeconds = parseInt(minutes) * 60 + parseInt(seconds);

        parsedLyrics.push({
          timestamp: currentTimeInSeconds,
          text: line.replace(regex, "").trim(),
        });
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

  return (
    <div className="w-screen max-h-screen h-screen">
      <div>
        {songInfo.map((song) => (
          <img
            src={song.al.picUrl}
            alt="Album Cover"
            className="bg-no-repeat absolute h-screen z-[-1] left-0 top-0 inset-x-0 right-0 w-full"
          />
        ))}
      </div>
      <div className="flex flex-row w-full h-screen bg-neutral-100/75 backdrop-blur-3xl">
        <div className="w-full md:w-full sm:w-1/2 h-screen left-0 top-0 bottom-0 right-0 z-10">
          {songInfo.map((song) => (
            <div className="flex flex-col mx-auto h-screen px-6 md:px-6 sm:px-24 py-16 md:py-24 sm:py-16 ml-12">
              <div key={song.id} className="mx-auto">
                <motion.img
                  src={song.al.picUrl}
                  alt="Album Cover"
                  initial={{ scale: 1 }}
                  animate={{ scale: isPlaying ? 1 : 0.85 }}
                  className={cn(
                    "hidden md:hidden sm:block mx-auto w-5/6 item-center rounded-xl",
                  )}
                />
                <motion.img
                  src={song.al.picUrl}
                  onClick={() => setDisplay(display === false ? true : false)}
                  alt="Album Cover"
                  initial={{ scale: 1 }}
                  animate={{ scale: isPlaying ? 1 : 0.85 }}
                  className={cn(
                    "block md:block sm:hidden mx-auto w-5/6 item-center rounded-xl",
                    display === false ? "block" : "hidden"
                  )}
                />

                <h1 className="text-center font-semibold text-lg mt-8">
                  {song.name}
                </h1>
                <h2 className="text-center font-medium text-lg opacity-75">
                  {song.ar[0].name}
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
                  <Slider.Range className="SliderRange cursor=pointer" />
                  <Slider.Thumb
                    className="SliderThumb -mt-1"
                    aria-label="Progress"
                  />
                </Slider.Track>
              </Slider.Root>

              <div className="w-[85%] mx-auto mt-2 flex flex-row justify-between font-medium">
                <div className="opacity-75">{formatTime(currentTime)}</div>
                <div className="opacity-75">-{formatTime(remainingTime)}</div>
              </div>

              <div className="w-[40%] text-neutral-700 mx-auto mt-4">
                <div className="mx-auto flex flex-row justify-between z-30">
                  <button>
                    <Icon
                      className="font-bold w-12 h-12"
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
                  <button>
                    <Icon
                      className="font-bold w-12 h-12"
                      icon="bi:fast-forward-fill"
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <ReactPlayer
            ref={audioRef}
            playing={isPlaying}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            url={`https://music.163.com/song/media/outer/url?id=${songId}.mp3`}
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
              "hidden md:hidden sm:block w-full md:w-full sm:w-[55%] right-0 py-12 h-screen overflow-y-auto z-20",
              display === false ? "hidden" : "block"
            )}
          >
            <div ref={lyricsContainerRef} style={{ maxHeight: "100%" }}>
              {lyrics.map((line, index) => (
                <motion.p
                  key={index}
                  className={cn(
                    "flex flex-col space-y-1 tracking-tighter hover:bg-neutral-200/25 transition-all duration-500 cursor-pointer rounded-xl w-auto px-8 py-10 leading-snug",
                    line.text === highlightedLine
                      ? "font-semibold text-6xl  text-neutral-600"
                      : "text-5xl blur-[2px] text-neutral-600 font-semibold"
                  )}
                  onClick={() => audioRef.current.seekTo(line.timestamp)}
                  data-text={line.text}
                >
                  <span>{line.text}</span>
                  <span className="font-medium text-4xl text-neutral-500">
                    {translatedLyrics[index - 2]?.text}
                  </span>
                </motion.p>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

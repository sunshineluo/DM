import { useContext, useState } from "react";
import { SongIdsContext } from "./SongIdsContext";
import LazyLoad from "react-lazy-load";
import { Icon } from "@iconify/react";
import moment from "moment";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function SongButton({
  id,
  picUrl,
  allowDel,
  index,
  name,
  ar,
  duration,
}) {
  const { songIds, currentSongIndex, removeFromPlaylist, addToPlaylist } =
    useContext(SongIdsContext);
  const [isHover, setIsHover] = useState(false);

  const playingSongId = songIds[currentSongIndex];

  const handleAddToPlaylist = (trackId) => {
    addToPlaylist(trackId);
  };

  const handleDeleteSong = (id) => {
    removeFromPlaylist(id);
  };

  return (
    <button
      key={id}
      className={`flex flex-row space-x-4 w-full rounded-none md:rounded-xl sm:rounded-xl focus:bg-red-600 px-4 py-4 ${
        index % 2 === 0 && id !== playingSongId
          ? "focus:bg-red-600  bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800"
          : "hover:bg-neutral-200 dark:hover:bg-neutral-800 focus:bg-red-600 "
      } ${
        id === playingSongId
          ? "bg-red-600 text-white hover:bg-red-600 dark:hover:bg-red-600"
          : ""
      }`}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      onClick={() => handleAddToPlaylist(id)}
    >
      <div className="w-[2rem] flex flex-row justify-center items-center mt-3 md:mt-0 sm:mt-0">
        {id !== playingSongId && !isHover && (
          <span className="opacity-75 items-center">{index + 1}</span>
        )}
        {id === playingSongId && (
          <div className="justify-center items-center">
            <div className="playing">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        {id !== playingSongId && isHover && (
          <div className="justify-center items-center">
            <svg
              t="1692268110901"
              fill="currentColor"
              className="icon w-6 h-6 text-red-600"
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
          </div>
        )}
      </div>
      <div className="flex flex-row w-full justify-between">
        <div className="flex flex-col md:flex-row sm:flex-row">
          <span className="font-semibold text-left truncate w-48 md:w-56 sm:w-96">
            {name}
          </span>
          <span className="opacity-75 font-medium truncate w-48 md:w-56 sm:w-96 text-left">
            {ar}
          </span>
        </div>
        <div className="flex flex-row space-x-4">
          <span className="opacity-75 w-10 text-center align-middle flex items-center justify-center">
            {moment(duration).format("mm:ss")}
          </span>
          {allowDel === "true" ? (
            <span
              onClick={() => handleDeleteSong(id)}
              className={cn(
                "cursor-pointer",
                id === playingSongId ? "text-white" : "text-red-600"
              )}
            >
              删除
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}

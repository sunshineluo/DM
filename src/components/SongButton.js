import { useContext, useState } from "react";
import { SongIdsContext } from "./SongIdsContext";
import LazyLoad from "react-lazy-load";
import { Icon } from "@iconify/react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function SongButton({ id, picUrl, index, name, ar }) {
  const {
    songIds,
    currentSongIndex,
    setCurrentSongIndex,
    addAllToPlaylist,
    addToPlaylist,
  } = useContext(SongIdsContext);
  const [isHover, setIsHover] = useState(false);

  const playingSongId = songIds[currentSongIndex];

  const handleAddToPlaylist = (trackId) => {
    addToPlaylist(trackId);
  };

  return (
    <button
      key={id}
      className={`flex flex-row space-x-4 w-full rounded-none md:rounded-xl sm:rounded-xl px-6 py-4 ${
        index % 2 === 0 ? "bg-neutral-200 dark:bg-neutral-800" : "odd"
      }`}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      onClick={() => handleAddToPlaylist(id)}
    >
      <LazyLoad offset={100}>
        <img
          src={picUrl}
          alt={name}
          className={cn(
            "rounded-xl w-14 h-14 md:w-16 md:h-16 sm:w-16 sm:h-16",
            id === playingSongId && "opacity-75",
            isHover ? 'opacity-75' : 'opacity-100'
          )}
        />
      </LazyLoad>
      {id === playingSongId && (
        <div className="absolute">
          <div className="playing mt-5 md:mt-6 sm:mt-6 ml-0.5">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}
      {id !== playingSongId && isHover && (
        <div className="absolute flex justify-center">
          <Icon
            className="font-bold w-5 h-5 md:w-6 md:h-6 sm:w-7 sm:h-7 mt-4 text-red-600"
            icon="ph:play-fill"
          />
        </div>
      )}
      <div className="flex flex-col space-y-1 mt-1">
        <span className="font-medium text-left truncate w-48 md:w-56 sm:w-96 flex overflow-hidden">
          {name}
        </span>
        <span className="text-base opacity-75 text-left truncate w-48 md:w-56 sm:w-96">
          {ar}
        </span>
      </div>
    </button>
  );
}

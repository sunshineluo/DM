import { useContext, useState } from "react";
import { SongIdsContext } from "./SongIdsContext";
import LazyLoad from "react-lazy-load";
import { Icon } from "@iconify/react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function FullSongButton({ id, picUrl, index, name, ar }) {
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
      className="flex flex-col space-y-2 w-full rounded-none md:rounded-xl sm:rounded-xl mb-2"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      onClick={() => handleAddToPlaylist(id)}
    >
      <LazyLoad offset={100}>
        <img
          src={picUrl}
          alt={name}
          className={cn(
            "rounded-xl w-40 h-40 md:w-48 md:h-48 sm:w-56 sm:h-56 shadow-md",
            id === playingSongId && "opacity-75",
            isHover ? "opacity-75" : "opacity-100"
          )}
        />
      </LazyLoad>
      {id === playingSongId && (
        <div className="absolute opacity-75 ml-2 mt-6 w-6 h-6">
          <div className="playing index">
            <span className="bg-red-600 index"></span>
            <span className="bg-red-600 index"></span>
            <span className="bg-red-600 index"></span>
            <span className="bg-red-600 index"></span>
          </div>
        </div>
      )}
      {id !== playingSongId && isHover && (
        <Icon
          icon="bi:play-circle-fill"
          className="absolute opacity-75 ml-2 mt-6 w-6 h-6"
        />
      )}
      <div className="flex flex-col hover:underline mt-1">
        <span className="font-normal opacity-75 text-sm text-left truncate w-32 md:w-48 sm:w-56 flex overflow-hidden">
          {name}
          <br />
          {ar}
        </span>
      </div>
    </button>
  );
}

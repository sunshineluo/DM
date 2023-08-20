import { useState } from "react";
import LazyLoad from "react-lazy-load";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";

export default function PlaylistCard({ index, id, picUrl, name }) {
  const [isHover, setIsHover] = useState(false);
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(`/playlist?id=${id}`)}
      key={index}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      className="flex flex-col space-y-2 mb-2"
    >
      <LazyLoad offset={100}>
        <img
          src={picUrl}
          className="rounded-xl hover:opacity-75 shadow-md w-72 md:w-80 sm:w-80  h-72 md:h-80 sm:h-80"
        />
      </LazyLoad>
      <h1 className="w-72 md:w-80 sm:w-80 text-left text-sm opacity-75 font-normal hover:underline mb-4">
        {name}
      </h1>
      {isHover && (
        <Icon
          icon="bi:play-circle-fill"
          className="absolute opacity-75 ml-2 mt-6 w-6 h-6"
        />
      )}
    </button>
  );
}

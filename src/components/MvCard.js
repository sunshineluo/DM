import { useState } from "react";
import LazyLoad from "react-lazy-load";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";

export default function MvCard({ index, id, picUrl, name, ar }) {
  const [isHover, setIsHover] = useState(false);
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(`/mv?id=${id}`)}
      key={index}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      className="flex flex-col space-y-2 mb-2"
    >
      <LazyLoad offset={100}>
        <img
          src={picUrl}
          className="relative transition-all duration-500 rounded-xl hover:opacity-75 w-96 md:w-[27.5rem] sm:w-[27.5rem] h-48 md:h-56 sm:h-64 shadow-md"
        />
      </LazyLoad>
      <h1 className="w-80 md:w-96 sm:w-96 text-left text-sm opacity-75 font-normal hover:underline">
        {name}
        <br />
        {ar}
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

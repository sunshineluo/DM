import { useState } from "react";
import LazyLoad from "react-lazy-load";
import { useRouter } from "next/router";

export default function ArtistCard({ index, id, picUrl, name }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(`/artist?id=${id}`)}
      key={index}
      className="flex flex-col space-y-2 mb-2"
    >
      <LazyLoad offset={100}>
        <img src={picUrl} className="transition-all duration-500 rounded-xl hover:opacity-75 shadow-md h-48 md:h-56 sm:h-64" />
      </LazyLoad>
      <h1 className="w-80 md:w-96 sm:w-[25.5rem] text-left text-sm opacity-75 font-normal hover:underline">
        {name}
      </h1>
    </button>
  );
}
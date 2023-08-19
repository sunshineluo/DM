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
        <img src={picUrl} className="rounded-xl hover:opacity-75 shadow-md h-36 md:h-40 sm:h-48" />
      </LazyLoad>
      <h1 className="w-72 md:w-80 sm:w-80 text-left text-sm opacity-75 font-normal hover:underline mb-4">
        {name}
      </h1>
    </button>
  );
}
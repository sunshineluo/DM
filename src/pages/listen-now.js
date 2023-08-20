import Head from "next/head";
import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { SongIdsContext } from "@/components/SongIdsContext";
import FullSongButton from "@/components/FullSongButton";
import ArrowHeading from "@/components/ArrowHeading";
import PlaylistCard from "@/components/PlaylistCard";
import MvCard from "@/components/MvCard";

export default function ListenNow() {
  const router = useRouter();

  function cn(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  const { addToPlaylist } = useContext(SongIdsContext);

  const handleAddToPlaylist = (trackId) => {
    addToPlaylist(trackId);
  };
  return (
    <div className="max-w-7xl mx-auto px-0 md:px-6 sm:px-6 py-8 mb-20 overflow-hidden">
      <Head>
        <title>现在就听</title>
      </Head>

      <h1 className="px-6 md:px-0 sm:px-0 font-semibold text-3xl md:text-4xl sm:text-5xl">
        NOT AVAILABLE!!!
      </h1>

      <hr className="border-neutral-200 dark:border-neutral-800 my-3" />
      <ArrowHeading onClick={() => router.push("/highquality")}>
        每日推荐歌单
      </ArrowHeading>

      <div className="mt-4 px-6 md:px-0 sm:px-0 space-x-4 flex flex-row overflow-x-auto w-full"></div>

      <hr className="border-neutral-200 dark:border-neutral-800 my-3" />
      <ArrowHeading onClick={() => router.push("/newsongs")}>
        每日推荐歌曲
      </ArrowHeading>
      <div className="mt-4 px-6 md:px-0 sm:px-0 space-x-4 flex flex-row overflow-x-auto w-full"></div>

      <hr className="border-neutral-200 dark:border-neutral-800 my-3" />
      <ArrowHeading>每日推荐MV</ArrowHeading>
      <div className="mt-4 px-6 md:px-0 sm:px-0 space-x-4 flex flex-row overflow-x-auto w-full"></div>
    </div>
  );
}

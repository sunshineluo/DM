import Head from "next/head";
import React, { useState } from "react";
import Card from "./Card";
import AudioPlayer from 'react-h5-audio-player'
import { motion } from 'framer-motion'

const Search = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [artistResults, setArtistResults] = useState([]);
    const handleSearch = async () => {
        const response = await fetch(
            `http://cloud-music.pl-fe.cn/search?keywords=${searchTerm}`
        );
        const artist = await fetch(
            `http://cloud-music.pl-fe.cn/search?keywords=${searchTerm}&type=100&limit=3`
        )
        const data = await response.json();
        const ad = await artist.json();
        setSearchResults(data.result.songs);
        setArtistResults(ad.result.artists);
    };
    const [searchValue, setSearchValue] = useState("");
    const [src, setSrc] = useState("");
    return (
        <div>
            <Head>
                <title>"{searchValue}"的搜索结果 - IKER Music</title>
            </Head>
            <div className="max-w-6xl py-8 mx-auto">
                <div className="bar text-base sm:text-lg bg-zinc-950 z-50 max-w-6xl mx-auto top-0 fixed py-4 inset-x-0 flex flex-row overflow-x-auto w-full px-4 mb-4">
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute mt-2.5 ml-3 opacity-75 w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                        <input
                            className="rounded-md bg-zinc-950 border border-zinc-800 px-12 py-2"
                            placeholder="键入并按下“搜索”以搜索音乐"
                            type="search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div onClick={() => setSearchValue(searchTerm)}>
                        <button
                            className="ml-2 bg-zinc-400 text-black rounded-md px-8 w-28 text-center py-2"
                            onClick={handleSearch}
                        >
                            <p>搜索</p>
                        </button>
                    </div>
                </div>
                <ul className="mt-24 mb-24">
                    {searchValue !== '' ? (
                        <h1 className="px-4 text-2xl sm:text-4xl font-bold my-12">"{searchValue}"的搜索结果</h1>
                    ) : (
                        <div>
                            <h1 className="px-4 text-2xl sm:text-4xl font-bold text-center my-48 opacity-50">键入以开始搜索</h1>

                        </div>
                    )}

                    {artistResults.map((artist) => (
                        <motion.div
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            className=""
                        >
                            <div className="flex flex-row hover:bg-zinc-900 rounded-md space-x-6 px-4 py-3 transition-all duration-300 cursor-pointer">
                                <img src={artist.picUrl} className="rounded-full w-16 h-16" />
                                <p className="text-base sm:text-lg mt-3 font-bold">
                                    {artist.name}
                                    <span className="opacity-75 ml-2">{artist.alias}</span>
                                </p>
                            </div>
                        </motion.div>
                    ))}

                    <hr className="border-zinc-900 mt-6 mb-6" />

                    {searchResults.map((song) => (
                        <motion.div
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card
                                name={song.name}
                                artist={song.artists[0].name}
                                time={song.duration}
                                id={song.id}
                                onClick={() => setSrc(song.id)}
                            />
                        </motion.div>
                    ))}
                </ul>

                <div className="max-w-6xl mx-auto w-full fixed bottom-0 inset-x-0 flex">
                    <AudioPlayer
                        src={`https://music.163.com/song/media/outer/url?id=${src}.mp3`}
                        className="w-full"
                        autoPlay
                    />
                </div>
            </div>
        </div>
    );
};

export default Search
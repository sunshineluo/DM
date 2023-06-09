import Head from "next/head";
import React, { useState, useEffect } from "react";
import Card from "./Card";
import AudioPlayer from 'react-h5-audio-player'
import { motion } from 'framer-motion'
import { Tab } from '@headlessui/react'
import MVCard from "./MVCard";
import VideoCard from "./VideoCard";
import ArtistCard from "./ArtistCard";

function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}

const Search = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [artistResults, setArtistResults] = useState([]);
    const [MVResults, setMVResults] = useState([]);
    const [videoResults, setVideoResults] = useState([]);
    const handleSearch = async () => {
        const response = await fetch(
            `https://cf233.eu.org/search?keywords=${searchTerm}`
        );
        const artist = await fetch(
            `https://cf233.eu.org/search?keywords=${searchTerm}&type=100`
        )
        const mv = await fetch(
            `https://cf233.eu.org/search?keywords=${searchTerm}&type=1004`
        )
        const video = await fetch(
            `https://cf233.eu.org/search?keywords=${searchTerm}&type=1014`
        )
        const data = await response.json();
        const ad = await artist.json();
        const mi = await mv.json();
        const vi = await video.json();
        setSearchResults(data.result.songs);
        setArtistResults(ad.result.artists);
        setMVResults(mi.result.mvs);
        setVideoResults(vi.result.videos);
    };
    const [searchValue, setSearchValue] = useState('');
    const [src, setSrc] = useState('');
    return (
        <div>
            <Head>
                <title>IKER Music</title>
                <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests" />
            </Head>
            <div className="max-w-4xl py-8 mx-auto">
                <div className="text-sm flex flex-row space-x-0.5 w-full overflow-x-auto">
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute mt-2.5 sm:mt-3 ml-3 opacity-75 w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                        <input
                            className="rounded-lg border px-8 py-2"
                            placeholder="键入并按下“搜索”以搜索音乐"
                            type="search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div onClick={() => setSearchValue(searchTerm)}>
                        <button
                            className="ml-2 border bg-white text-black/75 rounded-lg px-8 w-24 text-center py-2"
                            onClick={handleSearch}
                        >
                            <p>搜索</p>
                        </button>
                    </div>
                </div>

                <ul className={cn("mt-2 mb-24",
                    searchValue !== '' ? 'hidden' : ''
                )}>

                    <h1 className="text-base sm:text-lg font-semibold">新歌速递</h1>

                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        Coming soon...
                    </motion.div>
                </ul>

                <ul className="mt-2 mb-24">
                    <Tab.Group>
                        <Tab.List
                            className={cn('z-[60] sticky top-0 bg-zinc-100 py-1 flex flex-row space-x-2',
                                searchValue === '' ? 'hidden' : '')}
                        >
                            <Tab
                                className="focus:outline-none ui-selected:font-semibold ui-selected:border-b-2 ui-selected:rounded-none ui-selected:border-b-black px-1 py-1"
                            >
                                最佳结果
                            </Tab>
                            <Tab
                                className="focus:outline-none ui-selected:font-semibold ui-selected:border-b-2 ui-selected:rounded-none ui-selected:border-b-black px-2 py-1"
                            >
                                单曲
                            </Tab>
                            <Tab
                                className="focus:outline-none ui-selected:font-semibold ui-selected:border-b-2 ui-selected:rounded-none ui-selected:border-b-black px-2 py-1"
                            >
                                歌手
                            </Tab>
                            <Tab
                                className="focus:outline-none ui-selected:font-semibold ui-selected:border-b-2 ui-selected:rounded-none ui-selected:border-b-black px-2 py-1"
                            >
                                MV
                            </Tab>
                            <Tab
                                className="focus:outline-none ui-selected:font-semibold ui-selected:border-b-2 ui-selected:rounded-none ui-selected:border-b-black px-2 py-1"
                            >
                                视频
                            </Tab>
                        </Tab.List>
                        <Tab.Panels>
                            <Tab.Panel>
                                <div className="columns-1 md:columns-2 sm:columns-2">
                                    {artistResults.slice(0, 3).map((artist) => (
                                        <motion.div
                                            key={artist.name}
                                            initial={{ opacity: 0, y: -50 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className='border-b'
                                        >
                                            <ArtistCard
                                                name={artist.name}
                                                artist={artist.alias}
                                                img={artist.picUrl}
                                                id={artist.id}
                                            />
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="columns-1 md:columns-2 sm:columns-2">

                                    {searchResults.map((song) => (
                                        <motion.div
                                            initial={{ opacity: 0, y: -50 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            key={song.id}
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

                                </div>
                            </Tab.Panel>
                            <Tab.Panel>
                                <div className="columns-1 md:columns-2 sm:columns-2">

                                    {searchResults.map((song) => (
                                        <motion.div
                                            initial={{ opacity: 0, y: -50 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            key={song.id}
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

                                </div>
                            </Tab.Panel>
                            <Tab.Panel>
                                <div className="columns-1 md:columns-2 sm:columns-2">
                                    {artistResults.map((artist) => (
                                        <motion.div
                                            key={artist.name}
                                            initial={{ opacity: 0, y: -50 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className='border-b'
                                        >
                                            <ArtistCard
                                                name={artist.name}
                                                artist={artist.alias}
                                                img={artist.picUrl}
                                                id={artist.id}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            </Tab.Panel>
                            <Tab.Panel>
                                <div className="columns-1 md:columns-2 sm:columns-2">
                                    {MVResults.map((mv) => (
                                        <motion.div
                                            key={mv.name}
                                            initial={{ opacity: 0, y: -50 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className='border-b'
                                        >
                                            <MVCard
                                                name={mv.name}
                                                time={mv.durationms}
                                                img={mv.cover}
                                                clicktime={mv.playCount}
                                                id={mv.id}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            </Tab.Panel>
                            <Tab.Panel>
                                <div className="columns-1 md:columns-2 sm:columns-2">
                                    {videoResults.map((video) => (
                                        <motion.div
                                            key={video.name}
                                            initial={{ opacity: 0, y: -50 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className='border-b'
                                        >
                                            <VideoCard
                                                name={video.title}
                                                time={video.durationms}
                                                img={video.coverUrl}
                                                clicktime={video.playTime}
                                                id={video.vid}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            </Tab.Panel>
                        </Tab.Panels>
                    </Tab.Group>

                </ul>



                <div className="max-w-4xl mx-auto w-full fixed bottom-0 inset-x-0 flex">
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

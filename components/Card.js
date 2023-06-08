import moment from 'moment'
import { useState, useEffect } from 'react';

function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function Card({ name, artist, time, onClick, data, id, key }) {
    const [songDetails, setSongDetails] = useState({});
    const [isHover, setIsHover] = useState(false);
    useEffect(() => {
        const fetchSongDetails = async () => {
            const response = await fetch(
                `http://cloud-music.pl-fe.cn/song/detail?ids=${id}`
            );
            const data = await response.json();
            const songData = {
                album: data.songs[0].al.name,
                coverUrl: data.songs[0].al.picUrl,
            };
            setSongDetails(songData);
        };
        fetchSongDetails();
    }, [id]);
    return (
        <button
            key={key}
            onClick={onClick}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            className="text-sm sm:text-base transition-all duration-300 px-2 border-b cursor-pointer flex flex-row justify-between w-full py-3"
        >
            <div className='flex flex-row space-x-6'>
                <div className="w-[15%]">
                    {isHover === true && (
                        <div className="absolute brightness-100 mt-2.5 ml-2.5 sm:mt-3.5 sm:ml-3.5 z-50">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="text-white transition-all duration-300 w-5 h-5">
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                        </div>
                    )}
                    <img
                        src={songDetails.coverUrl}
                        alt="Album cover"
                        className=
                        {cn('rounded-lg w-full h-full',
                            isHover === true ? 'brightness-50' : ''
                        )}
                    />
                </div>
                <div className="w-[85%] text-left flex flex-col overflow-x-auto">
                    <h1 className='overflow-x-auto font-semibold'>{name}</h1>
                    <p className="opacity-75 text-xs sm:text-sm">{artist}</p>
                </div>
            </div>
            <div className='ml-2 text-xs sm:text-sm mt-4 opacity-75'>
                {moment(time).format('mm:ss')}
            </div>
            <button onClick={()=>open(`https://music.163.com/song/media/outer/url?id=${id}.mp3`)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mt-3 ml-2 opacity-75 w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m-6 3.75l3 3m0 0l3-3m-3 3V1.5m6 9h.75a2.25 2.25 0 012.25 2.25v7.5a2.25 2.25 0 01-2.25 2.25h-7.5a2.25 2.25 0 01-2.25-2.25v-.75" />
                </svg>
            </button>
        </button>
    )
}

export async function getStaticProps() {
    const res = await fetch(`https://c233.eu.org/song/detail?ids=${id}`);
    const data = await res.json();

    return {
        props: {
            data,
        },
    };
}

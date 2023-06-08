import moment from 'moment'
import { useState, useEffect } from 'react';

function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function ArtistCard({ name, artist, time, onClick, img, id, key }) {
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
            onClick={onClick}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            className="text-sm sm:text-base transition-all duration-300 px-2 cursor-pointer flex flex-row justify-between w-full py-3"
        >
            <div className='flex flex-row space-x-6'>
                <div className="w-[15%]">
                    {isHover === true && (
                        <div className="absolute brightness-100 mt-2 ml-2 sm:mt-3.5 sm:ml-3.5 z-50">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="text-white transition-all duration-300 w-5 h-5">
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                        </div>
                    )}
                    <img
                        src={img}
                        alt="Album cover"
                        className=
                        {cn('rounded-lg w-full h-full',
                            isHover === true ? 'brightness-50' : ''
                        )}
                    />
                </div>
                <div className="w-[85%] text-left flex flex-col overflow-x-auto">
                    <h1 className='overflow-x-auto font-semibold'>{name}</h1>
                    <p className="opacity-75 text-xs sm:text-sm">{artist !== '' ? (<>{artist}</>) : (<>none</>)}</p>
                </div>
            </div>
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
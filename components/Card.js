import moment from 'moment'
import { useState, useEffect } from 'react';

export default function Card({ name, artist, time, onClick, data, id, key }) {
    const [songDetails, setSongDetails] = useState({});
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
            className="text-base sm:text-lg transition-all duration-300 cursor-pointer flex flex-row justify-between px-4 rounded-md w-full hover:bg-zinc-900 py-3"
        >
            <div className='flex flex-row space-x-6'>
                <div>
                    <img src={songDetails.coverUrl} alt="Album cover" className='rounded-md w-16 h-16' />
                </div>
                <div className="text-left flex flex-col overflow-x-auto space-y-1">
                    <h1 className='overflow-x-auto font-semibold'>{name}</h1>
                    <p className="opacity-75">{artist} -{songDetails.album}</p>
                </div>
            </div>
            <div className='ml-2 mt-4 font-medium opacity-75'>
                {moment(time).format('mm:ss')}
            </div>
        </button>
    )
}

export async function getStaticProps() {
    const res = await fetch(`http://cloud-music.pl-fe.cn/song/detail?ids=${id}`);
    const data = await res.json();

    return {
        props: {
            data,
        },
    };
}
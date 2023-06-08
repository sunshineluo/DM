import moment from 'moment'
import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react'

function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function VideoCard({ name, artist, time, clicktime, vi, onClick, img, id, key }) {
    let [isOpen, setIsOpen] = useState(true)
    const [playUrl, setPlayUrl] = useState('')

    function closeModal() {
        setIsOpen(false)
    }

    function openModal() {
        setIsOpen(true)
    }
    const [videoDetails, setVideoDetails] = useState({});
    const [isHover, setIsHover] = useState(false);
    useEffect(() => {
        const fetchSongDetails = async () => {
            const response = await fetch(
                `https://music.163.com/api/mv/detail?id=${id}`
            );
            const data = await response.json();
            const songData = {
                publishTime: data.data.cover.publishTime,
                url: data.data.brs['1080'],
            };
            setVideoDetails(songData);
            setPlayUrl(songData);
        };
        fetchSongDetails();
    }, [id]);
    return (
        <div>
            <button
                onClick={onClick}
                onMouseEnter={() => setIsHover(true)}
                onMouseLeave={() => setIsHover(false)}
                className="text-sm sm:text-base transition-all duration-300 px-2 border-b cursor-pointer flex flex-col w-full py-3"
            >
                <div className='flex flex-col'>
                    <div className="w-full">
                        {isHover === true && (
                            <div className="absolute brightness-100 mt-2.5 ml-2.5 sm:mt-3.5 sm:ml-3.5 z-50">
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
                    <div className="mt-2 w-full text-left flex flex-col overflow-x-auto">
                        <h1 className='overflow-x-auto font-semibold'>{name}</h1>
                        <p className="opacity-75 text-xs sm:text-sm">{artist}</p>
                    </div>
                </div>
                <div className='flex flex-row space-x-2'>
                    <div className='text-xs sm:text-sm mt-2 opacity-75'>
                        发布于{moment(videoDetails.publishTime).format('YYYY年MM月DD日')}
                    </div>
                    <div className='text-xs sm:text-sm mt-2 opacity-75'>
                        {clicktime}次播放
                    </div>
                    <div className='ml-2 text-xs sm:text-sm mt-2 opacity-75'>
                        时长{moment(time).format('mm:ss')}
                    </div>
                </div>
            </button>
        </div>
    )
}
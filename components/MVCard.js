import moment from 'moment'
import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react'

function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function MVCard({ name, artist, time, clicktime, vi, onClick, img, id, key }) {
    let [isOpen, setIsOpen] = useState(false)
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
        const fetchMVDetails = async () => {
            const response = await fetch(
                `https://cf233.eu.org/mv/url?r=1080&id=${id}`
            );
            const mdata = await response.json();
            const MVData = {
                url: mdata.data.url,
            };
            setPlayUrl(MVData);
        };
        fetchMVDetails();
    }, [id]);
    return (
        <div>
            <button
                onClick={openModal}
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
                        {clicktime}次播放
                    </div>
                    <div className='ml-2 text-xs sm:text-sm mt-2 opacity-75'>
                        时长{moment(time).format('mm:ss')}
                    </div>
                </div>
            </button>
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-[99999]" onClose={closeModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black backdrop-blur-lg bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="overflow-y-auto z-[999999] w-full max-w-4xl transform overflow-hidden bg-zinc-100 h-screen rounded-none sm:rounded-lg p-6 text-left align-middle transition-all">
                                    <div className='opacity-75 text-xs sm:text-sm flex justify-end sm:justify-between mt-0.5 mb-2'>
                                        <div className='hidden sm:flex flex-row space-x-2 px-2 py-1'>
                                            <h1 className='overflow-x-auto font-semibold'>正在播放:{name}</h1>
                                            <p className="opacity-75 text-xs sm:text-sm">{artist}</p>
                                            <div className='text-xs sm:text-sm opacity-75'>
                                                {clicktime}次播放
                                            </div>
                                            <div className='ml-2 text-xs sm:text-sm opacity-75'>
                                                时长{moment(time).format('mm:ss')}
                                            </div>
                                        </div>
                                        <button
                                            onClick={closeModal}
                                            className='flex rounded-lg bg-zinc-200 px-2 py-1'>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mt-0 sm:mt-0.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className='text-xs sm:text-sm'>关闭视频</span>
                                        </button>
                                    </div>
                                    <video src={playUrl.url} className="w-full rounded-lg" autoplay="true" controls />
                                    <div className='text-xs mt-2 sm:text-sm sm:hidden flex flex-col space-x-2 px-2 py-1'>
                                        <h1 className='overflow-x-auto'>
                                            <span className='font-medium mr-2'>{name}</span>
                                            {clicktime}次播放
                                            时长{moment(time).format('mm:ss')}
                                        </h1>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    )
}
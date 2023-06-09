import moment from 'moment'
import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react'

function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function ArtistCard({ name, artist, time, onClick, img, id, key }) {
    const [artistDetails, setArtistDetails] = useState({});
    const [isHover, setIsHover] = useState(false);
    let [isOpen, setIsOpen] = useState(false)

    function closeModal() {
        setIsOpen(false)
    }

    function openModal() {
        setIsOpen(true)
    }
    useEffect(() => {
        const fetchArtistDetails = async () => {
            const response = await fetch(
                `https://cf233.eu.org/artist/detail?id=${id}`
            );
            const data = await response.json();
            const artistData = {
                name: data.data.artist.name,
                transname: data.data.artist.transname,
                desc: data.data.artist.briefDesc,
                coverUrl: data.data.artist.cover,
            };
            setArtistDetails(artistData);
        };
        fetchArtistDetails();
    }, [id]);
    return (
        <div>
            <button
                onClick={openModal}
                onMouseEnter={() => setIsHover(true)}
                onMouseLeave={() => setIsHover(false)}
                className="text-sm sm:text-base transition-all duration-300 px-2 cursor-pointer flex flex-row justify-between w-full py-3"
            >
                <div className='flex flex-row space-x-6'>
                    <div className="w-[15%]">
                        {isHover === true && (
                            <div className="absolute brightness-100 mt-2 ml-3 sm:mt-3.5 sm:ml-5 z-50">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="text-white w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
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
                    <div className="w-[85%] text-left flex flex-row space-x-1.5 mt-2 overflow-x-auto">
                        <h1 className='overflow-x-auto font-semibold'>{name}</h1>
                        <p className="opacity-75 text-xs sm:text-sm mt-0.5">{artist}</p>
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
                                    <div className='opacity-75 text-xs sm:text-sm flex justify-between mt-0.5 mb-2'>
                                        <div className='flex flex-row space-x-2 px-2 py-1'>
                                            <h1 className='overflow-x-auto font-semibold'>{artistDetails.name} {``} {artistDetails.transname}</h1>
                                        </div>
                                        <button
                                            onClick={closeModal}
                                            className='flex rounded-lg bg-zinc-200 px-2 py-1'>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mt-0 sm:mt-0.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className='text-xs sm:text-sm'>关闭歌手简介</span>
                                        </button>
                                    </div>
                                    <p className='px-2 py-1 my-2 text-xs sm:text-sm opacity-75'>
                                        {artistDetails.desc}
                                    </p>
                                    <img src={artistDetails.coverUrl} className='w-full rounded-lg' />

                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
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
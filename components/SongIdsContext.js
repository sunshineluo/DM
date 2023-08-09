import React, { createContext, useState, useEffect } from "react";

export const SongIdsContext = createContext();

export const SongIdsProvider = ({ children }) => {
    const initialSongIds = [
        "1321998668",
        "496869422",
        "443860",
        "4010229",
        "1377372517",
        "17423737",
        "441120082",
        "1410490086",
        "4010198",
        "1352247646",
        "2020818962",
    ];
    const [songIds, setSongIds] = useState(
        JSON.parse(localStorage.getItem("songIds")) || initialSongIds
    );
    const [currentSongIndex, setCurrentSongIndex] = useState(
        parseInt(localStorage.getItem("currentSongIndex"), 10) || 0
    );

    const addToPlaylist = (trackId) => {
        const index = songIds.findIndex((id) => id === trackId);
        if (index !== -1) {
            // 替换重复的歌曲ID
            const updatedSongIds = [...songIds];
            updatedSongIds[index] = trackId;
            setSongIds(updatedSongIds);
            setCurrentSongIndex(index); // 设置当前索引为替换的歌曲索引
        } else {
            // 添加新的歌曲ID
            setSongIds([...songIds, trackId]);
            setCurrentSongIndex(songIds.length); // 设置当前索引为新添加的歌曲索引
        }
    };

    const removeFromPlaylist = (trackId) => {
        const updatedSongIds = songIds.filter((id) => id !== trackId);
        setSongIds(updatedSongIds);
    };

    useEffect(() => {
        localStorage.setItem("songIds", JSON.stringify(songIds));
    }, [songIds]);

    useEffect(() => {
        localStorage.setItem("currentSongIndex", currentSongIndex.toString());
    }, [currentSongIndex]);

    const getAllSongIds = () => {
        return songIds;
    };

    return (
        <SongIdsContext.Provider
            value={{
                songIds,
                addToPlaylist,
                removeFromPlaylist,
                currentSongIndex,
                setCurrentSongIndex,
                getAllSongIds,
            }}
        >
            {children}
        </SongIdsContext.Provider>
    );
};
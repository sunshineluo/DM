import React, { createContext, useState, useEffect } from "react";

export const SongIdsContext = createContext();

export const SongIdsProvider = ({ children }) => {
  const initialSongIds = [];
  const [songIds, setSongIds] = useState(
    JSON.parse(localStorage.getItem("songIds")) || initialSongIds
  );
  const [isPlaying, setIsPlaying] = useState(false); // 新增 isPlaying 状态
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
      setIsPlaying(true);
    } else {
      // 添加新的歌曲ID
      setSongIds([...songIds, trackId]);
      setCurrentSongIndex(songIds.length); // 将当前索引切换到新添加的歌曲索引
      setIsPlaying(true);
    }
  };

  const addAllToPlaylist = (trackIds) => {
    setSongIds([...songIds, ...trackIds]);
    setCurrentSongIndex(songIds.length); // 设置当前索引为播放列表中的最后一首歌曲
    setIsPlaying(true);
  };

  const removeFromPlaylist = (trackId) => {
    const updatedSongIds = songIds.filter((id) => id !== trackId);

    // 检查被移除的歌曲是否为当前正在播放的歌曲
    if (currentSongIndex > updatedSongIds.length - 1) {
      setCurrentSongIndex(0); // 更新为第一首歌曲的索引
    } else {
      setCurrentSongIndex(currentSongIndex); // 保持当前索引不变
    }

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

  const removeAllFromPlaylist = () => {
    setSongIds([]);
    setCurrentSongIndex(0);
  };

  useEffect(() => {
    const storedIsPlaying = localStorage.getItem("isPlaying");
    setIsPlaying(storedIsPlaying ? JSON.parse(storedIsPlaying) : false);
  }, []);

  useEffect(() => {
    localStorage.setItem("isPlaying", JSON.stringify(isPlaying));
  }, [isPlaying]);

  return (
    <SongIdsContext.Provider
      value={{
        songIds,
        addToPlaylist,
        removeFromPlaylist,
        currentSongIndex,
        setCurrentSongIndex,
        getAllSongIds,
        addAllToPlaylist,
        removeAllFromPlaylist,
        isPlaying, // 将 isPlaying 添加到上下文值中
        setIsPlaying, // 将 setIsPlaying 添加到上下文值中
      }}
    >
      {children}
    </SongIdsContext.Provider>
  );
};

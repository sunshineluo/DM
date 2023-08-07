import { useState, useEffect } from "react";

export default function Dashboard() {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    // 从本地存储中获取用户信息
    const storedUserInfo = localStorage.getItem("userInfo");
    if (storedUserInfo) {
      const parsedUserInfo = JSON.parse(storedUserInfo);
      setUserInfo(parsedUserInfo);
    }
  }, []);
  return (
    <div className="max-w-6xl mx-auto px-6 py-24">
      <h1 className="font-semibold text-4xl md:text-5xl sm:text-6xl">
        {userInfo ? (
          <div>
            <h2>用户信息</h2>
            <p>用户名：{userInfo.username}</p>
            <p>邮箱：{userInfo.email}</p>
            {/* 其他用户信息的展示 */}
          </div>
        ) : (
          <p>用户未登录</p>
        )}
      </h1>
    </div>
  );
}

import axios from "axios";
import { useEffect, useState } from "react";

export default function QrLogin() {
  async function checkStatus(key) {
    const res = await axios({
      url: `https://cf233.eu.org/login/qr/check?key=${key}&timerstamp=${Date.now()}`,
      withCredentials: true, // 关键
    });
    return res.data;
  }

  async function getLoginStatus() {
    const res = await axios({
      url: `https://cf233.eu.org/login/status?timerstamp=${Date.now()}`,
      withCredentials: true,
    });

    localStorage.setItem("userData", JSON.stringify(res.data, null, 2));

    document.querySelector("#info").innerText = JSON.stringify(
      res.data,
      null,
      2
    );
  }

  async function login() {
    let timer;
    let timestamp = Date.now();
    await getLoginStatus();
    const res = await axios({
      url: `https://cf233.eu.org/login/qr/key?timerstamp=${Date.now()}`,
      withCredentials: true, // 关键
    });
    const key = res.data.data.unikey;
    const res2 = await axios({
      url: `https://cf233.eu.org/login/qr/create?key=${key}&qrimg=true&timerstamp=${Date.now()}`,
      withCredentials: true, // 关键
    });
    document.querySelector("#qrImg").src = res2.data.data.qrimg;

    timer = setInterval(async () => {
      const statusRes = await checkStatus(key);
      if (statusRes.code === 800) {
        alert("二维码已过期，请重新获取");
        clearInterval(timer);
      }
      if (statusRes.code === 803) {
        clearInterval(timer);
        alert("授权登录成功");
        await getLoginStatus();
      }
    }, 3000);
  }

  login();

  const getUserInfo = async () => {
    try {
      const response = await axios.get(
        "https://cf233.eu.org/user/detail?uid=32953014"
      );
      const { data } = response;
      const userInfo = data.data;

      // 处理用户信息
      console.log(userInfo);
    } catch (error) {
      console.error("Failed to get user info", error);
    }
  };

  return (
    <div>
      <img id="qrImg" />
      <div id="info" class="info"></div>
    </div>
  );
}

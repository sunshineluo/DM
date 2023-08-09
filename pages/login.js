import axios from "axios";
import { useEffect } from "react";

export default function QrLogin() {
  useEffect(() => {
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
          getLoginStatus();
        }
      }, 3000);
    }

    login();
  }, []);

  return (
    <div className="max-w-4xl px-6 mx-auto">
      <img id="qrImg" />
      <div id="info" className="info"></div>
    </div>
  );
}

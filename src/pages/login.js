import axios from "axios";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function QrLogin() {
  const router = useRouter();
  async function checkStatus(key) {
    const res = await axios({
      url: `https://cf233.eu.org/login/qr/check?key=${key}&timestamp=${Date.now()}&noCookie=true`,
    });
    return res.data;
  }

  async function getLoginStatus(cookie = "") {
    const res = await axios({
      url: `https://cf233.eu.org/login/status?timestamp=${Date.now()}`,
      method: "post",
      data: {
        cookie,
      },
    });
    document.querySelector("#info").innerText = JSON.stringify(
      res.data,
      null,
      2
    );
    return res.data; // 返回获取的用户数据
  }

  async function login() {
    let timer;
    let timestamp = Date.now();
    const cookie = localStorage.getItem("cookie");
    await getLoginStatus(cookie);
    const res = await axios({
      url: `https://cf233.eu.org/login/qr/key?timestamp=${Date.now()}`,
    });
    const key = res.data.data.unikey;
    const res2 = await axios({
      url: `https://cf233.eu.org/login/qr/create?key=${key}&qrimg=true&timestamp=${Date.now()}`,
    });
    document.querySelector("#qrImg").src = res2.data.data.qrimg;

    timer = setInterval(async () => {
      const statusRes = await checkStatus(key);
      if (statusRes.code === 800) {
        clearInterval(timer);
      }
      if (statusRes.code === 803) {
        clearInterval(timer);
        alert("授权登录成功");
        const userData = await getLoginStatus(statusRes.cookie);
        localStorage.setItem("cookie", statusRes.cookie);
        localStorage.setItem("userData", JSON.stringify(userData));
        router.push("/dashboard");
      }
    }, 3000);
  }

  useEffect(() => {
    login();
  }, []);

  return (
    <div className="max-w-7xl px-6 py-8 mx-auto">
      <Head>
        <title>扫描二维码登录</title>
      </Head>
      <h1 className="font-semibold text-3xl md:text-4xl sm:text-5xl text-center">
        扫描二维码登录
      </h1>
      <img id="qrImg" className="rounded-xl border-2 border-red-600 mx-auto w-2/3 md:w-1/3 sm:w-1/3 mt-12" />

      <p className="text-center opacity-75 mt-6">请打开网易云音乐APP扫码登录</p>
      <p
        onClick={() => router.push("/dashboard")}
        className="mt-4 text-sm text-red-600 text-center cursor-pointer"
      >
        已经登录？点我跳转
      </p>
      <div className="hidden max-w-lg mx-auto bg-neutral-200 dark:bg-neutral-800 mt-6 overflow-x-auto">
        <p className="opacity-75 font-mono text-center mb-4">console.log ↓</p>
        <div id="info" className="info font-mono "></div>
      </div>
    </div>
  );
}

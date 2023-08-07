import React, { useState, useEffect } from "react";
import axios from "axios";

const Login = () => {
    const [loginType, setLoginType] = useState('qrCode');
    const [phoneEmail, setPhoneEmail] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [qrCodeKey, setQrCodeKey] = useState('');
    const [pollingTimer, setPollingTimer] = useState(null);
    const [isLoginCompleted, setIsLoginCompleted] = useState(false);
    const [qrCodeInfo, setQrCodeInfo] = useState('');
    const [password, setPassword] = useState('');
  
    useEffect(() => {
      if (isLoginCompleted) {
        // 处理登录成功后的逻辑
        console.log('登录成功');
  
        // 获取用户信息并存储到本地
        getUserInfo();
      }
    }, [isLoginCompleted]);
  
    useEffect(() => {
      const handleLogin = async () => {
        try {
          const response = await axios.get(
            `https://cf233.eu.org/login/qr/key?timestamp=${Date.now()}`
          );
  
          if (response.data.code === 200) {
            const qrCodeKey = response.data.data.unikey;
            setQrCodeKey(qrCodeKey);
  
            generateQRCode(qrCodeKey);
            startPollingLoginStatus(qrCodeKey);
  
            if (response.data.code === 200) {
              setIsLoginCompleted(true);
              console.log('登录成功');
  
              // 存储登录信息到本地存储
              localStorage.setItem('isLoggedInQRCode', 'true');
              // 可以根据需要存储其他相关用户信息
            }
          }
        } catch (error) {
          console.error(error);
        }
      };
  
      handleLogin();
    }, []); // 空数组作为第二个参数，表示只在首次渲染时执行
  
    const generateQRCode = async (key) => {
      const qrCodeUrl = `https://cf233.eu.org/login/qr/create?key=${key}&timestamp=${Date.now()}&qrimg=true`;
      try {
        const response = await axios.get(qrCodeUrl);
        if (response.data.code === 200) {
          const qrCodeInfo = response.data.data.qrimg;
          setQrCodeInfo(qrCodeInfo);
        }
      } catch (error) {
        console.error(error);
      }
    };
  
    const startPollingLoginStatus = (key) => {
      const timer = setInterval(async () => {
        await checkLoginStatus(key);
      }, 5000);
  
      setPollingTimer(timer);
    };
  
    const stopPollingLoginStatus = () => {
      clearInterval(pollingTimer);
    };
  
    const checkLoginStatus = async (key) => {
      try {
        const response = await axios.get(
          `https://cf233.eu.org/login/qr/check?key=${key}&timestamp=${Date.now()}`
        );
  
        console.log(response.data);
  
        if (response.data.code === 200) {
          const { status, cookies } = response.data.data;
  
          if (status === 801) {
            console.log('等待扫码...');
          } else if (status === 802) {
            console.log('扫码成功，等待确认...');
          } else if (status === 803) {
            setIsLoginCompleted(true);
            stopPollingLoginStatus();
            console.log('登录成功');
            console.log('cookies:', cookies);
          } else if (status === 800) {
            console.log('二维码已过期');
            stopPollingLoginStatus();
          }
        }
      } catch (error) {
        console.error(error);
      }
    };
  
    const handlePhoneEmailLogin = async () => {
      try {
        const response = await axios.post(
          `https://cf233.eu.org/login/cellphone?phone=${phoneEmail}&password=${password}`
        );
  
        if (response.data.code === 200) {
          setIsLoginCompleted(true);
          console.log('登录成功');
  
          // 获取用户信息并存储到本地
          getUserInfo();
        } else {
          console.log('登录失败');
          // 处理登录失败的逻辑
        }
      } catch (error) {
        console.error(error);
      }
    };
  
    const handleSwitchLoginType = () => {
      setLoginType((prevType) =>
        prevType === 'phoneEmail' ? 'qrCode' : 'qrCode'
      );
    };
  
    const getUserInfo = async () => {
        try {
            const response = await axios.get('https://cf233.eu.org/user/subcount');
        
            if (response.data.code === 200) {
              const { playlistCount, artistCount, mvCount, djRadioCount } = response.data;
              console.log('歌单数量:', playlistCount);
              console.log('收藏数量:', artistCount);
              console.log('MV数量:', mvCount);
              console.log('DJ数量:', djRadioCount);
            }
          } catch (error) {
            console.error(error);
          }
    };

  return (
    <div className="max-w-xl mx-auto px-6 py-16 text-neutral-700">
      <h1 className="font-semibold text-center text-3xl md:text-4xl sm:text-5xl">
        登录网易云音乐
      </h1>

      <div className="flex flex-col mt-16 space-y-8">
        {loginType === "phoneEmail" ? (
          <>
            <input
              type="text"
              value={phoneEmail}
              onChange={(e) => setPhoneEmail(e.target.value)}
              placeholder="请输入大陆手机号"
              className="rounded-xl px-4 py-4 text-xl bg-neutral-100 border-2"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="密码"
              className="rounded-xl px-4 py-4 text-xl bg-neutral-100 border-2"
            />
            <button
              onClick={handlePhoneEmailLogin}
              className="rounded-xl px-4 py-4 text-center text-xl bg-neutral-700 text-white"
            >
              登录
            </button>
          </>
        ) : (
          <div>
            {" "}
            <div className="rounded-xl bg-neutral-200 py-16">
              {qrCodeInfo ? (
                <>
                  <img
                    src={qrCodeInfo}
                    alt="二维码"
                    className="rounded-xl w-5/6 md:w-2/3 sm:w-1/2 mx-auto"
                  />
                  {!isLoginCompleted && (
                    <p className="text-xl px-12 text-center mt-12 text-neutral-500">
                      请通过网易云音乐APP扫描二维码进行登录
                    </p>
                  )}
                  {isLoginCompleted && (
                    <p className="text-xl px-12 text-center mt-12 text-neutral-500">
                      退出登录(不可用)
                    </p>
                  )}
                </>
              ) : (
                <p className="text-xl text-center font-semibold mt-6">
                  正在加载二维码...
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;

import { useRouter } from "next/router";

export default function IsNotLogin() {
  const router = useRouter();
  return (
    <div className="max-w-2xl mx-auto px-6 md:px-0 sm:px-0">
      <h1 className="font-semibold text-3xl md:text-4xl sm:text-5xl leading-snug">
        <span>大千世界，色彩纷呈。</span>
        使用云音乐登录以体验完整的
        <span className="text-red-600">DM</span>
        {""} Music
      </h1>

      <h1 className="mt-12 font-semibold text-3xl md:text-4xl sm:text-5xl leading-snug">
        这是一个<span className="text-red-600">开源</span>的播放器。
        <span className="text-red-600">DM is NOT a music company.</span>
        DM并不是一家音乐公司，甚至于这不是一家公司。
      </h1>

      <h1 className="mt-12 font-semibold text-3xl md:text-4xl sm:text-5xl leading-snug">
        我们相信
        <span className="text-red-600">美好的事情即将发生。</span>
      </h1>

      <button
        onClick={() => router.push("/login")}
        className="underline underline-offset-8 mt-12 font-semibold text-3xl md:text-4xl sm:text-5xl leading-snug text-red-600"
      >
        跳转到登录页面
      </button>
    </div>
  );
}

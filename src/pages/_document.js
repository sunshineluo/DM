import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="zh">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <meta
          http-equiv="Content-Security-Policy"
          content="upgrade-insecure-requests"
        />

        {process.env.NODE_ENV === "production" && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.register('/sw.js').then(function(registration) {
            console.log('Service Worker 注册成功:', registration);
          }).catch(function(error) {
            console.log('Service Worker 注册失败:', error);
          });
        }
        `,
            }}
          />
        )}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

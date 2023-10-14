const { app, BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');

function createWindow() {
  // 创建浏览器窗口
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
  });

  // 加载本地静态网页
  const indexPath = isDev ? 'https://www.luoyangapi.top/' : `file://${path.join(__dirname, '.next/index.html')}`;
  mainWindow.loadURL(indexPath);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

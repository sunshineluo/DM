const { createProxyMiddleware } = require('http-proxy-middleware');

const proxy = createProxyMiddleware({
  target: 'https://cf233.eu.org/', // 设置要代理的目标地址
  changeOrigin: true, // 改变请求头中的 Origin 字段为目标地址
});

module.exports = (req, res) => {
  // 对所有请求应用代理中间件
  proxy(req, res);
};

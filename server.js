const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use('/api', createProxyMiddleware({
  target: 'https://neotest-701e1c076af2.herokuapp.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '', // /api yolunu kaldırın
  },
}));

app.listen(3000, () => {
  console.log('Proxy server is running on http://localhost:3000');
});

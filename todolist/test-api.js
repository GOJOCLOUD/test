const http = require('http');

// 测试获取所有页面
http.get('http://localhost:3001/api/pages', (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('获取所有页面:', JSON.parse(data));
  });
}).on('error', (err) => {
  console.error('获取所有页面失败:', err);
});

// 测试创建新页面
const postData = JSON.stringify({
  name: '测试页面',
  components: [],
  scale: 1
});

const postOptions = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/pages',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const postReq = http.request(postOptions, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('创建新页面:', JSON.parse(data));
  });
});

postReq.on('error', (err) => {
  console.error('创建新页面失败:', err);
});

postReq.write(postData);
postReq.end();
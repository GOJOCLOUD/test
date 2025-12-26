const glmService = require('./services/glm');

async function testGLMAPI() {
  try {
    console.log('开始测试GLM API...');
    
    const apiKey = 'c8b50bb7e7d342edb66b293636342059.VpGbzEj6uamxt01l';
    const prompt = '请简单介绍一下React框架';
    
    console.log('发送请求到GLM API...');
    const result = await glmService.call(apiKey, prompt);
    
    console.log('GLM API调用成功！');
    console.log('响应内容:', result);
  } catch (error) {
    console.error('GLM API调用失败:', error.message);
    console.error('完整错误信息:', error);
  }
}

testGLMAPI();
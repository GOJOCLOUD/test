const axios = require('axios');

// 测试转译API
async function testTranslationAPI() {
  try {
    console.log('测试转译API...');
    
    const response = await axios.post('http://localhost:3001/api/translation/translate', {
      inputText: '我想做一个按钮，点了以后能保存数据，如果没网了要提示用户。',
      mode: 'normal'
    });
    
    console.log('API响应成功:');
    console.log(response.data);
    
    if (response.data.success) {
      console.log('\n转译结果:');
      console.log(response.data.data);
    }
  } catch (error) {
    console.error('测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

testTranslationAPI();
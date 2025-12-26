const dotenv = require('dotenv');

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads'; // 修改默认值为'./uploads'

module.exports = {
  OPENAI_API_KEY,
  PORT,
  UPLOAD_DIR
};
/* 文件位置: frontend/src/services/api.js */
import axios from 'axios';

// 使用环境变量中的API URL，默认为本地开发服务器
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL,
    timeout: 10 * 60 * 1000, // 10分钟超时
    headers: {
        'Content-Type': 'application/json'
    }
});

// 文档转换API - 更新为接受文件、输出路径和格式选项
export const uploadWord = (file, outputPath) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('outputPath', outputPath);
    
    return api.post('/convert/word', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

export const uploadPDF = (file, outputPath) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('outputPath', outputPath);
    
    return api.post('/convert/pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

// 批量文档转换API
export const batchUploadWord = (files, outputPath) => {
    const formData = new FormData();
    
    // 添加多个文件
    files.forEach(file => {
        formData.append('files', file);
    });
    
    formData.append('outputPath', outputPath);
    
    return api.post('/convert/batch/word', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

export const batchUploadPDF = (files, outputPath) => {
    const formData = new FormData();
    
    // 添加多个文件
    files.forEach(file => {
        formData.append('files', file);
    });
    
    formData.append('outputPath', outputPath);
    
    return api.post('/convert/batch/pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};



// 旧API，保留以兼容
export const convertDoc = (formData) => api.post('/convert/to-txt', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});



export const checkLicense = (code) => api.post('/license/verify', { code });

export default api;
<template>
  <div class="ppt-tool-container">
    <div class="back-button" @click="goBack">
      ← 返回工具箱
    </div>
    <div class="three-column-layout">
      <div class="column left-column">
        <h2 class="section-title">免费版</h2>
        <div class="divider"></div>
        <div class="left-content">
          <h3 class="sub-title">框架生成</h3>
          <div class="buttons-container">
            <a href="https://www.deepseek.com/" target="_blank" class="deepseek-btn">
              <svg class="deepseek-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span>使用DeepSeek生成框架</span>
            </a>
            <a href="https://www.kimi.com/zh/" target="_blank" class="kimi-btn">
              <svg class="kimi-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span>使用Kimi生成框架</span>
            </a>
            <a href="https://www.doubao.com/chat/" target="_blank" class="doubao-btn">
              <svg class="doubao-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span>使用豆包生成框架</span>
            </a>
            <a href="https://www.tongyi.com/?code=sw31xf0id8&bd_vid=8223742068526532286" target="_blank" class="tongyi-btn">
              <svg class="tongyi-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span>使用通义生成框架</span>
            </a>
            <a href="https://yiyan.baidu.com/" target="_blank" class="wenxin-btn">
              <svg class="wenxin-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span>使用文心一言生成框架</span>
            </a>
          </div>
        </div>
        <div class="right-content">
          <h3 class="sub-title">PPT落地</h3>
          <div class="buttons-container">
            <a href="https://www.kimi.com/kimiplus/slides" target="_blank" class="kimi-slides-btn">
              <svg class="kimi-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span>使用Kimi生成PPT</span>
            </a>
            <a href="https://www.tongyi.com/aippt" target="_blank" class="tongyi-ppt-btn">
              <svg class="tongyi-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span>使用通义生成PPT</span>
            </a>
            <a href="https://space.coze.cn/?from=landingpage&utm_campaign=0000&utm_content=home&utm_id=0&utm_medium=sem&utm_source=bing_pz&utm_source_platform=pc&utm_term=coze_bing_pz_pc_czkj_beijing&category=7548452679341801481&skill=ppt" target="_blank" class="coze-ppt-btn">
              <svg class="coze-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span>使用Coze生成PPT</span>
            </a>
          </div>
        </div>
      </div>
      <div class="column right-column">
        <h2 class="section-title">付费版 <span class="trial-note">（可免费试用，下载需付费）</span></h2>
        <div class="paid-content">
          <h3 class="sub-title">专业PPT生成</h3>
          <div class="buttons-container">
            <a href="https://modao.cc/usergrowth/aippt?utm_channel=SEM&utm_source=baidu&utm_medium=mdAIPPT&utm_term_space=%E5%93%81%E7%89%8C&utm_term=pp&utm_keyword=%E5%A2%A8%E5%88%80ai%20ppt&bd_vid=8410018507003144500" target="_blank" class="modao-btn">
              <svg class="modao-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span>使用墨刀AI生成PPT</span>
            </a>
            <a href="https://pptgo.cn/?utm_source=baidu&utm_medium=aippt%E5%B7%A5%E5%85%B7%E8%BD%AF%E4%BB%B6&utm_term=aippt%E5%B7%A5%E5%85%B7&utm_content=ppt%20ai&utm_campaign=bm05&bd_vid=8650367685419783461" target="_blank" class="pptgo-btn">
              <svg class="pptgo-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
              <span>使用博思AI生成PPT</span>
            </a>
            <a href="https://wenku.baidu.com/ndlaunch/browse/chat?fr=launch_ad&utm_source=gdtss-WD&utm_medium=cpc&keyword=%E8%BD%BB%E7%AB%B9%E5%8A%9E%E5%85%ACppt&utm_account=SS-gdttg02&qz_gdt=nqlry2iyaaahbgp7spwa" target="_blank" class="wenku-btn">
              <svg class="wenku-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10,10H12V12H10V10M10,14H12V16H10V14M14,10H16V12H14V10M14,14H16V16H14V14Z"/>
              </svg>
              <span>使用百度文库生成PPT</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PPTTool',
  methods: {
    goBack() {
      this.$router.push('/student');
    }
  }
}
</script>

<style scoped>
.ppt-tool-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.back-button {
  padding: 10px 20px;
  cursor: pointer;
  color: #333;
  font-size: 16px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 6px;
  width: fit-content;
  transition: all 0.2s;
  margin: 20px;
  display: inline-flex;
  align-items: center;
}

.back-button:hover {
  background-color: #e9e9e9;
  border-color: #bbb;
  color: #333;
}

.three-column-layout {
  display: flex;
  flex: 1;
  width: 100%;
  padding: 0 20px 20px;
}

.column {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 20px;
}

.left-column {
  flex: 2; /* 占据2份 */
  margin-right: 20px;
  position: relative;
}

.right-column {
  flex: 1; /* 占据1份 */
  position: relative;
}

.right-column .section-title {
  margin-bottom: 20px; /* 与免费版一致的间距 */
}

.right-column .paid-content {
  position: absolute;
  width: 100%;
  top: 15%; /* 与免费版的left-content和right-content对齐 */
  text-align: center;
}

.right-column .buttons-container {
  gap: 20px; /* 与免费版一致的按钮间隔 */
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-top: 0;
  margin-bottom: 20px;
  text-align: left;
}

.trial-note {
  font-size: 16px;
  font-weight: 400;
  color: #666;
}

.divider {
  width: 2px;
  height: 60%;
  background-color: #ccc;
  margin: 0 auto;
  position: absolute;
  top: 20%;
  left: 50%;
}

.left-content {
  position: absolute;
  width: 45%;
  left: 2.5%;
  top: 15%;
  text-align: center;
}

.right-content {
  position: absolute;
  width: 45%;
  right: 2.5%;
  top: 15%;
  text-align: center;
}

.sub-title {
  font-size: 18px;
  font-weight: 500;
  color: #555;
  margin-top: 20px;
  margin-bottom: 30px;
}

.buttons-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

.deepseek-btn {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  background-color: #4a6cf7;
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  width: 200px;
  transition: all 0.3s ease;
}

.deepseek-btn:hover {
  background-color: #3a5ce5;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(74, 108, 247, 0.3);
}

.deepseek-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
}

.kimi-btn {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  background-color: #ff7f00;
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  width: 200px;
  transition: all 0.3s ease;
}

.kimi-btn:hover {
  background-color: #e67300;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255, 127, 0, 0.3);
}

.kimi-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
}

.doubao-btn {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  background-color: #87CEEB;
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  width: 200px;
  transition: all 0.3s ease;
}

.doubao-btn:hover {
  background-color: #6BB6D6;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(135, 206, 235, 0.3);
}

.doubao-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
}

.tongyi-btn {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  background-color: #E6E6FA;
  color: #333;
  padding: 10px 20px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  width: 200px;
  transition: all 0.3s ease;
}

.tongyi-btn:hover {
  background-color: #D8D8F0;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(230, 230, 250, 0.5);
}

.tongyi-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
}

.wenxin-btn {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  background-color: #ffffff;
  color: #333;
  border: 1px solid #ddd;
  padding: 10px 20px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  width: 200px;
  transition: all 0.3s ease;
}

.wenxin-btn:hover {
  background-color: #f5f5f5;
  border-color: #bbb;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.wenxin-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
}

.kimi-slides-btn {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  background-color: #ff7f00;
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  width: 200px;
  transition: all 0.3s ease;
}

.kimi-slides-btn:hover {
  background-color: #e67300;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255, 127, 0, 0.3);
}

.tongyi-ppt-btn {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  background-color: #E6E6FA;
  color: #333;
  padding: 10px 20px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  width: 200px;
  transition: all 0.3s ease;
}

.tongyi-ppt-btn:hover {
  background-color: #D8D8F0;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(230, 230, 250, 0.5);
}

.coze-ppt-btn {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  background-color: #6B46C1;
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  width: 200px;
  transition: all 0.3s ease;
}

.coze-ppt-btn:hover {
  background-color: #553A9A;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(107, 70, 193, 0.3);
}

.coze-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
}

.paid-content {
  position: relative;
  width: 100%;
  text-align: center;
}

.modao-btn {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  background-color: #8B0000; /* 深红色 */
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  width: 200px;
  transition: all 0.3s ease;
}

.modao-btn:hover {
  background-color: #660000; /* 悬停时更深的红色 */
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(139, 0, 0, 0.4);
}

.modao-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
}

.pptgo-btn {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  background-color: #FFB366; /* 浅橙色 */
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  width: 200px;
  transition: all 0.3s ease;
}

.pptgo-btn:hover {
  background-color: #FF9933; /* 悬停时更深的橙色 */
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255, 179, 102, 0.4);
}

.pptgo-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
}

.wenku-btn {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  background-color: #228B22; /* 绿色 */
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  width: 200px;
  transition: all 0.3s ease;
}

.wenku-btn:hover {
  background-color: #006400; /* 悬停时更深的绿色 */
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(34, 139, 34, 0.4);
}

.wenku-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
}
</style>
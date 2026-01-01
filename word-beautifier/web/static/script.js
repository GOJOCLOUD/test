const fileInput = document.getElementById("fileInput");
const beautifyBtn = document.getElementById("beautifyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const selectedFile = document.getElementById("selectedFile");
const statusDiv = document.getElementById("status");

let downloadPath = "";

// 显示文件名
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (file) {
    selectedFile.textContent = `已选择文件：${file.name}`;
    selectedFile.style.transform = "scale(1.05)";
    setTimeout(() => {
      selectedFile.style.transform = "scale(1)";
    }, 300);
  } else {
    selectedFile.textContent = "";
  }
});

// 显示状态
function showStatus(message, type = "info") {
  statusDiv.textContent = message;
  statusDiv.className = "";

  if (type === "success") statusDiv.classList.add("status-success");
  else if (type === "error") statusDiv.classList.add("status-error");
  else statusDiv.classList.add("status-info");

  statusDiv.style.opacity = "0";
  statusDiv.style.transform = "translateY(-10px)";
  setTimeout(() => {
    statusDiv.style.transition = "all 0.3s ease";
    statusDiv.style.opacity = "1";
    statusDiv.style.transform = "translateY(0)";
  }, 10);
}

// 点击开始美化
beautifyBtn.onclick = async () => {
  const file = fileInput.files[0];
  if (!file) {
    showStatus("请先选择一个 .docx 文件", "error");
    beautifyBtn.style.animation = "shake 0.5s";
    setTimeout(() => (beautifyBtn.style.animation = ""), 500);
    return;
  }

  showStatus("正在美化，请稍候...", "info");
  beautifyBtn.textContent = "⏳ 美化中...";
  beautifyBtn.disabled = true;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("/beautify", { method: "POST", body: formData });
    const data = await res.json();

    if (data.success) {
      downloadPath = data.download;
      showStatus("✅ 美化完成！", "success");
      downloadBtn.disabled = false;
      downloadBtn.style.transform = "scale(1.1)";
      setTimeout(() => (downloadBtn.style.transform = "scale(1)"), 300);
    } else {
      showStatus("❌ " + data.message, "error");
    }
  } catch {
    showStatus("❌ 网络错误，请稍后重试", "error");
  } finally {
    beautifyBtn.textContent = "▶️ 开始美化";
    beautifyBtn.disabled = false;
  }
};

// 点击下载
downloadBtn.onclick = async () => {
  if (!downloadPath) return;
  showStatus("正在准备下载...", "info");

  try {
    const res = await fetch("/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: downloadPath }),
    });

    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = downloadPath.split(/[\\/]/).pop();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showStatus("✅ 下载完成！", "success");
    } else {
      showStatus("❌ 下载失败", "error");
    }
  } catch {
    showStatus("❌ 下载失败，请稍后重试", "error");
  }
};

// 添加震动动画CSS
const style = document.createElement("style");
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-5px); }
    40%, 80% { transform: translateX(5px); }
  }
`;
document.head.appendChild(style);

// 🧹 清除缓存按钮
const clearCacheBtn = document.getElementById("clearCacheBtn");
if (clearCacheBtn) {
  clearCacheBtn.addEventListener("click", async () => {
    showStatus("正在清理缓存...", "info");
    try {
      const res = await fetch("/clear_cache", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        // 重置前端状态
        downloadPath = "";
        downloadBtn.disabled = true;
        selectedFile.textContent = "";
        fileInput.value = ""; // 清空文件输入框
        
        // 清除浏览器缓存
        sessionStorage.clear();
        localStorage.clear();
        caches.keys().then(names => names.forEach(n => caches.delete(n)));
        
        showStatus("🧹 缓存已清除！", "success");
      } else {
        showStatus("❌ " + data.message, "error");
      }
    } catch {
      showStatus("❌ 清除缓存失败", "error");
    }
  });
}

import os
import sys
import uuid
import json
from flask import Flask, render_template, request, send_file, jsonify

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

from beautifier import beautify_document

app = Flask(__name__)

CONFIG_PATH = os.path.join(BASE_DIR, "config", "default.json")
DEFAULT_OUTPUT_DIR = os.path.join(BASE_DIR, "output")
INPUT_DIR = os.path.join(BASE_DIR, "input")

os.makedirs(DEFAULT_OUTPUT_DIR, exist_ok=True)
os.makedirs(INPUT_DIR, exist_ok=True)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/beautify", methods=["POST"])
def beautify():
    """上传文件并执行美化"""
    file = request.files.get("file")
    output_dir = request.form.get("output_dir") or DEFAULT_OUTPUT_DIR

    if not file:
        return jsonify({"success": False, "message": "未选择文件"})

    if not os.path.exists(output_dir):
        try:
            os.makedirs(output_dir)
        except Exception as e:
            return jsonify({"success": False, "message": f"无法创建输出目录：{e}"})

    filename = file.filename
    if not filename.lower().endswith(".docx"):
        return jsonify({"success": False, "message": "仅支持 .docx 文件"})

    temp_path = os.path.join(INPUT_DIR, f"temp_{uuid.uuid4().hex}.docx")
    file.save(temp_path)

    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        config = json.load(f)

    output_name = f"Beautified_{filename}"
    output_path = os.path.join(output_dir, output_name)
    backup_path = os.path.join(DEFAULT_OUTPUT_DIR, output_name)

    try:
        beautify_document(temp_path, output_path, config)
        # 同时复制一份到默认 output 目录
        if output_dir != DEFAULT_OUTPUT_DIR:
            import shutil
            shutil.copy(output_path, backup_path)
        os.remove(temp_path)
        return jsonify({"success": True, "download": output_path})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})


@app.route("/download", methods=["POST"])
def download():
    """接收前端传来的真实路径并下载"""
    data = request.get_json()
    path = data.get("path")
    if not path or not os.path.exists(path):
        return jsonify({"success": False, "message": "文件不存在"})
    return send_file(path, as_attachment=True)


@app.route("/clear_cache", methods=["POST"])
def clear_cache():
    """清除缓存文件"""
    try:
        # 清除临时文件
        if os.path.exists(INPUT_DIR):
            for filename in os.listdir(INPUT_DIR):
                file_path = os.path.join(INPUT_DIR, filename)
                try:
                    if os.path.isfile(file_path):
                        os.unlink(file_path)
                except Exception as e:
                    print(f"无法删除文件 {file_path}: {e}")
        
        # 清除默认输出目录中的临时美化文件
        if os.path.exists(DEFAULT_OUTPUT_DIR):
            for filename in os.listdir(DEFAULT_OUTPUT_DIR):
                if filename.startswith("Beautified_"):
                    file_path = os.path.join(DEFAULT_OUTPUT_DIR, filename)
                    try:
                        if os.path.isfile(file_path):
                            os.unlink(file_path)
                    except Exception as e:
                        print(f"无法删除文件 {file_path}: {e}")
        
        return jsonify({"success": True, "message": "缓存已清除"})
    except Exception as e:
        return jsonify({"success": False, "message": f"清除缓存失败: {str(e)}"})


if __name__ == "__main__":
    print("✅ Word文档美化助手已启动 → http://127.0.0.1:5000")
    app.run(host="127.0.0.1", port=5000, debug=True)

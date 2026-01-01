# main.py - 程序入口（读取 license、调用格式化函数）# main.py - 程序入口
from beautifier import beautify_document
from license_check import verify_license
import json
import os
from rich.console import Console
from rich.progress import track

console = Console()

def main():
    console.print("[bold cyan]📘 Word Beautifier 启动中...[/bold cyan]")

    # 检查 license
    if not verify_license("license.key"):
        console.print("[bold red]❌ 授权验证失败，请检查 license.key[/bold red]")
        return
    console.print("[bold green]✅ 授权验证通过[/bold green]")

    # 加载配置
    config_path = "config/default.json"
    if not os.path.exists(config_path):
        console.print("[bold red]❌ 找不到配置文件 config/default.json[/bold red]")
        return
    with open(config_path, "r", encoding="utf-8") as f:
        config = json.load(f)

    # 读取输入文件
    input_dir = "input"
    output_dir = "output"
    os.makedirs(output_dir, exist_ok=True)

    files = [f for f in os.listdir(input_dir) if f.endswith(".docx")]
    if not files:
        console.print("[bold yellow]⚠️ 未找到输入文件，请将 Word 文件放入 input/ 文件夹[/bold yellow]")
        return

    for file in track(files, description="✨ 正在美化中..."):
        input_path = os.path.join(input_dir, file)
        output_path = os.path.join(output_dir, f"Beautified_{file}")
        beautify_document(input_path, output_path, config)

    console.print("[bold green]✅ 所有文件美化完成！请查看 output/ 文件夹。[/bold green]")


if __name__ == "__main__":
    main()

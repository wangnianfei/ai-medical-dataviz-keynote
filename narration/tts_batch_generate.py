#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Batch & Preview TTS Generator for 《AI 在医学数据分析与可视化中的应用及体会》 (38 Slides)

Features:
  - Reads narration/slides_narration.json (segments[] with exact pause_after_sec)
  - Synthesizes each spoken segment cleanly via Microsoft Edge Neural TTS (edge-tts)
  - Inserts genuine silent pauses (1.0s / 1.5s / 2.0s) between segments via ffmpeg
  - Supports single/selected slide preview (--slides 1 2) and multi-voice audition (--audition)
  - Supports full 38-slide batch synthesis into audio/slide_01.mp3 .. audio/slide_38.mp3

Recommended Chinese Male Voices (edge-tts):
  - zh-CN-YunxiNeural    : 阳光自然、口语感最强的青年/中青年讲述男声（推荐故事化演讲）
  - zh-CN-YunjianNeural  : 沉稳厚重、有磁性的成熟男声（推荐学术 keynote 氛围）
  - zh-CN-YunyangNeural  : 专业清晰、播音主持感男声（字正腔圆、节奏利落）
"""

import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
MANIFEST_PATH = REPO_ROOT / "narration" / "slides_narration.json"

MALE_VOICES = {
    "yunxi": ("zh-CN-YunxiNeural", "自然讲述男声（口语流畅、亲和力强）"),
    "yunjian": ("zh-CN-YunjianNeural", "沉稳磁性男声（成熟厚重、学术气质）"),
    "yunyang": ("zh-CN-YunyangNeural", "专业播音男声（清晰利落、字正腔圆）"),
}


def find_bin(name: str, fallbacks: list[str]) -> str:
    found = shutil.which(name)
    if found:
        return found
    for fb in fallbacks:
        if os.path.isfile(fb) and os.access(fb, os.X_OK):
            return fb
    raise FileNotFoundError(
        f"未找到可执行文件 `{name}`。请先安装（如 `pip install edge-tts` / `brew install ffmpeg`）。"
    )


def run_cmd(cmd: list[str]) -> None:
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        raise RuntimeError(
            f"命令执行失败 ({res.returncode}): {' '.join(cmd)}\n{res.stderr.strip()}"
        )


def make_silence_mp3(ffmpeg_bin: str, duration_sec: float, out_path: Path) -> None:
    run_cmd(
        [
            ffmpeg_bin,
            "-y",
            "-f",
            "lavfi",
            "-i",
            "anullsrc=r=24000:cl=mono",
            "-t",
            f"{duration_sec:.2f}",
            "-q:a",
            "4",
            "-acodec",
            "libmp3lame",
            str(out_path),
        ]
    )


def synthesize_slide(
    slide_obj: dict,
    voice: str,
    rate: str,
    pitch: str,
    out_mp3: Path,
    edge_tts_bin: str,
    ffmpeg_bin: str,
) -> float:
    """Synthesize all segments of one slide with true silent pauses, return final duration (sec)."""
    out_mp3.parent.mkdir(parents=True, exist_ok=True)
    segments = slide_obj["segments"]

    with tempfile.TemporaryDirectory(prefix=f"tts_{slide_obj['id']}_") as tmp:
        tmp_dir = Path(tmp)
        concat_files: list[Path] = []

        for idx, seg in enumerate(segments):
            seg_mp3 = tmp_dir / f"seg_{idx:02d}.mp3"
            cmd = [
                edge_tts_bin,
                "--voice",
                voice,
                f"--rate={rate}",
                f"--pitch={pitch}",
                "--text",
                seg["text"],
                "--write-media",
                str(seg_mp3),
            ]
            run_cmd(cmd)
            concat_files.append(seg_mp3)

            pause_sec = float(seg.get("pause_after_sec", 0.0))
            # Insert silence between segments (and preserve dramatic final pause if >= 1.2s)
            if pause_sec >= 0.3 and (idx < len(segments) - 1 or pause_sec >= 1.2):
                sil_mp3 = tmp_dir / f"sil_{idx:02d}.mp3"
                make_silence_mp3(ffmpeg_bin, pause_sec, sil_mp3)
                concat_files.append(sil_mp3)

        list_file = tmp_dir / "concat.txt"
        list_file.write_text(
            "\n".join(f"file '{p.as_posix()}'" for p in concat_files) + "\n",
            encoding="utf-8",
        )
        run_cmd(
            [
                ffmpeg_bin,
                "-y",
                "-f",
                "concat",
                "-safe",
                "0",
                "-i",
                str(list_file),
                "-ar",
                "24000",
                "-ac",
                "1",
                "-b:a",
                "96k",
                "-acodec",
                "libmp3lame",
                str(out_mp3),
            ]
        )

    # Probe exact duration via ffprobe if available
    ffprobe = shutil.which("ffprobe") or "/opt/homebrew/bin/ffprobe"
    if os.path.isfile(ffprobe):
        res = subprocess.run(
            [
                ffprobe,
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "default=noprint_wrappers=1:nokey=1",
                str(out_mp3),
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        if res.returncode == 0 and res.stdout.strip():
            return round(float(res.stdout.strip()), 2)
    return 0.0


def main() -> None:
    parser = argparse.ArgumentParser(
        description="按 slides_narration.json 批量或试听合成 38 页中文男声旁白 MP3"
    )
    parser.add_argument(
        "--voice",
        default="zh-CN-YunxiNeural",
        help="edge-tts 音色名或简写 (yunxi / yunjian / yunyang)，默认 zh-CN-YunxiNeural",
    )
    parser.add_argument(
        "--rate",
        default="+4%",
        help="语速调节（如 +0%%, +4%%, -5%%），默认 +4%% 接近自然演讲节奏",
    )
    parser.add_argument(
        "--pitch",
        default="-2Hz",
        help="音调微调（如 +0Hz, -2Hz），默认 -2Hz 略显沉稳",
    )
    parser.add_argument(
        "--slides",
        nargs="*",
        type=int,
        help="只合成指定页码（例如 --slides 1 2），留空则批量合成全部 38 页",
    )
    parser.add_argument(
        "--outdir",
        default=str(REPO_ROOT / "audio"),
        help="输出目录（默认仓库根目录 audio/）",
    )
    parser.add_argument(
        "--audition",
        action="store_true",
        help="试听对比模式：用 3 款中文男声（Yunxi / Yunjian / Yunyang）合成 P02（黎曼猜想）供挑选",
    )
    args = parser.parse_args()

    edge_tts_bin = find_bin(
        "edge-tts",
        [
            str(Path.home() / "Library/Python/3.9/bin/edge-tts"),
            str(Path.home() / "Library/Python/3.11/bin/edge-tts"),
            str(Path.home() / "Library/Python/3.12/bin/edge-tts"),
            "/opt/homebrew/bin/edge-tts",
        ],
    )
    ffmpeg_bin = find_bin("ffmpeg", ["/opt/homebrew/bin/ffmpeg", "/usr/local/bin/ffmpeg"])

    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    slides_by_num = {s["slide"]: s for s in manifest["slides"]}

    if args.audition:
        audition_dir = REPO_ROOT / "audio_preview"
        target_num = args.slides[0] if args.slides else 2
        slide_obj = slides_by_num[target_num]
        print(f"🎧 试听模式：使用 3 款男声合成 P{target_num:02d}（{slide_obj['title']}）→ {audition_dir}")
        for short_key, (v_name, desc) in MALE_VOICES.items():
            out_file = audition_dir / f"preview_P{target_num:02d}_{short_key}.mp3"
            dur = synthesize_slide(
                slide_obj, v_name, args.rate, args.pitch, out_file, edge_tts_bin, ffmpeg_bin
            )
            print(f"  ✓ [{short_key:7s}] {v_name:22s} ({dur:5.1f}s) → {out_file.name}  # {desc}")
        return

    voice = MALE_VOICES[args.voice.lower()][0] if args.voice.lower() in MALE_VOICES else args.voice
    target_nums = args.slides if args.slides else list(range(1, 39))
    outdir = Path(args.outdir)

    print(f"🎙 开始合成 | 音色: {voice} | 语速: {args.rate} | 音调: {args.pitch} | 页数: {len(target_nums)}")
    total_dur = 0.0
    for n in target_nums:
        slide_obj = slides_by_num[n]
        out_file = outdir / f"slide_{n:02d}.mp3"
        dur = synthesize_slide(
            slide_obj, voice, args.rate, args.pitch, out_file, edge_tts_bin, ffmpeg_bin
        )
        total_dur += dur
        print(f"  ✓ P{n:02d} ({dur:5.1f}s) → {out_file.name} | {slide_obj['title']}")

    print(f"\n✅ 合成完成！共 {len(target_nums)} 页，实际总时长 {int(total_dur//60):02d}:{int(total_dur%60):02d}（{total_dur:.1f}s）")


if __name__ == "__main__":
    main()

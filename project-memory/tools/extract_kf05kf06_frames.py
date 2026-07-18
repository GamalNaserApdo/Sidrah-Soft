"""
HERO-REBUILD-IMPLEMENTATION-001
Extract frames from hero_kf05_to_kf06_v1.mp4 for both desktop and mobile.
Writes hero_manifest.json in each output folder.

Desktop: 1920x1080, quality 85, frames-kf05kf06/
Mobile:  960x540,   quality 80, frames-kf05kf06-mobile/
"""

import cv2
import os
import json
import sys
from PIL import Image

CLIP_PATH = "src/assets/hero/clips/hero_kf05_to_kf06_v1.mp4"

CONFIGS = [
    {
        "name": "desktop",
        "folder": "src/assets/hero/frames-kf05kf06",
        "width": 1920,
        "height": 1080,
        "quality": 85,
    },
    {
        "name": "mobile",
        "folder": "src/assets/hero/frames-kf05kf06-mobile",
        "width": 960,
        "height": 540,
        "quality": 80,
    },
]


def extract_for_config(cap, total_frames, fps, cfg, log_lines):
    folder = cfg["folder"]
    os.makedirs(folder, exist_ok=True)

    target_w = cfg["width"]
    target_h = cfg["height"]
    quality = cfg["quality"]
    name = cfg["name"]

    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
    extracted = 0
    warnings = []

    for i in range(total_frames):
        ret, frame = cap.read()
        if not ret:
            msg = f"[{name}] WARNING: Failed to read frame {i+1}"
            print(msg)
            warnings.append(msg)
            continue

        pil_img = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        src_w, src_h = pil_img.size

        # Cover-scale to target resolution
        scale = max(target_w / src_w, target_h / src_h)
        new_w = int(round(src_w * scale))
        new_h = int(round(src_h * scale))

        if new_w != target_w or new_h != target_h:
            pil_img = pil_img.resize((new_w, new_h), Image.LANCZOS)
            left = (new_w - target_w) // 2
            top = (new_h - target_h) // 2
            pil_img = pil_img.crop((left, top, left + target_w, top + target_h))

        frame_name = f"frame_{i+1:04d}.webp"
        out_path = os.path.join(folder, frame_name)
        pil_img.save(out_path, "WEBP", quality=quality)
        extracted += 1

        if (i + 1) % 20 == 0 or (i + 1) == total_frames:
            print(f"  [{name}] {i+1}/{total_frames} frames extracted")

    duration = total_frames / fps if fps > 0 else 0

    manifest = {
        "total_frames": extracted,
        "resolution": {"width": target_w, "height": target_h},
        "quality": quality,
        "format": "webp",
        "source_clip": os.path.basename(CLIP_PATH),
        "fps": fps,
        "duration": round(duration, 3),
        "frame_naming": "frame_%04d.webp",
        "scroll_mapping": "linear",
    }

    manifest_path = os.path.join(folder, "hero_manifest.json")
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)

    log_lines.append(f"[{name}] Extracted {extracted} frames → {folder}")
    log_lines.append(f"[{name}] Manifest written → {manifest_path}")
    if warnings:
        for w in warnings:
            log_lines.append(w)

    return extracted, warnings


def main():
    log_lines = []
    log_lines.append("=== HERO-REBUILD-IMPLEMENTATION-001: Frame Extraction ===")

    if not os.path.exists(CLIP_PATH):
        print(f"ERROR: Clip not found: {CLIP_PATH}")
        sys.exit(1)

    cap = cv2.VideoCapture(CLIP_PATH)
    if not cap.isOpened():
        print(f"ERROR: Failed to open {CLIP_PATH}")
        sys.exit(1)

    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    src_w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    src_h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    log_lines.append(f"Source: {CLIP_PATH}")
    log_lines.append(f"FPS: {fps}")
    log_lines.append(f"Total frames: {total_frames}")
    log_lines.append(f"Source resolution: {src_w}x{src_h}")
    log_lines.append(f"Duration: {total_frames/fps:.3f}s")
    print("\n".join(log_lines[-5:]))

    all_warnings = []
    for cfg in CONFIGS:
        print(f"\n--- Extracting {cfg['name']} ({cfg['width']}x{cfg['height']}) ---")
        extracted, warnings = extract_for_config(cap, total_frames, fps, cfg, log_lines)
        all_warnings.extend(warnings)

    cap.release()

    # Write extraction log
    log_dir = "project-memory/logs"
    os.makedirs(log_dir, exist_ok=True)
    log_path = os.path.join(log_dir, "kf05kf06_extraction.log")
    with open(log_path, "w", encoding="utf-8") as f:
        f.write("\n".join(log_lines) + "\n")

    print(f"\n=== DONE. Log written to {log_path} ===")
    if all_warnings:
        print(f"Warnings: {len(all_warnings)}")


if __name__ == "__main__":
    main()

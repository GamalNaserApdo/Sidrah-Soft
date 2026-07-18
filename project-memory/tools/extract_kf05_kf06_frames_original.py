import cv2
import os

video_path = 'src/assets/hero/clips/hero_kf05_to_kf06_v1.mp4'
output_dir = 'src/assets/hero/clips/screenshots/kf05_kf06'
os.makedirs(output_dir, exist_ok=True)

cap = cv2.VideoCapture(video_path)
if not cap.isOpened():
    print(f"Failed to open {video_path}")
    exit(1)

total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
print(f"Total frames: {total_frames}")

percentages = [0, 25, 50, 75, 100]
for p in percentages:
    frame_idx = min(int(total_frames * p / 100), total_frames - 1)
    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
    ret, frame = cap.read()
    if ret:
        output_path = os.path.join(output_dir, f'kf05_kf06_{p:03d}.png')
        cv2.imwrite(output_path, frame)
        print(f"Saved {output_path}")
    else:
        print(f"Failed to read frame at {p}%")

cap.release()

"""Make a lightweight, silent welcome loop from the complete profile film."""
from argparse import ArgumentParser
from pathlib import Path
import shutil
import subprocess

SEGMENTS = ((.65, 2.18), (2.75, 4.70), (5.25, 8.10),
            (8.85, 11.15), (11.85, 13.65), (20.60, 23.85))

def main():
    parser = ArgumentParser()
    parser.add_argument('--site-directory', type=Path, required=True)
    args = parser.parse_args()
    assets = args.site_directory.resolve() / 'assets'
    source = assets / 'systems-in-motion.mp4'
    output = assets / 'welcome-motion-loop.mp4'
    ffmpeg = shutil.which('ffmpeg')
    if not ffmpeg or not source.is_file():
        raise SystemExit('FFmpeg and assets/systems-in-motion.mp4 are required.')
    filters = [
        f'[0:v]trim=start={start}:end={end},setpts=PTS-STARTPTS[v{i}]'
        for i, (start, end) in enumerate(SEGMENTS)
    ]
    inputs = ''.join(f'[v{i}]' for i in range(len(SEGMENTS)))
    filters.append(f'{inputs}concat=n={len(SEGMENTS)}:v=1:a=0,scale=1280:720,fps=30[out]')
    subprocess.run([
        ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', '-i', str(source),
        '-filter_complex', ';'.join(filters), '-map', '[out]', '-an',
        '-c:v', 'libx264', '-preset', 'medium', '-crf', '21',
        '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(output),
    ], check=True)
    print(f'Welcome loop: {output} ({output.stat().st_size} bytes)')

if __name__ == '__main__':
    main()

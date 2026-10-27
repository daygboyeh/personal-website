"""Render native 1080p, 60 fps RGB frames directly into an H.264 encoder."""
from pathlib import Path
from argparse import ArgumentParser
import json
import subprocess
import time
import shutil
from PIL import Image,ImageDraw
from drawing import W,H,PAPER,INK,font
from scenes import frame
from soundtrack import compose

ROOT=Path(__file__).resolve().parent
OUT=ROOT.parent.parent/'outputs'
OUT.mkdir(exist_ok=True)

def contact_sheet():
    moments=[1.65,3.9,6.8,10.0,12.8,14.7,15.7,16.7,18.8,22.7]
    sheet=Image.new('RGB',(1600,5*488),(226,225,218))
    draw=ImageDraw.Draw(sheet)
    for i,t in enumerate(moments):
        im=frame(t)
        im.save(ROOT/f'qa-{i:02}.png')
        thumb=im.resize((780,439),Image.Resampling.LANCZOS)
        x=10+(i%2)*800;y=10+(i//2)*488
        sheet.paste(thumb,(x,y))
        draw.text((x+6,y+448),f'{t:04.1f}s / SYSTEMS IN MOTION',font=font(16,-1),fill=INK)
    sheet.save(OUT/'systems-in-motion-storyboard.jpg',quality=94)
    frame(22.7).save(OUT/'systems-in-motion-poster.jpg',quality=95)
    return moments

def render(fps=60):
    started=time.monotonic()
    path=OUT/'Adebiyi_Adegboye_Systems_in_Motion.mp4'
    audio=ROOT/'soundtrack.wav'
    peak=compose(audio)
    cmd=[shutil.which('ffmpeg'),'-hide_banner','-loglevel','error','-y',
         '-f','rawvideo','-vcodec','rawvideo','-pix_fmt','rgb24',
         '-s',f'{W}x{H}','-r',str(fps),'-i','pipe:0','-i',str(audio),
         '-map','0:v:0','-map','1:a:0','-c:v','libx264','-preset','medium',
         '-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','256k',
         '-movflags','+faststart','-t','24','-metadata',
         'title=Systems in Motion — Adebiyi Adegboye',
         '-metadata','comment=Original procedural motion graphics and original synthesized soundtrack.',
         str(path)]
    encoder=subprocess.Popen(cmd,stdin=subprocess.PIPE)
    try:
        for i in range(24*fps):
            encoder.stdin.write(frame(i/fps).tobytes())
            if i%(fps*2)==0:
                print(json.dumps({'progress':round(i/(24*fps)*100),'timeline_seconds':i/fps,'render_seconds':round(time.monotonic()-started,1)}),flush=True)
        encoder.stdin.close()
        code=encoder.wait()
        if code:
            raise RuntimeError(f'FFmpeg exited with {code}')
    except BaseException:
        encoder.terminate()
        encoder.wait()
        raise
    probe=subprocess.run([shutil.which('ffprobe'),'-v','error','-show_format','-show_streams','-of','json',str(path)],check=True,capture_output=True,text=True)
    info=json.loads(probe.stdout)
    summary={'file':str(path),'bytes':path.stat().st_size,'render_seconds':round(time.monotonic()-started,1),'audio_peak':round(peak,4),'duration':info['format']['duration'],'streams':[{k:s.get(k) for k in ('codec_name','codec_type','width','height','r_frame_rate','sample_rate','channels','nb_frames')} for s in info['streams']]}
    (ROOT/'render-report.json').write_text(json.dumps(summary,indent=2))
    print(json.dumps(summary),flush=True)

if __name__=='__main__':
    parser=ArgumentParser();parser.add_argument('--preview',action='store_true');parser.add_argument('--fps',type=int,default=60)
    args=parser.parse_args()
    contact_sheet()
    if not args.preview:render(args.fps)

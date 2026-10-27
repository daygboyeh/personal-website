"""Small, deterministic drawing and motion primitives for Systems in Motion."""
from functools import lru_cache
import math
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1920, 1080
INK = (13, 14, 18)
PAPER = (242, 239, 230)
CORAL = (255, 96, 68)
ACID = (218, 255, 119)
BLUE = (48, 64, 236)
LILAC = (189, 170, 250)
FONT = os.environ.get("MOTION_FONT", "/System/Library/Fonts/HelveticaNeue.ttc")
MONO = os.environ.get("MOTION_MONO", "/System/Library/Fonts/SFNSMono.ttf")
TAU = math.tau

def clamp(v, a=0, b=1):
    return max(a, min(b, v))

def out(v):
    return 1 - (1 - clamp(v)) ** 4

def smooth(v):
    v = clamp(v)
    return v * v * (3 - 2 * v)

def spring(v):
    v = clamp(v)
    return 1 - math.exp(-8 * v) * math.cos(10 * v) if v < 1 else 1

def lerp(a, b, t):
    return a + (b - a) * t

def mix(a, b, t):
    return tuple(round(lerp(x, y, t)) for x, y in zip(a, b))

@lru_cache(maxsize=150)
def font(size, face=9):
    return ImageFont.truetype(MONO if face == -1 else FONT, int(size), index=0 if face == -1 or not FONT.lower().endswith(".ttc") else face)

@lru_cache(maxsize=32)
def background(color):
    rng = np.random.default_rng(81)
    noise = rng.normal(0, .58, (H, W, 1))
    arr = np.clip(np.array(color)[None, None, :] + noise, 0, 255).astype(np.uint8)
    return Image.fromarray(arr)

def canvas(color):
    return background(tuple(color)).copy()

def width(text, size, face=9):
    return font(size, face).getlength(text)

def fit(text, size, limit, face=9):
    return min(size, int(size * limit / max(1, width(text, size, face))))

def text(im, value, xy, size, color=PAPER, face=9, anchor="lt"):
    ImageDraw.Draw(im).text(tuple(map(round, xy)), value, font=font(size, face), fill=color, anchor=anchor)

@lru_cache(maxsize=600)
def text_sprite(value, size, color, face):
    f = font(size, face)
    box = f.getbbox("Hg")
    layer = Image.new("RGBA", (max(1, math.ceil(f.getlength(value)) + 8), box[3] - box[1] + 8))
    ImageDraw.Draw(layer).text((4, 4 - box[1]), value, font=f, fill=tuple(color)+(255,))
    return layer

def title(im, value, x, y, size, color, t, delay=0, limit=None, tracking=None):
    """Staggered type enters through a fixed baseline mask, with short overshoot."""
    if limit:
        size = fit(value, size, limit)
    cursor = x
    for i, ch in enumerate(value):
        p = clamp((t - delay - i * .027) / .62)
        f = font(size)
        advance = f.getlength(ch) + (tracking if tracking is not None else -size * .035)
        if p > 0 and ch != " ":
            sprite = text_sprite(ch, size, tuple(color), 9)
            offset = (1 - spring(p)) * size * .95
            top = max(0, int(-offset))
            visible = max(0, min(sprite.height - top, int(size * 1.05 - offset)))
            if visible:
                tile = sprite.crop((0, top, sprite.width, top+visible))
                im.paste(tile, (round(cursor)-4, round(y+offset)+top-4), tile)
        cursor += advance
    return cursor

def line(im, points, fill, width=1):
    ImageDraw.Draw(im).line(points, fill=fill, width=width, joint="curve")

def circle(im, cx, cy, radius, fill=None, outline=None, width=1):
    if radius <= 0:
        return
    ImageDraw.Draw(im).ellipse((cx-radius,cy-radius,cx+radius,cy+radius),fill=fill,outline=outline,width=width)

def pill(im, box, fill=None, outline=None, radius=25, width=1):
    ImageDraw.Draw(im).rounded_rectangle(box,radius,fill,outline,width)

def label(im, value, xy, color=PAPER, size=18):
    text(im, value, xy, size, color, -1)

def chrome(im, t, section, color=PAPER):
    label(im, "AA / SYSTEMS IN MOTION", (64, 46), color, 16)
    text(im, section, (W-64,46),16,color,-1,"rt")
    line(im,[(64,H-63),(W-64,H-63)],mix(color,INK,.78),1)
    line(im,[(64,H-63),(64+(W-128)*t/24,H-63)],color,2)
    label(im,"ADEBIYI ADEGBOYE / ENGINEERING PROFILE", (64,H-43),color,13)
    text(im,f"{int(t):02d}:{int(t*60)%60:02d}  /  00:24",(W-64,H-43),13,color,-1,"rt")

def cross(im,x,y,size,color,width=2):
    line(im,[(x-size,y),(x+size,y)],color,width)
    line(im,[(x,y-size),(x,y+size)],color,width)

def burst(im,cx,cy,radius,color,rotation=0,count=12,weight=None):
    weight = weight or max(4,int(radius*.085))
    for i in range(count):
        angle=rotation+i*TAU/count
        a=(cx+math.cos(angle)*radius*.16,cy+math.sin(angle)*radius*.16)
        b=(cx+math.cos(angle)*radius,cy+math.sin(angle)*radius)
        line(im,[a,b],color,weight)
        circle(im,*b,weight/2,color)

def grid(im,color,spacing=100,offset=0):
    for x in range(-spacing,W+spacing,spacing):
        line(im,[(x+offset,0),(x+offset,H)],color)
    for y in range(0,H,spacing):
        line(im,[(0,y),(W,y)],color)

def project(points, center, scale=1, ry=0, rx=0, focal=950):
    pts=np.asarray(points,dtype=float)
    cy,sy=math.cos(ry),math.sin(ry)
    cx,sx=math.cos(rx),math.sin(rx)
    rotation_y=np.array([[cy,0,sy],[0,1,0],[-sy,0,cy]])
    rotation_x=np.array([[1,0,0],[0,cx,-sx],[0,sx,cx]])
    pts=pts @ rotation_y.T @ rotation_x.T
    factor=focal/(focal+pts[:,2])
    screen=pts[:,:2]*factor[:,None]*scale+np.array(center)
    return screen,pts[:,2]

def cube(im,center,size,color,angle=.5,tilt=.4,depth=0):
    v=np.array([[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],float)*size/2
    pts,z=project(v,center,ry=angle,rx=tilt)
    faces=[([0,1,2,3],.75),([4,5,6,7],1),([0,1,5,4],1.15),([2,3,7,6],.6),([0,3,7,4],.65),([1,2,6,5],.88)]
    draw=ImageDraw.Draw(im)
    for indices,brightness in sorted(faces,key=lambda f:np.mean(z[f[0]]),reverse=True):
        shade=tuple(min(255,int(c*brightness)) for c in color)
        poly=[tuple(pts[i]) for i in indices]
        draw.polygon(poly,fill=shade)
        draw.line(poly+[poly[0]],fill=mix(shade,PAPER,.12),width=1)

def orbit(im,center,radius,rotation,color,tilt=.55):
    pts=[(radius*math.cos(a),radius*math.sin(a),0) for a in np.linspace(0,TAU,130)]
    screen,_=project(pts,center,ry=rotation,rx=tilt)
    line(im,[tuple(p) for p in screen],color,2)

def arrow(im,x,y,scale,color,angle=0):
    pts=np.array([[-1,-.22],[.15,-.22],[-.24,-.62],[.08,-.92],[1,0],[.08,.92],[-.24,.62],[.15,.22],[-1,.22]])*scale
    rot=np.array([[math.cos(angle),-math.sin(angle)],[math.sin(angle),math.cos(angle)]])
    pts=pts@rot.T+np.array([x,y])
    ImageDraw.Draw(im).polygon([tuple(p) for p in pts],fill=color)

def glow(im,center,radius,color,amount=.3):
    layer=Image.new("RGB",(W,H),INK)
    circle(layer,*center,radius,color)
    layer=layer.filter(ImageFilter.GaussianBlur(radius*.45))
    return Image.blend(im,layer,amount)

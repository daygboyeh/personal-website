"""Art-directed, frame-addressable scenes. All résumé claims come from the CV."""
import math
import numpy as np
from PIL import Image, ImageDraw
from drawing import *

CUTS=[0,2.5,5,8.5,11.5,14,17,20,24]
BG=[INK,PAPER,INK,BLUE,PAPER,CORAL,INK,PAPER]

def intro(u,t):
    im=canvas(INK)
    draw=ImageDraw.Draw(im)
    cx,cy=1480,580
    radius=220*spring(u/.8)
    for r in (300,360,420):
        circle(im,cx,cy,r,None,(37,38,43),1)
    for i in range(48):
        a=i*TAU/48+t*.09
        r1=320 if i%4==0 else 328
        line(im,[(cx+math.cos(a)*r1,cy+math.sin(a)*r1),(cx+math.cos(a)*337,cy+math.sin(a)*337)],(75,73,76),2)
    burst(im,cx,cy,radius,CORAL,t*.55,12)
    label(im,"CLOUD. CODE. PEOPLE.",(82,176),CORAL,21)
    title(im,"SYSTEMS",76,277,285,PAPER,u,delay=.10,limit=1480)
    title(im,"IN MOTION",80,550,252,PAPER,u,delay=.38,limit=1320)
    line(im,[(88,875),(560,875)],(86,85,86),1)
    label(im,"ENGINEERING IS A MOVING PART.",(88,903),(151,151,150),18)
    cross(im,1770,906,13,CORAL)
    chrome(im,t,"00 / OPENING",PAPER)
    return im

def build(u,t):
    im=canvas(PAPER)
    move=out(u/.6)
    circle(im,1510,445,245*move,ACID)
    circle(im,1510,445,180*move,None,INK,2)
    arrow(im,1510,445,105*move,INK,angle=-math.pi/4+.15*math.sin(u*2))
    label(im,"A PRACTICE BUILT ON OWNERSHIP",(86,158),INK,19)
    title(im,"BUILD.",74,235,440,INK,u,delay=.1,limit=1350)
    title(im,"BEYOND.",80,651,210,INK,u,delay=.45,limit=1200)
    line(im,[(86,920),(1810,920)],(178,178,165),1)
    for i,(value,xx) in enumerate([("01 / CLOUD",87),("02 / CODE",670),("03 / PEOPLE",1250)]):
        p=out((u-.5-i*.12)/.6)
        label(im,value,(xx,946+40*(1-p)),INK,18)
    chrome(im,t,"01 / THE MINDSET",INK)
    return im

def systems(u,t):
    im=canvas(INK)
    grid(im,(23,26,30),120,round(t*12)%120)
    center=(1320,525)
    growth=out((u-.15)/1.3)
    radius=310*growth
    orbit(im,center,385*growth,u*.2,(54,59,66),tilt=.4)
    orbit(im,center,385*growth,u*.2+.8,(54,59,66),tilt=1.2)
    nodes=[]
    for i in range(92):
        y=1-2*(i+.5)/92
        r=math.sqrt(1-y*y)
        a=i*2.399963
        nodes.append((r*math.cos(a)*radius,y*radius,r*math.sin(a)*radius))
    pts,z=project(nodes,center,ry=u*.35+.25,rx=-.23)
    order=np.argsort(z)[::-1]
    for i in range(0,len(nodes),3):
        for j in range(i+1,min(i+9,len(nodes))):
            dist=np.linalg.norm(np.array(nodes[i])-np.array(nodes[j]))
            if dist<210:
                shade=(37,48,47) if z[i]>0 else (57,78,69)
                line(im,[tuple(pts[i]),tuple(pts[j])],shade)
    for i in order:
        depth=clamp((350-z[i])/700)
        side=(9+12*depth)*growth
        color=mix((54,79,69),ACID,depth*.72)
        if i%17==0:color=CORAL
        cube(im,tuple(pts[i]),side,color,angle=u*.3+i*.1,tilt=.4)
    label(im,"DISTRIBUTED BY DESIGN",(85,160),ACID,18)
    title(im,"THINK",80,270,180,PAPER,u,delay=.05,limit=800)
    title(im,"IN",80,452,180,PAPER,u,delay=.23)
    title(im,"SYSTEMS.",80,633,180,PAPER,u,delay=.36,limit=840)
    label(im,"AWS  /  AZURE  /  KUBERNETES",(91,905),ACID,22)
    cross(im,1320,525,16,PAPER,1)
    chrome(im,t,"02 / CLOUD ARCHITECTURE",PAPER)
    return im

def azure(u,t):
    im=canvas(BLUE)
    draw=ImageDraw.Draw(im)
    # Modules travel on one continuous, staggered trajectory before snapping to a platform.
    cx,cy=1470,690
    for i in range(7):
        a=i*TAU/7+u*.5
        r=220+30*math.sin(u*2+i)
        p=out((u-i*.055)/.85)
        x=lerp(2200,cx+math.cos(a)*r,p)
        y=lerp(1000,cy+math.sin(a)*r*.58,p)
        line(im,[(cx,cy),(x,y)],(103,117,248),2)
        cube(im,(x,y),58+(i%3)*10,ACID if i%2 else PAPER,angle=u*.4+i,tilt=.5)
    cube(im,(cx,cy),135,ACID,angle=u*.3+.6,tilt=.5)
    label(im,"SELECTED WORK / AZURE PLATFORM",(84,155),ACID,20)
    title(im,"ARCHITECT.",74,250,240,PAPER,u,delay=.04,limit=1700)
    title(im,"DELIVER.",80,490,246,ACID,u,delay=.27,limit=1250)
    label(im,"AZURE + AKS",(89,809),PAPER,25)
    label(im,"END-TO-END PLATFORM OWNERSHIP",(89,862),PAPER,19)
    label(im,"INFRASTRUCTURE  /  IDENTITY  /  AUTOMATION",(89,916),(185,194,255),16)
    chrome(im,t,"03 / FROM DESIGN TO PRODUCTION",PAPER)
    return im

def leadership(u,t):
    im=canvas(PAPER)
    draw=ImageDraw.Draw(im)
    label(im,"BUILD CAPABILITY. NOT DEPENDENCY.",(84,159),INK,18)
    title(im,"LEAD",76,258,285,INK,u,delay=.04,limit=1000)
    title(im,"FORWARD.",80,530,210,INK,u,delay=.3,limit=1160)
    # Three forms move as a team, held by a common orbit; no invented people counts.
    center=(1450,520)
    orbit(im,center,305,u*.15,(167,173,158),tilt=.5)
    for i in range(3):
        a=u*.28+i*TAU/3+.25
        x=center[0]+math.cos(a)*245
        y=center[1]+math.sin(a)*210
        p=spring((u-.15-i*.08)/.7)
        x=lerp(center[0],x,p);y=lerp(center[1],y,p)
        circle(im,x,y,63,CORAL if i==0 else INK)
        circle(im,x,y-15,13,PAPER)
        draw.arc((x-24,y-1,x+24,y+36),180,360,fill=PAPER,width=8)
        line(im,[center,(x,y)],(149,153,144),2)
    burst(im,*center,76,INK,u*.4,8,10)
    label(im,"MENTORING  /  ARCHITECTURE  /  DELIVERY",(89,866),INK,20)
    label(im,"PLATFORM ENGINEERING TEAM LEAD · GRESHAM",(89,920),(92,100,91),18)
    chrome(im,t,"04 / PEOPLE & PLATFORMS",INK)
    return im

def impact(u,t):
    stage=min(2,int(u))
    local=u-stage
    colors=[CORAL,ACID,LILAC]
    im=canvas(colors[stage])
    value=[30,75,20][stage]
    count=round(value*out(local/.42))
    desc=[["FASTER","DEPLOYMENTS"],["LESS MANUAL","CONFIGURATION"],["LOWER","CLOUD COSTS"]][stage]
    label(im,"MEASURABLE WORK. MEASURABLE IMPACT.",(84,157),INK,19)
    size=fit(f"{count}%",470,1090)
    title(im,f"{count}%",72,236,size,INK,local+.55,tracking=-12)
    title(im,desc[0],89,737,92,INK,local+.35,limit=1320)
    title(im,desc[1],90,833,92,INK,local+.2,limit=1400)
    cx,cy=1535,470
    for i in range(40):
        a=i*TAU/40-math.pi/2
        color=INK if i<40*count/100 else mix(colors[stage],INK,.16)
        line(im,[(cx+math.cos(a)*200,cy+math.sin(a)*200),(cx+math.cos(a)*246,cy+math.sin(a)*246)],color,12)
    text(im,f"0{stage+1}",(cx,cy),95,INK,9,"mm")
    label(im,"ALVEO TECHNOLOGY / 2023–2025",(1200,917),INK,17)
    chrome(im,t,"05 / SELECTED OUTCOMES",INK)
    return im

def career(u,t):
    im=canvas(INK)
    label(im,"EXPERIENCE BUILDS ON EXPERIENCE.",(85,155),CORAL,18)
    title(im,"LEVEL",77,248,263,PAPER,u,delay=.04,limit=1050)
    title(im,"BY LEVEL.",80,510,227,PAPER,u,delay=.22,limit=1400)
    labels=[("2018","TLS LOGISTICS","SOFTWARE"),("2020","AUDEO","DEVOPS"),("2023","ALVEO","CLOUD"),("2025 — NOW","GRESHAM","TEAM LEAD")]
    y=856
    line(im,[(96,y),(1808,y)],(73,73,76),2)
    for i,(date,company,role) in enumerate(labels):
        x=96+i*540
        p=out((u-.30-i*.28)/.6)
        if p>0:
            circle(im,x,y,10+5*p,CORAL if i==3 else ACID)
            label(im,date,(x,784+40*(1-p)),CORAL if i==3 else ACID,18)
            label(im,company,(x,892+30*(1-p)),PAPER,19)
            label(im,role,(x,934+30*(1-p)),(140,145,145),15)
    burst(im,1590,387,123,CORAL,u*.5,12)
    chrome(im,t,"06 / THE JOURNEY",PAPER)
    return im

def closing(u,t):
    im=canvas(PAPER)
    label(im,"LONDON, UK / LET’S BUILD WHAT’S NEXT.",(87,158),INK,20)
    title(im,"ADEBIYI",75,265,286,INK,u,delay=.10,limit=1450)
    title(im,"ADEGBOYE",80,530,253,INK,u,delay=.30,limit=1690)
    burst(im,1670,324,114,CORAL,u*.4,12)
    label(im,"PLATFORM ENGINEERING TEAM LEAD",(91,827),INK,25)
    line(im,[(92,885),(1815,885)],(173,177,165),1)
    label(im,"AWS / AZURE / KUBERNETES / ENGINEERING LEADERSHIP",(93,925),(96,104,93),17)
    label(im,"loluadegboye@gmail.com",(93,969),INK,20)
    arrow(im,1756,930,38,CORAL,angle=-math.pi/4)
    chrome(im,t,"07 / KEEP MOVING",INK)
    return im

SCENES=[intro,build,systems,azure,leadership,impact,career,closing]

def frame(t):
    index=max(i for i,start in enumerate(CUTS[:-1]) if t>=start)
    u=t-CUTS[index]
    im=SCENES[index](u,t)
    # Designed match cuts: a growing disc, sliding panel, then a diagonal shutter.
    remaining=CUTS[index+1]-t
    if index<7 and remaining<.30:
        p=smooth(1-remaining/.30)
        incoming=SCENES[index+1](0,t)
        mask=Image.new("L",(W,H),0);d=ImageDraw.Draw(mask)
        if index%3==0:
            r=int(2400*p);cx,cy=W*.78,H*.48
            d.ellipse((cx-r,cy-r,cx+r,cy+r),fill=255)
        elif index%3==1:
            d.rectangle((W*(1-p),0,W,H),fill=255)
        else:
            x=lerp(-W*.4,W*1.4,p)
            d.polygon([(0,0),(x+W*.4,0),(x-W*.4,H),(0,H)],fill=255)
        im=Image.composite(incoming,im,mask)
    # A very short opening fade and an intentional held end frame.
    if t<.12:
        im=Image.blend(canvas(INK),im,smooth(t/.12))
    return im

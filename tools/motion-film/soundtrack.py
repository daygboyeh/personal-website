"""Original 120 BPM electronic score and transition sound design; no samples."""
from pathlib import Path
import wave
import numpy as np

RATE=48000
DURATION=24

def compose(path):
    rng=np.random.default_rng(2026)
    audio=np.zeros((RATE*DURATION,2),dtype=np.float64)
    def add(start,signal,gain=1,pan=0):
        at=int(start*RATE)
        if at<0:
            signal=signal[-at:];at=0
        count=min(len(signal),len(audio)-at)
        if count<=0:return
        signal=signal[:count]*gain
        audio[at:at+count,0]+=signal*np.sqrt((1-pan)/2)
        audio[at:at+count,1]+=signal*np.sqrt((1+pan)/2)
    def tone(freq,duration):
        tt=np.arange(int(duration*RATE))/RATE
        phase=2*np.pi*freq*tt
        env=(1-np.exp(-tt*170))*np.exp(-tt*6)
        return (np.sin(phase)+.25*np.sin(phase*2)+.09*np.sin(phase*3))*env
    # The tonal motif is D minor; timing shares the animation's 0.5-second grid.
    roots=[73.416,73.416,87.307,87.307,65.406,65.406,58.270,58.270,73.416,87.307,65.406,73.416]
    arp=[0,7,12,15,12,7,3,7]
    for beat in range(48):
        at=beat*.5
        tt=np.arange(int(.42*RATE))/RATE
        frequency=46+110*np.exp(-tt*38)
        phase=np.cumsum(frequency)/RATE*2*np.pi
        kick=np.sin(phase)*np.exp(-tt*13)
        kick+=rng.normal(0,1,len(tt))*.035*np.exp(-tt*180)
        add(at,kick,.64 if beat>=5 else .46)
        root=roots[min(11,beat//4)]
        bass=tone(root,.43)
        add(at+.015,bass,.18)
        if beat%2==1:
            st=np.arange(int(.17*RATE))/RATE
            noise=rng.normal(0,1,len(st))
            clap=(noise-np.roll(noise,1))*.5*np.exp(-st*25)
            clap+=np.sin(2*np.pi*180*st)*np.exp(-st*40)*.18
            add(at,clap,.19)
    for step in range(96):
        at=step*.25
        tt=np.arange(int(.07*RATE))/RATE
        noise=rng.normal(0,1,len(tt))
        hat=(noise-np.roll(noise,1))*np.exp(-tt*85)
        add(at,hat,.022 if step%2==0 else .04,(-.28 if step%2 else .28))
        root=roots[min(11,int(at//2))]
        freq=root*4*2**(arp[step%8]/12)
        melody=tone(freq,.48)
        gain=.055 if at<5 else .085
        add(at,melody,gain,(-.3 if step%2 else .3))
        add(at+.185,melody,gain*.20,(.5 if step%2 else -.5))
    # Smooth risers and short impact tones articulate each visual edit.
    for cut in (2.5,5,8.5,11.5,14,15,16,17,20):
        duration=.32
        tt=np.arange(int(duration*RATE))/RATE
        noise=rng.normal(0,1,len(tt))
        smooth_noise=np.convolve(noise,np.ones(9)/9,mode='same')
        sweep=(noise-smooth_noise)*np.sin(np.pi*tt/duration)**2
        add(cut-.28,sweep,.10,-.25)
        impact=tone(146.83,.26)
        add(cut,impact,.10,.2)
    # A resolving two-note signature lets the end card breathe.
    add(20,tone(293.665,1.7),.13,-.15)
    add(20.25,tone(440,1.6),.1,.15)
    fade_in=np.minimum(1,np.arange(len(audio))/(RATE*.08))
    fade_out=np.minimum(1,(len(audio)-np.arange(len(audio)))/(RATE*.8))
    audio*=np.minimum(fade_in,fade_out)[:,None]
    audio=np.tanh(audio*1.15)
    audio*=.88/max(.88,np.max(np.abs(audio)))
    pcm=(audio*32767).astype('<i2')
    path=Path(path)
    with wave.open(str(path),'wb') as wav:
        wav.setnchannels(2);wav.setsampwidth(2);wav.setframerate(RATE);wav.writeframes(pcm.tobytes())
    return float(np.max(np.abs(audio)))

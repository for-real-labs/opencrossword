"""Poop Games store panels composed from real native screenshots."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageOps,ImageFilter
import json,hashlib
ROOT=Path(__file__).resolve().parents[2]
FONTS=ROOT/'node_modules/@expo-google-fonts/dm-sans'
def font(size,bold=False):
    return ImageFont.truetype(str(FONTS/('700Bold/DMSans_700Bold.ttf' if bold else '400Regular/DMSans_400Regular.ttf')),size)
PANELS=[('Less scrolling.','More playing.','Your bathroom break, upgraded.','01-dashboard'),('A little space','to think.','Crossword · A new grid every day.','02-crossword'),('Five letters.','Six chances.','Word Guess Daily · Make every guess count.','03-word'),('One more','wave.','Galactic Raiders · Beat your best.','04-raiders')]
manifest=[]
for device,w,h in [('iphone',1320,2868),('ipad',2064,2752)]:
    dest=ROOT/'app-store/feature-images'/device
    dest.mkdir(parents=True,exist_ok=True)
    # Remove only this renderer's previously generated exports, now replaced by four panels.
    for old in dest.glob('*.png'):old.unlink()
    previews=[]
    for i,(a,b,subtitle,name) in enumerate(PANELS):
        bg=['#F4F3ED','#EAE8E2','#E5EBFA','#E6E1F2'][i]
        panel=Image.new('RGB',(w,h),bg);d=ImageDraw.Draw(panel)
        margin=int(w*.075); logo=Image.open(ROOT/'assets/icon.png').convert('RGB').resize((120,120))
        panel.paste(logo,(margin,80));d.text((margin+150,114),'POOP GAMES',font=font(42,True),fill='#191919')
        size=120 if device=='iphone' else 150;y=285
        for line in (a,b):d.text((margin,y),line,font=font(size,True),fill='#191919');y+=size+10
        subsize=36 if device=='iphone' else 46
        d.text((margin,y+30),subtitle,font=font(subsize),fill='#51514D')
        source=ROOT/'app-store/screenshots/poop'/device/(name+'.png')
        src=Image.open(source).convert('RGB')
        if device=='iphone':box=(0,180,src.width,src.height-90)
        elif i==0:box=(340,100,src.width-340,1400)
        elif i==1:box=(490,650,src.width-490,1720)
        elif i==2:box=(490,90,src.width-490,1480)
        else:box=(445,100,src.width-445,2050)
        crop=src.crop(box)
        maxw=w-2*margin;maxh=h-950
        scale=min(maxw/crop.width,maxh/crop.height)
        cw,ch=round(crop.width*scale),round(crop.height*scale)
        crop=crop.resize((cw,ch),Image.Resampling.LANCZOS);x=(w-cw)//2;y=800
        d.rounded_rectangle((x-8,y-8,x+cw+8,y+ch+8),radius=44,fill='#191919')
        mask=Image.new('L',(cw,ch));ImageDraw.Draw(mask).rounded_rectangle((0,0,cw-1,ch-1),radius=36,fill=255)
        panel.paste(crop,(x,y),mask)
        d.text((margin,h-105),'100% FREE. NEVER ANY ADS.',font=font(32,True),fill='#191919')
        d.text((w-margin-55,h-105),f'0{i+1}',font=font(32,True),fill='#191919')
        out=dest/(name+'.png');panel.save(out,optimize=True)
        previews.append(panel.resize((330,round(h*330/w))))
        manifest.append({'file':str(out.relative_to(ROOT)),'size':[w,h],'source':str(source.relative_to(ROOT)),'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'crop':box})
    sheet=Image.new('RGB',(1320,previews[0].height))
    for i,img in enumerate(previews):sheet.paste(img,(330*i,0))
    sheet.save(ROOT/'app-store/feature-images'/f'preview-{device}.jpg',quality=94)
(ROOT/'app-store/design/capture-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Rendered eight Poop Games panels from native captures.')

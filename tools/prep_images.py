import os, shutil, numpy as np
from PIL import Image, ImageFilter, ImageOps

OLD = 'C:/Users/nithi/Documents/Portfolio/old-portfolio/img/'
OUT = 'C:/Users/nithi/Documents/Portfolio/site/assets/img/'
os.makedirs(OUT, exist_ok=True)

def save(src, name, maxw=1400, fmt='JPEG', q=84):
    im = Image.open(OLD + src)
    if im.mode in ('P', 'LA'):
        im = im.convert('RGBA')
    if fmt == 'JPEG':
        if im.mode == 'RGBA':
            bg = Image.new('RGB', im.size, (255, 255, 255)); bg.paste(im, mask=im.split()[3]); im = bg
        im = im.convert('RGB')
    if im.width > maxw:
        im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
    path = OUT + name
    if fmt == 'JPEG':
        im.save(path, 'JPEG', quality=q, optimize=True, progressive=True)
    else:
        im.save(path, 'PNG', optimize=True)
    print(name, im.size, os.path.getsize(path) // 1024, 'KB')

import sys
ONLY_PORTRAIT = len(sys.argv) > 1
# ---- photos / art ----
_save = save
if ONLY_PORTRAIT:
    save = lambda *a, **k: None
save('smile.jpg', 'portrait-wide.jpg', 1600)
save('smile2.jpg', 'portrait.jpg', 1100)
save('ad1.jpg', 'brain.jpg', 1400)
for n in ['ad2.PNG:ad-typeface', 'ad3-1.jpg:ad-monogram-sketch', 'ad3-2.PNG:ad-monogram-2', 'ad3b.PNG:ad-monogram-3',
          'ad4-1.PNG:ad-emoji-1', 'ad4-2.PNG:ad-emoji-2', 'ad5-1.PNG:ad-pattern', 'ad6.PNG:ad-rand', 'ad9.png:ad-tryharder',
          'artdes176.png:ad-cover']:
    s, d = n.split(':')
    save(s, d + '.jpg', 1000)
save('csc.png', 'csc-logo-new.png', 700, 'PNG')
save('csc1.png', 'csc-logo-sym.png', 700, 'PNG')
save('cscold.png', 'csc-logo-history.png', 1000, 'PNG')
save('agenda.png', 'csc-agenda.jpg', 1500)
save('cscsiteold.png', 'csc-site-old.jpg', 1000)
save('cscsitenew.png', 'csc-site-new.jpg', 1000)
save('meme.png', 'memes-cover.jpg', 1100)
save('memes4.png', 'memes-cover-tall.jpg', 900)
save('grim.PNG', 'grim-hero.jpg', 1300)
save('toasty.png', 'grim-studio.jpg', 1100)
save('gt9.PNG', 'grim-credits.jpg', 1100)
save('gt7.PNG', 'grim-controls.jpg', 1100)
save('gt2.PNG', 'grim-playtest.png', 900, 'PNG')
save('gt5.PNG', 'grim-loop.png', 1000, 'PNG')
save('burton.jpg', 'burton.jpg', 1000)
save('rom.PNG', 'rom-score.png', 1400, 'PNG')
save('par.png', 'parsons-distractors.png', 1000, 'PNG')
save('mnist.png', 'mnist-samples.png', 600, 'PNG')
save('favi3.png', 'monogram.png', 300, 'PNG')
for n in ['gt1', 'gt3', 'gt4', 'gt6', 'gt8']:
    ext = 'PNG'
    save(n + '.PNG', 'grim-' + n + '.jpg', 1100)

save = _save
# ---- halftone portrait plates ----
im = Image.open(OLD + 'smile2.jpg').convert('RGB')
W = 1000
im = ImageOps.fit(im, (1000, 1000), centering=(0.5, 0.42))
SS = 2  # supersample
N = W * SS
big = im.resize((N, N), Image.LANCZOS)
arr = np.asarray(big, dtype=np.float32) / 255.0
lum = 0.299 * arr[..., 0] + 0.587 * arr[..., 1] + 0.114 * arr[..., 2]
# punch contrast so the face reads
# local tone mapping: CLAHE-ish via blurred-mean normalisation, then global equalise blend
from PIL import ImageOps as _IO
g = Image.fromarray((lum * 255).astype(np.uint8))
eq = np.asarray(_IO.equalize(g), dtype=np.float32) / 255.0
loc = np.asarray(g.filter(ImageFilter.GaussianBlur(120 * SS)), dtype=np.float32) / 255.0
adj = np.clip(0.5 + (lum - loc) * 1.9, 0, 1)
lum = np.clip(0.45 * eq + 0.55 * adj, 0, 1) ** 0.8
lum = np.clip(lum * 1.08 + 0.04, 0, 1)
red = np.clip(arr[..., 0] - 0.5 * (arr[..., 1] + arr[..., 2]), 0, 1) * 2.0  # redness (the plaid)

def halftone(mask_dark, cell, angle_deg, gain=1.0):
    """mask_dark 0..1 (1 = full ink). returns uint8 alpha plane."""
    h, w = mask_dark.shape
    a = np.deg2rad(angle_deg)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    c = cell * SS
    u = (xx * np.cos(a) + yy * np.sin(a)) / c
    v = (-xx * np.sin(a) + yy * np.cos(a)) / c
    fu, fv = u - np.floor(u) - 0.5, v - np.floor(v) - 0.5
    dist = np.sqrt(fu * fu + fv * fv)
    # sample darkness at the cell centre (blurred field is enough)
    m = Image.fromarray((mask_dark * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(c * 0.5))
    m = np.asarray(m, dtype=np.float32) / 255.0
    radius = 0.72 * np.sqrt(np.clip(m * gain, 0, 1))
    return (np.clip((radius - dist) * c * 0.9 + 0.5, 0, 1) * 255).astype(np.uint8)

ink_a = halftone(1 - lum, 9, 45, 1.05)
red_a = halftone(red * (0.35 + 0.65 * (1 - lum)), 9, 15, 1.0)

def plate(alpha, rgb, name):
    alpha_im = Image.fromarray(alpha).resize((W, W), Image.LANCZOS)
    out = Image.new('RGBA', (W, W), rgb + (0,))
    out.putalpha(alpha_im)
    out.save(OUT + name, optimize=True)
    print(name, os.path.getsize(OUT + name) // 1024, 'KB')

plate(ink_a, (20, 24, 28), 'portrait-ink.png')
plate(red_a, (224, 57, 43), 'portrait-red.png')
im.save(OUT + 'portrait-square.jpg', 'JPEG', quality=86, optimize=True, progressive=True)

# favicon-ish
mono = Image.open(OLD + 'favi3.png').convert('RGBA').resize((64, 64), Image.LANCZOS)
mono.save(OUT + 'favicon.png')
shutil.copy('C:/Users/nithi/Documents/Portfolio/old-portfolio/files/rom.pdf', 'C:/Users/nithi/Documents/Portfolio/site/assets/files/refrain-of-memory-carillon-arrangement.pdf')
shutil.copy('C:/Users/nithi/Documents/Portfolio/old-portfolio/files/ol.pdf', 'C:/Users/nithi/Documents/Portfolio/site/assets/files/overcoming-loneliness-essay.pdf')
shutil.copy('C:/Users/nithi/Downloads/Nithin_Weerasinghe_CV_SoDA.pdf', 'C:/Users/nithi/Documents/Portfolio/site/assets/files/Nithin_Weerasinghe_CV.pdf')
print('done')

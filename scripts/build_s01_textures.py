"""Author deterministic foliage/mist masks and optimize supplied S01 maps. Requires Pillow."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageOps
import random, math

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/textures/highway'
OUT.mkdir(parents=True, exist_ok=True)
for source, target in [
    ('asphalt/asphalt_02_diff_1k.jpg', 'asphalt-color.webp'),
    ('asphalt/asphalt_02_rough_1k.jpg', 'asphalt-roughness.webp'),
    ('asphalt/asphalt_02_disp_1k.png', 'asphalt-height.webp'),
    ('forest/forest_ground_04_diff_1k.jpg', 'ground-color.webp'),
    ('forest/forest_ground_04_disp_1k.png', 'ground-height.webp'),
]:
    im = Image.open(ROOT / 'public/textures' / source)
    if im.mode == 'I;16':
        im = ImageOps.autocontrast(im.convert('I').point(lambda value: value / 256).convert('L'))
    im = im.convert('RGB')
    im.thumbnail((1024, 1024))
    im.save(OUT / target, quality=82, method=6)

for variant in range(3):
    rng = random.Random(734 + variant * 89)
    mask = Image.new('L', (3072, 3072))
    draw = ImageDraw.Draw(mask)
    tips = []
    def branch(x, y, angle, length, width, depth):
        points = [(x, y)]
        for step in range(1, 9):
            theta = angle + math.sin(step * .27 + depth) * .14
            points.append((x + math.cos(theta) * length * step / 8, y + math.sin(theta) * length * step / 8))
        for i in range(8):
            draw.line([points[i], points[i+1]], fill=255, width=max(1, int(width * (1 - .5 * i / 8))))
        ex, ey = points[-1]
        if depth <= 0:
            tips.append((ex, ey)); return
        for side in [-1, 1]:
            branch(ex, ey, angle + side * rng.uniform(.3, .7), length * rng.uniform(.59, .79), width * .64, depth-1)
    branch(1536, 3000, -math.pi/2, 650, 44, 6)
    # Dense, irregular leaf masses around branch ends, not solid geometric crowns.
    for x, y in tips:
        radius = rng.uniform(55, 135)
        for _ in range(330):
            a = rng.random() * math.tau
            r = radius * math.sqrt(rng.random())
            lx, ly = x + math.cos(a)*r, y + math.sin(a)*r*.68
            size = rng.uniform(3, 10)
            draw.ellipse((lx-size, ly-size*.5, lx+size, ly+size*.6), fill=rng.randint(180,255))
    # Preserve a little room around the organic canopy.
    bounds = mask.getbbox()
    tree = mask.crop(bounds)
    tree.thumbnail((940, 1000))
    fitted = Image.new('L',(1024,1024))
    fitted.paste(tree, ((1024-tree.width)//2,1024-tree.height))
    rgba = Image.new('RGBA',(1024,1024),(255,255,255,0));rgba.putalpha(fitted)
    rgba.save(OUT / f'woodland-{variant}.webp', lossless=True, method=6)

rng=random.Random(807)
# Uneven atmospheric bands; transparent edges eliminate rectangular mist cards.
mist=Image.new('RGBA',(512,128),(164,185,197,0));alpha=Image.new('L',mist.size)
pixels=alpha.load()
for y in range(128):
    for x in range(512):
        envelope=math.sin(math.pi*x/511)**1.4 * math.sin(math.pi*y/127)**2
        ribbons=.55+.2*math.sin(x*.021+y*.044)+.15*math.sin(x*.043-y*.051)
        pixels[x,y]=int(110*envelope*ribbons)
alpha=alpha.filter(ImageFilter.GaussianBlur(5));mist.putalpha(alpha);mist.save(OUT/'mist.webp',lossless=True)
# Paint wear, irregular edges and pitted gaps in road markings.
paint=Image.new('RGBA',(128,512),(181,173,140,0));a=Image.new('L',paint.size);px=a.load()
for y in range(512):
    edge=4+int(3*math.sin(y*.11)+2*math.sin(y*.03))
    for x in range(128):
        if edge<x<128-edge and 8<y<503:
            px[x,y]=rng.randint(150,240) if rng.random()>.13 else rng.randint(0,50)
paint.putalpha(a);paint.save(OUT/'worn-paint.webp',lossless=True)
# Wide road edge fade with irregular erosion into the forest ground.
edge=Image.new('L',(256,512));px=edge.load()
for y in range(512):
    for x in range(256):
        inset=min(x,255-x)+2*math.sin(y*.091)+math.sin(y*.18)
        px[x,y]=int(max(0,min(255,inset/17*255)))
edge.convert('RGB').save(OUT/'road-edge.webp',quality=90)
# Low-resolution local reflection environment: cool sky, dark ground, one moon patch.
sky=Image.new('RGB',(512,256));px=sky.load()
for y in range(256):
    for x in range(512):
        upper=max(0,1-y/150)
        moon=math.exp(-(((x-95)/48)**2+((y-64)/28)**2))
        px[x,y]=(int(5+upper*58+moon*140),int(7+upper*71+moon*147),int(10+upper*88+moon*155))
sky.save(OUT/'moon-sky.jpg',quality=88)
print('Generated',len(list(OUT.iterdir())),'S01 textures;',sum(p.stat().st_size for p in OUT.iterdir())//1024,'KiB')

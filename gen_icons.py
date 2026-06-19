# -*- coding: utf-8 -*-
"""Generate PWA icons into public/. Run: python gen_icons.py"""
import os, math
from PIL import Image, ImageDraw

os.makedirs("public", exist_ok=True)
BG = (11, 12, 15)
GOLD = (199, 168, 106)

def draw_icon(size, maskable=False):
    SS = 4
    s = size * SS
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # rounded-square background (full bleed for maskable so the safe zone is filled)
    radius = int(s * (0.22 if not maskable else 0.0))
    d.rounded_rectangle([0, 0, s, s], radius=radius, fill=BG + (255,))
    # the "lens": a gold ring + center aperture, scaled into the safe zone
    scale = 0.62 if maskable else 0.74
    cx = cy = s / 2
    R = s * scale / 2
    ring = int(s * 0.045)
    d.ellipse([cx - R, cy - R, cx + R, cy + R], outline=GOLD + (255,), width=ring)
    # inner aperture blades hint: a filled center circle + subtle gap ticks
    r2 = R * 0.42
    d.ellipse([cx - r2, cy - r2, cx + r2, cy + r2], fill=GOLD + (255,))
    # six aperture ticks
    for k in range(6):
        a = math.radians(k * 60 + 15)
        x1 = cx + math.cos(a) * r2
        y1 = cy + math.sin(a) * r2
        x2 = cx + math.cos(a) * (R - ring)
        y2 = cy + math.sin(a) * (R - ring)
        d.line([x1, y1, x2, y2], fill=BG + (255,), width=int(s * 0.02))
    return img.resize((size, size), Image.LANCZOS)

draw_icon(192).save("public/icon-192.png")
draw_icon(512).save("public/icon-512.png")
draw_icon(512, maskable=True).save("public/icon-maskable-512.png")
draw_icon(180).save("public/apple-touch-icon.png")
print("icons written to public/")

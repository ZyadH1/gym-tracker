from PIL import Image, ImageDraw

TOP = (124, 92, 255)     # #7c5cff
BOTTOM = (75, 47, 255)   # #4b2fff
WHITE = (255, 255, 255, 255)


def make_icon(size, out_path, maskable=False, corner_radius_frac=0.0):
    scale = 4
    S = size * scale
    img = Image.new("RGBA", (S, S), (0, 0, 0, 255))
    draw = ImageDraw.Draw(img)

    for y in range(S):
        t = y / S
        r = int(TOP[0] + (BOTTOM[0] - TOP[0]) * t)
        g = int(TOP[1] + (BOTTOM[1] - TOP[1]) * t)
        b = int(TOP[2] + (BOTTOM[2] - TOP[2]) * t)
        draw.line([(0, y), (S, y)], fill=(r, g, b, 255))

    glyph_scale = 0.72 if maskable else 1.0
    cx, cy = S / 2, S / 2
    bar_len = S * 0.46 * glyph_scale
    bar_thick = S * 0.09 * glyph_scale
    plate_w = S * 0.15 * glyph_scale
    plate_h = S * 0.34 * glyph_scale

    glyph = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glyph)
    gdraw.rounded_rectangle(
        [cx - bar_len / 2, cy - bar_thick / 2, cx + bar_len / 2, cy + bar_thick / 2],
        radius=bar_thick / 2, fill=WHITE,
    )
    for side in (-1, 1):
        x = cx + side * (bar_len / 2 - plate_w * 0.3)
        gdraw.rounded_rectangle(
            [x - plate_w / 2, cy - plate_h / 2, x + plate_w / 2, cy + plate_h / 2],
            radius=plate_w * 0.35, fill=WHITE,
        )
        x2 = cx + side * (bar_len / 2 + plate_w * 0.55)
        plate_h2 = plate_h * 1.15
        gdraw.rounded_rectangle(
            [x2 - plate_w * 0.3, cy - plate_h2 / 2, x2 + plate_w * 0.3, cy + plate_h2 / 2],
            radius=plate_w * 0.3, fill=WHITE,
        )

    glyph = glyph.rotate(-35, resample=Image.BICUBIC, center=(cx, cy))
    img = Image.alpha_composite(img, glyph)

    if corner_radius_frac > 0:
        mask = Image.new("L", (S, S), 0)
        mdraw = ImageDraw.Draw(mask)
        mdraw.rounded_rectangle([0, 0, S, S], radius=int(S * corner_radius_frac), fill=255)
        img.putalpha(mask)

    img = img.resize((size, size), Image.LANCZOS)
    img.save(out_path)


make_icon(180, "icons/icon-180.png")
make_icon(192, "icons/icon-192.png", corner_radius_frac=0.22)
make_icon(512, "icons/icon-512.png", corner_radius_frac=0.22)
make_icon(512, "icons/icon-512-maskable.png", maskable=True)

print("done")

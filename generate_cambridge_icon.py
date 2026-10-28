#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate prestigious Cambridge-style academic app icon for Ryan & Jad (R·J) Study Hub.
Supersampled at 1024x1024 and downscaled with LANCZOS for ultra-crisp mobile display.
"""

import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_icon(size=512, maskable=False):
    # Work at 2x resolution (1024x1024) for supersampled anti-aliasing
    S = 1024
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Background: Deep Cambridge Royal Midnight Navy Gradient
    bg_img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    bg_draw = ImageDraw.Draw(bg_img)
    
    # Rounded squircle for standard icon, full bleed for maskable
    corner_radius = 0 if maskable else 210
    
    for y in range(S):
        factor = y / S
        # Gradient from Deep Navy (top: 15, 23, 42) -> Royal Sapphire (middle: 30, 58, 138) -> Dark Obsidian (bottom: 11, 15, 25)
        if factor < 0.55:
            t = factor / 0.55
            r = int(12 + t * (28 - 12))
            g = int(22 + t * (58 - 22))
            b = int(48 + t * (138 - 48))
        else:
            t = (factor - 0.55) / 0.45
            r = int(28 - t * (28 - 10))
            g = int(58 - t * (58 - 18))
            b = int(138 - t * (138 - 35))
        bg_draw.line([(0, y), (S, y)], fill=(r, g, b, 255))

    # Mask to rounded squircle if not maskable
    if not maskable:
        mask = Image.new("L", (S, S), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.rounded_rectangle([(0, 0), (S, S)], radius=corner_radius, fill=255)
        img.paste(bg_img, (0, 0), mask)
    else:
        img.paste(bg_img, (0, 0))

    draw = ImageDraw.Draw(img)

    # Center coordinates & scale factor
    cx, cy = S // 2, S // 2
    scale = 0.82 if maskable else 0.94  # Maskable safe-zone padding (80% safe zone)

    # 2. Outer Subtle Golden Ring / Border
    border_inset = int(24 * scale) if not maskable else int(90 * scale)
    border_radius = int(corner_radius - 24) if not maskable else int(corner_radius)
    if not maskable:
        draw.rounded_rectangle(
            [(border_inset, border_inset), (S - border_inset, S - border_inset)],
            radius=border_radius,
            outline=(245, 158, 11, 140), # Warm gold amber
            width=int(6 * scale)
        )

    # 3. Cambridge Academic Shield Geometry
    # Top-left (x1, y1), Top-right (x2, y1), Bottom-point (cx, y_point)
    sw = int(320 * scale) # half width
    top_y = cy - int(240 * scale)
    mid_y = cy + int(40 * scale)
    bottom_y = cy + int(290 * scale)

    shield_pts = [
        (cx - sw, top_y),
        (cx - sw + int(40 * scale), top_y - int(25 * scale)),
        (cx, top_y - int(10 * scale)),
        (cx + sw - int(40 * scale), top_y - int(25 * scale)),
        (cx + sw, top_y),
        (cx + sw, mid_y),
        (cx, bottom_y),
        (cx - sw, mid_y),
        (cx - sw, top_y)
    ]

    # Shield Shadow (soft blur effect)
    shadow_img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow_img)
    s_pts = [(x, y + int(14 * scale)) for (x, y) in shield_pts]
    s_draw.polygon(s_pts, fill=(0, 0, 0, 160))
    shadow_img = shadow_img.filter(ImageFilter.GaussianBlur(int(18 * scale)))
    img = Image.alpha_composite(img, shadow_img)
    draw = ImageDraw.Draw(img)

    # Shield Gradient Fill (Rich Cambridge Royal Midnight Navy)
    shield_fill_img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    sf_draw = ImageDraw.Draw(shield_fill_img)
    sf_draw.polygon(shield_pts, fill=(20, 35, 75, 255))
    
    # Internal shield gradient overlay
    for y in range(top_y - int(30 * scale), bottom_y + 10):
        t = (y - (top_y - int(30 * scale))) / (bottom_y - top_y + int(40 * scale))
        t = max(0.0, min(1.0, t))
        r = int(30 + t * (15 - 30))
        g = int(58 + t * (28 - 58))
        b = int(138 + t * (75 - 138))
        sf_draw.line([(cx - sw, y), (cx + sw, y)], fill=(r, g, b, int(180 + t * 50)))

    # Mask internal shield
    s_mask = Image.new("L", (S, S), 0)
    ImageDraw.Draw(s_mask).polygon(shield_pts, fill=255)
    img.paste(shield_fill_img, (0, 0), s_mask)
    draw = ImageDraw.Draw(img)

    # Golden Shield Border (Double Trim)
    draw.polygon(shield_pts, outline=(245, 158, 11, 255), width=int(10 * scale))
    # Inner gold hairline
    inner_pts = [
        (cx - sw + int(14 * scale), top_y + int(10 * scale)),
        (cx - sw + int(46 * scale), top_y - int(12 * scale)),
        (cx, top_y + int(2 * scale)),
        (cx + sw - int(46 * scale), top_y - int(12 * scale)),
        (cx + sw - int(14 * scale), top_y + int(10 * scale)),
        (cx + sw - int(14 * scale), mid_y - int(5 * scale)),
        (cx, bottom_y - int(20 * scale)),
        (cx - sw + int(14 * scale), mid_y - int(5 * scale)),
        (cx - sw + int(14 * scale), top_y + int(10 * scale))
    ]
    draw.polygon(inner_pts, outline=(254, 240, 138, 140), width=int(3 * scale))

    # 4. Laurel Leaves (Left & Right Flanking the Shield)
    def draw_laurel_leaf(center_x, center_y, angle_deg, leaf_len, leaf_w):
        rad = math.radians(angle_deg)
        cos_a, sin_a = math.cos(rad), math.sin(rad)
        p1 = (center_x - leaf_len * cos_a, center_y - leaf_len * sin_a)
        p2 = (center_x + leaf_len * cos_a, center_y + leaf_len * sin_a)
        # perpendicular
        perp_x, perp_y = -sin_a * leaf_w, cos_a * leaf_w
        c1 = (center_x + perp_x, center_y + perp_y)
        c2 = (center_x - perp_x, center_y - perp_y)
        draw.polygon([p1, c1, p2, c2], fill=(251, 191, 36, 230), outline=(217, 119, 6, 255))

    for i in range(5):
        prog = (i + 1) / 6.0
        angle = 45 - i * 18
        lx = cx - sw - int((25 - i * 4) * scale)
        ly = top_y + int(prog * (bottom_y - top_y) * 0.75)
        draw_laurel_leaf(lx, ly, angle, int(22 * scale), int(10 * scale))
        rx = cx + sw + int((25 - i * 4) * scale)
        draw_laurel_leaf(rx, ly, -angle, int(22 * scale), int(10 * scale))

    # 5. Top Crown / Cambridge Checkpoint Academic Star
    star_y = top_y - int(65 * scale)
    star_r_out = int(48 * scale)
    star_r_in = int(22 * scale)
    star_pts = []
    for step in range(10):
        angle = step * (math.pi / 5) - math.pi / 2
        r = star_r_out if step % 2 == 0 else star_r_in
        star_pts.append((cx + r * math.cos(angle), star_y + r * math.sin(angle)))
    
    # Star shadow & fill
    star_shadow = [(x, y + 4) for (x, y) in star_pts]
    draw.polygon(star_shadow, fill=(0, 0, 0, 120))
    draw.polygon(star_pts, fill=(254, 240, 138, 255), outline=(217, 119, 6, 255), width=int(3 * scale))

    # Small satellite stars (flanking main star)
    for offset_x in [-int(75 * scale), int(75 * scale)]:
        s_y = star_y + int(18 * scale)
        s_pts = []
        for step in range(10):
            angle = step * (math.pi / 5) - math.pi / 2
            r = int(24 * scale) if step % 2 == 0 else int(11 * scale)
            s_pts.append((cx + offset_x + r * math.cos(angle), s_y + r * math.sin(angle)))
        draw.polygon(s_pts, fill=(251, 191, 36, 240), outline=(180, 83, 9, 230), width=int(2 * scale))

    # 6. Central Monogram: "R · J" (Ryan & Jad)
    # Using prestigious Serif font (Georgia Bold)
    font_size = int(145 * scale)
    try:
        font_main = ImageFont.truetype("C:/Windows/Fonts/georgiab.ttf", font_size)
        font_sub = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", int(36 * scale))
        font_cambridge = ImageFont.truetype("C:/Windows/Fonts/georgiab.ttf", int(28 * scale))
    except Exception:
        font_main = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_cambridge = ImageFont.load_default()

    # Text Shadow
    mono_y = cy - int(95 * scale)
    text_shadow = "R · J"
    
    bbox = draw.textbbox((0, 0), text_shadow, font=font_main)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = cx - tw // 2
    ty = mono_y

    # Drop shadow
    draw.text((tx + 4, ty + 6), text_shadow, font=font_main, fill=(0, 0, 0, 180))
    # Main Gold Monogram with highlight
    draw.text((tx, ty), text_shadow, font=font_main, fill=(254, 243, 199, 255))
    # Inner warm gold glow
    draw.text((tx, ty), text_shadow, font=font_main, fill=(251, 191, 36, 120))

    # Sub-caption: "RYAN & JAD" in delicate spaced typography
    sub_text = "RYAN  &  JAD"
    s_bbox = draw.textbbox((0, 0), sub_text, font=font_cambridge)
    s_tw = s_bbox[2] - s_bbox[0]
    draw.text((cx - s_tw // 2, ty + th + int(24 * scale)), sub_text, font=font_cambridge, fill=(226, 232, 240, 230))

    # 7. Open Academic Book Illustration
    book_y = cy + int(85 * scale)
    bw = int(110 * scale) # half width
    bh = int(60 * scale)

    # Book pages left & right
    left_page = [
        (cx - int(6 * scale), book_y),
        (cx - bw, book_y + int(12 * scale)),
        (cx - bw, book_y + bh),
        (cx - int(6 * scale), book_y + bh - int(12 * scale))
    ]
    right_page = [
        (cx + int(6 * scale), book_y),
        (cx + bw, book_y + int(12 * scale)),
        (cx + bw, book_y + bh),
        (cx + int(6 * scale), book_y + bh - int(12 * scale))
    ]

    # Draw pages
    draw.polygon(left_page, fill=(248, 250, 252, 245), outline=(203, 213, 225, 255), width=int(2 * scale))
    draw.polygon(right_page, fill=(241, 245, 249, 245), outline=(203, 213, 225, 255), width=int(2 * scale))
    # Center spine
    draw.line([(cx, book_y), (cx, book_y + bh - int(8 * scale))], fill=(148, 163, 184, 255), width=int(4 * scale))
    # Red/Gold Bookmark ribbon
    ribbon_pts = [
        (cx - int(5 * scale), book_y + int(2 * scale)),
        (cx + int(5 * scale), book_y + int(2 * scale)),
        (cx + int(7 * scale), book_y + bh + int(26 * scale)),
        (cx, book_y + bh + int(14 * scale)),
        (cx - int(7 * scale), book_y + bh + int(26 * scale))
    ]
    draw.polygon(ribbon_pts, fill=(225, 29, 72, 255), outline=(159, 18, 57, 255), width=int(1 * scale))

    # 8. Prestigious Golden Bottom Ribbon: "STUDY HUB"
    rib_y = bottom_y - int(45 * scale)
    rw = int(220 * scale)
    rh = int(62 * scale)

    # Ribbon banner polygon
    rib_pts = [
        (cx - rw, rib_y),
        (cx + rw, rib_y),
        (cx + rw + int(18 * scale), rib_y + rh // 2),
        (cx + rw, rib_y + rh),
        (cx - rw, rib_y + rh),
        (cx - rw - int(18 * scale), rib_y + rh // 2)
    ]
    # Ribbon Shadow
    draw.polygon([(x, y + 4) for (x, y) in rib_pts], fill=(0, 0, 0, 140))
    # Ribbon Gold Gradient
    draw.polygon(rib_pts, fill=(245, 158, 11, 255), outline=(254, 240, 138, 255), width=int(3 * scale))

    # Ribbon Text: "STUDY HUB"
    rib_text = "STUDY HUB"
    rt_bbox = draw.textbbox((0, 0), rib_text, font=font_sub)
    rt_w = rt_bbox[2] - rt_bbox[0]
    rt_h = rt_bbox[3] - rt_bbox[1]
    draw.text((cx - rt_w // 2, rib_y + (rh - rt_h) // 2 - 2), rib_text, font=font_sub, fill=(15, 23, 42, 255))

    # Downsample from 1024 to requested size (LANCZOS for premium sharpness)
    result = img.resize((size, size), Image.Resampling.LANCZOS)
    return result

if __name__ == "__main__":
    import os
    os.makedirs("icons", exist_ok=True)
    
    print("Generating 512x512 standard app icon...")
    icon512 = create_icon(size=512, maskable=False)
    icon512.save("icons/icon-512.png", "PNG", optimize=True)

    print("Generating 512x512 maskable app icon...")
    mask512 = create_icon(size=512, maskable=True)
    mask512.save("icons/maskable-512.png", "PNG", optimize=True)

    print("Generating 192x192 app icon...")
    icon192 = create_icon(size=192, maskable=False)
    icon192.save("icons/icon-192.png", "PNG", optimize=True)

    print("Generating Apple touch icon...")
    icon180 = create_icon(size=180, maskable=False)
    icon180.save("icons/apple-touch-icon.png", "PNG", optimize=True)

    print("Generating favicon...")
    icon64 = create_icon(size=64, maskable=False)
    icon64.save("icons/favicon.png", "PNG", optimize=True)

    print("✅ All icons generated successfully!")


import os
from PIL import Image

pairs = [
    (r"C:\Users\Erick\.gemini\antigravity\brain\f07f77c0-71cf-4fae-afac-5a25d863cc2a\granite_sprite_1789943175134.jpg", "public/items/granite.png"),
    (r"C:\Users\Erick\.gemini\antigravity\brain\f07f77c0-71cf-4fae-afac-5a25d863cc2a\bronze_ingot_sprite_1789943189682.jpg", "public/items/bronze_ingot.png"),
    (r"C:\Users\Erick\.gemini\antigravity\brain\f07f77c0-71cf-4fae-afac-5a25d863cc2a\silver_ingot_sprite_1789943203315.jpg", "public/items/silver_ingot.png"),
    (r"C:\Users\Erick\.gemini\antigravity\brain\f07f77c0-71cf-4fae-afac-5a25d863cc2a\gears_sprite_1789943219753.jpg", "public/items/gears.png"),
    (r"C:\Users\Erick\.gemini\antigravity\brain\f07f77c0-71cf-4fae-afac-5a25d863cc2a\piece_of_sail_sprite_1789943235974.jpg", "public/items/piece_of_sail.png"),
    (r"C:\Users\Erick\.gemini\antigravity\brain\f07f77c0-71cf-4fae-afac-5a25d863cc2a\soul_crystal_sprite_1789943251066.jpg", "public/items/soul_crystal.png"),
    (r"C:\Users\Erick\.gemini\antigravity\brain\f07f77c0-71cf-4fae-afac-5a25d863cc2a\boat_figurehead_sprite_1789943267676.jpg", "public/items/boat_figurehead.png"),
    (r"C:\Users\Erick\.gemini\antigravity\brain\f07f77c0-71cf-4fae-afac-5a25d863cc2a\gunpowder_sprite_1789943286246.jpg", "public/items/gunpowder.png"),
]

def make_transparent(src, dest):
    img = Image.open(src).convert("RGBA")
    w, h = img.size
    pix = img.load()

    # Flood fill from 4 borders for white background
    visited = set()
    queue = []

    for x in range(w):
        queue.append((x, 0))
        queue.append((x, h - 1))
        visited.add((x, 0))
        visited.add((x, h - 1))

    for y in range(h):
        queue.append((0, y))
        queue.append((w - 1, y))
        visited.add((0, y))
        visited.add((w - 1, y))

    threshold = 230

    while queue:
        cx, cy = queue.pop()
        r, g, b, a = pix[cx, cy]

        # If near white background
        if r >= threshold and g >= threshold and b >= threshold:
            pix[cx, cy] = (0, 0, 0, 0)

            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = cx + dx, cy + dy
                if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in visited:
                    visited.add((nx, ny))
                    queue.append((nx, ny))

    # Resize to clean 256x256 for optimal loading
    img_resized = img.resize((256, 256), Image.Resampling.LANCZOS)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    img_resized.save(dest, "PNG")
    print(f"[OK] Saved transparent sprite: {dest}")

for src, dest in pairs:
    if os.path.exists(src):
        make_transparent(src, dest)
    else:
        print(f"[!] Not found: {src}")

print("All transparent sprites generated successfully!")

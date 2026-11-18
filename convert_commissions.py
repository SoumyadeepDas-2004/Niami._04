from pathlib import Path
from PIL import Image

folder = Path("assets/images/artworks/raw")
output_folder = folder / "webp"

output_folder.mkdir(exist_ok=True)

extensions = {".jpg", ".jpeg"}
images = sorted(
    [p for p in folder.iterdir() if p.suffix.lower() in extensions],
    key=lambda p: p.name.lower()
)

original_total = 0
webp_total = 0

for number, image_path in enumerate(images, start=1):
    output_path = output_folder / f"{number}.webp"

    with Image.open(image_path) as image:
        image.save(
            output_path,
            "WEBP",
            quality=90,
            method=6
        )

    original_total += image_path.stat().st_size
    webp_total += output_path.stat().st_size

    print(f"{image_path.name} → {number}.webp")

saved = original_total - webp_total
percentage = saved / original_total * 100 if original_total else 0

print("\n--- CONVERSION SUMMARY ---")
print(f"Images converted: {len(images)}")
print(f"Original size: {original_total / 1024 / 1024:.2f} MB")
print(f"WebP size: {webp_total / 1024 / 1024:.2f} MB")
print(f"Space saved: {saved / 1024 / 1024:.2f} MB")
print(f"Reduction: {percentage:.2f}%")
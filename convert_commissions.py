
from pathlib import Path
from PIL import Image

folder = Path("assets/images/background")

for png_path in folder.glob("*.png"):
    webp_path = png_path.with_suffix(".webp")

    with Image.open(png_path) as image:
        image.save(
            webp_path,
            "WEBP",
            quality=85,
            method=6
        )

    print(f"Converted: {png_path.name} → {webp_path.name}")

print("\nAll commission images converted successfully!")
print("Original PNG files have been preserved.")


import json
from pathlib import Path
from PIL import Image, ImageOps

# Project paths
artwork_dir = Path("assets/images/artworks")
thumbnail_dir = artwork_dir / "thumbnails"
json_path = Path("data/artworks.json")

# Create thumbnails folder
thumbnail_dir.mkdir(parents=True, exist_ok=True)

# Load artwork data
with json_path.open("r", encoding="utf-8") as file:
    artworks = json.load(file)

# Generate thumbnails
for artwork in artworks:
    source = Path(artwork["image"])
    thumbnail_path = thumbnail_dir / f"{source.stem}.webp"

    if not source.exists():
        print(f"Missing source image: {source}")
        continue

    with Image.open(source) as image:
        image = ImageOps.exif_transpose(image)

        thumbnail = ImageOps.fit(
            image,
            (480, 640),
            method=Image.Resampling.LANCZOS,
            centering=(0.5, 0.5)
        )

        thumbnail.save(
            thumbnail_path,
            "WEBP",
            quality=82,
            method=6
        )

    # Add thumbnail path to JSON
    artwork["thumbnail"] = (
        f"assets/images/artworks/thumbnails/{source.stem}.webp"
    )

    print(f"Created: {thumbnail_path}")

# Save updated JSON
with json_path.open("w", encoding="utf-8") as file:
    json.dump(artworks, file, indent=2, ensure_ascii=False)

print("\nThumbnail generation completed!")
print("Original artwork images remain unchanged.")

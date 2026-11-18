import json
from pathlib import Path
from PIL import Image, ImageOps

# Project paths
artwork_dir = Path("assets/images/artworks")
raw_dir = artwork_dir / "raw" / "webp"
thumbnail_dir = artwork_dir / "thumbnails"
json_path = Path("data/artworks.json")

# Create thumbnails folder
thumbnail_dir.mkdir(parents=True, exist_ok=True)

# Find all WebP artwork images
images = sorted(
    raw_dir.glob("*.webp"),
    key=lambda p: int(p.stem) if p.stem.isdigit() else p.stem.lower()
)

# Generate thumbnails for every image
for source in images:
    thumbnail_path = thumbnail_dir / source.name

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

    print(f"Created: {thumbnail_path}")

# Update matching artwork entries in JSON
with json_path.open("r", encoding="utf-8") as file:
    artworks = json.load(file)

for artwork in artworks:
    source = Path(artwork["image"])
    thumbnail_name = f"{source.stem}.webp"

    if (thumbnail_dir / thumbnail_name).exists():
        artwork["thumbnail"] = (
            f"assets/images/artworks/thumbnails/{thumbnail_name}"
        )

# Save updated JSON
with json_path.open("w", encoding="utf-8") as file:
    json.dump(artworks, file, indent=2, ensure_ascii=False)

print("\n--- THUMBNAIL SUMMARY ---")
print(f"WebP images found: {len(images)}")
print(f"Thumbnails generated: {len(images)}")
print(f"JSON artwork entries: {len(artworks)}")
print("Original artwork images remain unchanged.")
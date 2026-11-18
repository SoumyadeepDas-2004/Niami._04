
import json
from pathlib import Path

# Project paths
webp_dir = Path("assets/images/artworks/raw/webp")
json_path = Path("data/artworks.json")

# Find all WebP images in numerical order
images = sorted(
    webp_dir.glob("*.webp"),
    key=lambda p: int(p.stem) if p.stem.isdigit() else p.stem.lower()
)

# Generate artwork entries
artworks = []

for index, image_path in enumerate(images, start=1):
    artwork = {
        "id": index,
        "title": f"Artwork {index}",
        "image": f"assets/images/artworks/raw/webp/{image_path.name}",
        "category": "Digital Art",
        "featured": False,
        "selected": False,
        "order": index,
        "thumbnail": f"assets/images/artworks/thumbnails/{image_path.stem}.webp"
    }

    artworks.append(artwork)

# Create data directory if necessary
json_path.parent.mkdir(parents=True, exist_ok=True)

# Save JSON
with json_path.open("w", encoding="utf-8") as file:
    json.dump(artworks, file, indent=2, ensure_ascii=False)

print("\n--- ARTWORK JSON SUMMARY ---")
print(f"Images found: {len(images)}")
print(f"JSON entries generated: {len(artworks)}")
print(f"Output: {json_path}")
print("\nArtwork entries generated successfully!")

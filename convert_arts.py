
# from pathlib import Path
# from PIL import Image, ImageChops
# import re

# image_dir = Path("assets/images/artworks")
# json_file = Path("data/artworks.json")

# total_original = 0
# total_webp = 0

# for png_file in sorted(image_dir.glob("*.png")):
#     webp_file = png_file.with_suffix(".webp")

#     with Image.open(png_file) as original:
#         original.load()

#         options = {
#             "format": "WEBP",
#             "lossless": True,
#             "method": 6,
#         }

#         if original.info.get("icc_profile"):
#             options["icc_profile"] = original.info["icc_profile"]

#         if original.info.get("exif"):
#             options["exif"] = original.info["exif"]

#         original.save(webp_file, **options)

#     # Verify that decoded pixels are identical.
#     with Image.open(png_file) as source, Image.open(webp_file) as converted:
#         source_pixels = source.convert("RGBA")
#         converted_pixels = converted.convert("RGBA")

#         if source_pixels.size != converted_pixels.size:
#             raise RuntimeError(f"Dimension mismatch: {png_file.name}")

#         difference = ImageChops.difference(
#             source_pixels, converted_pixels
#         )

#         if difference.getbbox():
#             webp_file.unlink(missing_ok=True)
#             raise RuntimeError(f"Pixel mismatch: {png_file.name}")

#     original_size = png_file.stat().st_size
#     webp_size = webp_file.stat().st_size

#     total_original += original_size
#     total_webp += webp_size

#     print(
#         f"{png_file.name}: "
#         f"{original_size / 1024:.1f} KB -> "
#         f"{webp_size / 1024:.1f} KB | Verified"
#     )

# # Update only artwork image references in artworks.json.
# content = json_file.read_text(encoding="utf-8")

# updated_content = re.sub(
#     r"(assets/images/artworks/[^\"']+)\.png",
#     r"\1.webp",
#     content
# )

# json_file.write_text(updated_content, encoding="utf-8")

# print("\nConversion completed.")
# print(f"Original total: {total_original / 1024 / 1024:.2f} MB")
# print(f"WebP total:     {total_webp / 1024 / 1024:.2f} MB")
# print(f"Space saved:    {(total_original-total_webp) / 1024 / 1024:.2f} MB")
# print("Original PNG files have been preserved.")

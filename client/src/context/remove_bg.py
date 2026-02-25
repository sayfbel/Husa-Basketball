import sys
from rembg import remove
from PIL import Image

if len(sys.argv) < 3:
    print("Usage: python remove_bg.py <input_path> <output_path>")
    sys.exit(1)

input_path = sys.argv[1]
output_path = sys.argv[2]

# Open the image
try:
    input_image = Image.open(input_path)
except Exception as e:
    print(f"Error opening image: {e}")
    sys.exit(1)

# Remove background
try:
    output_image = remove(input_image)
    # Save as PNG (important to keep transparency)
    output_image.save(output_path)
    print("Success")
except Exception as e:
    print(f"Error removing background: {e}")
    sys.exit(1)
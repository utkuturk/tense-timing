import os
import zipfile
import math

IMG_DIR = 'experiments/norming/chunk_includes/img'
ZIP_BASE = 'experiments/norming/chunk_includes/images_part'
MAX_SIZE = 45 * 1024 * 1024  # 45MB to be safe

def split_images():
    files = [f for f in os.listdir(IMG_DIR) if f.endswith('.png')]
    files.sort()
    
    current_zip_idx = 1
    current_zip_size = 0
    current_files = []

    for filename in files:
        filepath = os.path.join(IMG_DIR, filename)
        filesize = os.path.getsize(filepath)
        
        if current_zip_size + filesize > MAX_SIZE:
            # Write current batch
            create_zip(current_zip_idx, current_files)
            current_zip_idx += 1
            current_files = []
            current_zip_size = 0
        
        current_files.append(filename)
        current_zip_size += filesize
    
    # Write last batch
    if current_files:
        create_zip(current_zip_idx, current_files)

    return current_zip_idx

def create_zip(idx, filenames):
    zip_name = f"{ZIP_BASE}_{idx}.zip"
    print(f"Creating {zip_name} with {len(filenames)} files...")
    with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zf:
        for fname in filenames:
            # Arcname should be just the filename so they unzip flat or are accessed flat
            # But wait, PCIbex PreloadZip unzips them. 
            # If we used 'zip -j', it ignores paths.
            zf.write(os.path.join(IMG_DIR, fname), fname)

if __name__ == "__main__":
    count = split_images()
    print(f"Total zip files created: {count}")
    # Print the PreloadZip lines for main.js
    print("\nSelect the following lines to update main.js:")
    for i in range(1, count + 1):
        print(f'PreloadZip("https://raw.githubusercontent.com/utkuturk/tense-timing/main/experiments/norming/chunk_includes/images_part_{i}.zip");')

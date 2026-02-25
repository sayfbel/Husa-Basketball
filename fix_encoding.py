import os
import glob
import codecs

def fix_encoding(directory):
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in root or '.git' in root or '.venv' in root or 'dist' in root:
            continue
        for file in files:
            if file.endswith('.js') or file.endswith('.jsx'):
                path = os.path.join(root, file)
                try:
                    with open(path, 'rb') as f:
                        raw = f.read()
                    
                    if raw.startswith(codecs.BOM_UTF16_LE):
                        content = raw.decode('utf-16-le')
                        with open(path, 'w', encoding='utf-8', newline='') as f:
                            f.write(content)
                        print(f"Fixed UTF-16LE encoding: {path}")
                    elif raw.startswith(codecs.BOM_UTF16_BE):
                        content = raw.decode('utf-16-be')
                        with open(path, 'w', encoding='utf-8', newline='') as f:
                            f.write(content)
                        print(f"Fixed UTF-16BE encoding: {path}")
                except Exception as e:
                    print(f"Error on {path}: {e}")

fix_encoding('c:/Users/hamza/Desktop/husa-basketball')

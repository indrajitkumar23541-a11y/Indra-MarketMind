import os
import glob

for filepath in glob.glob('dashboard/**/*.py', recursive=True):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    if '\\"\\"\\"' in content:
        content = content.replace('\\"\\"\\"', '"""')
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {filepath}")

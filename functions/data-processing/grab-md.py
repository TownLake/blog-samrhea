#!/usr/bin/env python3
import os
import shutil
import yaml

def has_reading_tag(filepath):
    """
    Returns True if the file's YAML front matter includes the tag "reading".
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return False

    # Check if the file starts with YAML front matter
    if not lines or lines[0].strip() != '---':
        return False  # no front matter, so we assume no tag

    # Gather YAML lines until the closing '---'
    yaml_lines = []
    for line in lines[1:]:
        if line.strip() == '---':
            break
        yaml_lines.append(line)
    yaml_content = ''.join(yaml_lines)

    try:
        front_matter = yaml.safe_load(yaml_content)
    except Exception as e:
        print(f"Error parsing YAML in {filepath}: {e}")
        return False

    if not front_matter:
        return False

    tags = front_matter.get('tags', [])
    # If tags is a string, convert to a list for uniformity.
    if isinstance(tags, str):
        tags = [tags]

    # Normalize the tags to lower-case and check if "reading" is present.
    return any(tag.lower() == "reading" for tag in tags)

def main():
    # Define your repository's root (this example uses the current working directory)
    repo_path = os.getcwd()  # or set this to your repo's path

    # Define the destination folder on your desktop
    desktop = os.path.expanduser("~/Desktop")
    dest_folder = os.path.join(desktop, "filtered_index_files")
    os.makedirs(dest_folder, exist_ok=True)

    for root, dirs, files in os.walk(repo_path):
        for file in files:
            if file == "index.md":
                file_path = os.path.join(root, file)
                if not has_reading_tag(file_path):
                    # Compute the relative path from the repo root
                    rel_dir = os.path.relpath(root, repo_path)
                    dest_dir = os.path.join(dest_folder, rel_dir)
                    os.makedirs(dest_dir, exist_ok=True)
                    shutil.copy2(file_path, os.path.join(dest_dir, file))
                    print(f"Copied: {file_path} -> {os.path.join(dest_dir, file)}")
                else:
                    print(f"Skipping (has reading tag): {file_path}")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
import os
import re
import shutil
import yaml

def slugify(text):
    """
    Convert text to a slug suitable for filenames.
    This lowercases, removes non-alphanumeric characters (except hyphens),
    and replaces spaces with hyphens.
    """
    # Lowercase the text
    text = text.lower()
    # Remove any character that is not alphanumeric, space, or hyphen.
    text = re.sub(r'[^\w\s-]', '', text)
    # Replace spaces and repeated hyphens with a single hyphen
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')

def parse_front_matter(filepath):
    """
    Parses the YAML front matter from a Markdown file.
    Returns the front matter as a dictionary or None if it can't be parsed.
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return None

    if not lines or lines[0].strip() != '---':
        return None

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
        return None

    return front_matter

def has_reading_tag(front_matter):
    """
    Returns True if the front matter includes the tag "reading".
    """
    if not front_matter:
        return False
    tags = front_matter.get('tags', [])
    if isinstance(tags, str):
        tags = [tags]
    return any(tag.lower() == "reading" for tag in tags)

def main():
    # Define the repository root (change this if needed)
    repo_path = os.getcwd()  # Or set this to the repository's path

    # Destination folder on the Desktop (all files go into one folder)
    desktop = os.path.expanduser("~/Desktop")
    dest_folder = os.path.join(desktop, "filtered_index_files_single")
    os.makedirs(dest_folder, exist_ok=True)

    # Keep track of filenames to avoid duplicates
    filename_counts = {}

    for root, dirs, files in os.walk(repo_path):
        for file in files:
            if file == "index.md":
                file_path = os.path.join(root, file)
                front_matter = parse_front_matter(file_path)
                if front_matter and has_reading_tag(front_matter):
                    print(f"Skipping (has reading tag): {file_path}")
                    continue

                # Extract date and title from the front matter
                date = front_matter.get('date', None) if front_matter else None
                title = front_matter.get('title', None) if front_matter else None

                if not date or not title:
                    print(f"Skipping (missing date or title): {file_path}")
                    continue

                new_filename = f"{date}-{slugify(title)}.md"

                # Check for duplicates and append a counter if needed
                if new_filename in filename_counts:
                    filename_counts[new_filename] += 1
                    name, ext = os.path.splitext(new_filename)
                    new_filename = f"{name}-{filename_counts[new_filename]}{ext}"
                else:
                    filename_counts[new_filename] = 1

                dest_file_path = os.path.join(dest_folder, new_filename)
                shutil.copy2(file_path, dest_file_path)
                print(f"Copied: {file_path} -> {dest_file_path}")

if __name__ == "__main__":
    main()
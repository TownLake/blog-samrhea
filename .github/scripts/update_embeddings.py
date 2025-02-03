#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
import subprocess
import sys
from datetime import datetime, timezone

import requests
import yaml

# -----------------------------------------------------------------------------
# YAML Front Matter Parsing
# -----------------------------------------------------------------------------
def parse_front_matter(content):
    """
    If the file begins with YAML front matter (delimited by '---'),
    this function parses it and returns a tuple of (front_matter_dict, remaining_content).
    If no front matter is found, returns ({}, content).
    """
    if content.startswith('---'):
        lines = content.splitlines()
        fm_lines = []
        # Start after the first '---'
        i = 1
        while i < len(lines) and lines[i].strip() != '---':
            fm_lines.append(lines[i])
            i += 1
        # Skip the closing '---'
        rest = "\n".join(lines[i+1:]) if i < len(lines) else ""
        try:
            fm = yaml.safe_load("\n".join(fm_lines))
        except Exception as e:
            print("Error parsing YAML front matter:", e, file=sys.stderr)
            fm = {}
        return fm if isinstance(fm, dict) else {}, rest
    else:
        return {}, content

# -----------------------------------------------------------------------------
# Cloudflare Workers AI Embedding API Settings
# -----------------------------------------------------------------------------
def get_embedding(text, account_id, ai_token):
    url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/@cf/baai/bge-base-en-v1.5"
    payload = {"text": text}
    headers = {
        "Authorization": f"Bearer {ai_token}",
        "Content-Type": "application/json"
    }
    try:
        response = requests.post(url, json=payload, headers=headers)
        # Log the complete response for debugging
        print("Embedding API response status:", response.status_code)
        print("Embedding API response headers:", response.headers)
        print("Embedding API response text:", response.text)
        response.raise_for_status()
        data = response.json()
        # The embedding may be returned under "embedding" or "result"
        embedding = data.get("embedding") or data.get("result")
        if embedding is None:
            print("Error: No embedding found in AI API response.", file=sys.stderr)
            sys.exit(1)
        return embedding
    except Exception as e:
        print("Error calling Cloudflare Workers AI embedding API:", e, file=sys.stderr)
        sys.exit(1)

# -----------------------------------------------------------------------------
# Functions for Processing Blog Post Files
# -----------------------------------------------------------------------------
def generate_document_id(file_path):
    """Generates a unique document ID from the file path using an MD5 hash."""
    return hashlib.md5(file_path.encode("utf-8")).hexdigest()

def extract_title(content, file_path):
    """
    Fallback: Extracts the title from the content (first Markdown header)
    or uses the file name if no header is found.
    """
    for line in content.splitlines():
        if line.startswith("#"):
            return line.lstrip("#").strip()
    return os.path.basename(file_path)

def get_changed_posts():
    """Uses git to determine which files under 'posts/' have changed."""
    try:
        result = subprocess.run(
            ["git", "diff", "--name-only", "HEAD~1", "HEAD"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=True
        )
        files = result.stdout.splitlines()
        return [f for f in files if f.startswith("posts/") and f.endswith(".md")]
    except subprocess.CalledProcessError as e:
        print("Error getting changed files:", e.stderr, file=sys.stderr)
        sys.exit(1)

def process_file(file_path, account_id, ai_token):
    print("Processing file:", file_path)
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        print("Error reading", file_path, ":", e, file=sys.stderr)
        return None

    # Parse YAML front matter if present
    front_matter, main_content = parse_front_matter(content)

    print("Generating embedding...")
    embedding = get_embedding(main_content, account_id, ai_token)
    
    # If the embedding is wrapped (with "data"), extract the vector.
    if isinstance(embedding, dict) and "data" in embedding:
        if isinstance(embedding["data"], list) and len(embedding["data"]) > 0:
            embedding = embedding["data"][0]
        else:
            print("Error: Unexpected embedding data structure.", file=sys.stderr)
            sys.exit(1)
    
    print("Embedding for", file_path, ":", embedding)
    # Use the front matter title if available, else fall back to extracting from content.
    title = front_matter.get("title") if "title" in front_matter else extract_title(main_content, file_path)
    # Use the front matter date if available, otherwise use the current date.
    date_field = front_matter.get("date") if "date" in front_matter else datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    
    doc_id = generate_document_id(file_path)
    
    # Build metadata. You can include additional fields from the front matter if available.
    metadata = {
        "title": title,
        "date": date_field,
        "file_path": file_path,
    }
    # Optionally include other metadata fields if present.
    for key in ["template", "draft", "slug", "category", "tags", "description"]:
        if key in front_matter:
            metadata[key] = front_matter[key]

    document = {
        "id": doc_id,
        "values": embedding,
        "metadata": metadata
    }
    return document

def push_to_vectorize_batch(documents, account_id, vectorize_token):
    if not documents:
        print("No documents to push.")
        return

    index_name = "blog-posts"  # Adjust if needed.
    url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/vectorize/v2/indexes/{index_name}/insert"
    
    # Build NDJSON payload: one JSON object per line, with a trailing newline.
    ndjson_payload = "\n".join(json.dumps(doc) for doc in documents) + "\n"
    print("NDJSON payload to be sent:")
    print(repr(ndjson_payload))
    
    headers = {
        "Content-Type": "application/x-ndjson",
        "Authorization": f"Bearer {vectorize_token}"
    }
    try:
        response = requests.post(url, headers=headers, data=ndjson_payload)
        print("Vectorize API response status:", response.status_code)
        print("Vectorize API response text:", response.text)
        response.raise_for_status()
        print("Successfully pushed documents to Cloudflare Vectorize.")
    except Exception as e:
        print("Error pushing documents to Cloudflare Vectorize:", e, file=sys.stderr)
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(
        description="Update blog post embeddings using Cloudflare Workers AI and push to Vectorize"
    )
    parser.add_argument("--post", help="Path to a specific blog post file (e.g., posts/my-post.md)", required=False)
    args = parser.parse_args()

    account_id = os.getenv("CLOUDFLARE_ACCOUNT_ID")
    ai_token = os.getenv("CLOUDFLARE_AI_TOKEN")
    vectorize_token = os.getenv("CLOUDFLARE_VECTORIZE_TOKEN")
    if not account_id or not ai_token or not vectorize_token:
        print("Error: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_AI_TOKEN, and CLOUDFLARE_VECTORIZE_TOKEN must be set in the environment.", file=sys.stderr)
        sys.exit(1)

    if args.post:
        posts_to_process = [args.post]
    else:
        posts_to_process = get_changed_posts()
        if not posts_to_process:
            print("No changed posts found. Exiting.")
            sys.exit(0)
    print("Found", len(posts_to_process), "post(s) to process:", posts_to_process)

    documents = []
    for post_file in posts_to_process:
        doc = process_file(post_file, account_id, ai_token)
        if doc:
            documents.append(doc)

    push_to_vectorize_batch(documents, account_id, vectorize_token)

if __name__ == "__main__":
    main()

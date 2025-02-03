#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
import subprocess
import sys
from datetime import datetime, timezone

import requests
import re

def parse_front_matter_simple(content):
    """
    A simple front matter parser that assumes the file starts with '---'
    and ends with the next '---'. It returns a tuple (front_matter_dict, remaining_content).
    """
    if content.startswith('---'):
        # Split into three parts: before, front matter, and the rest.
        parts = content.split('---', 2)
        if len(parts) >= 3:
            fm_str = parts[1]
            main_content = parts[2]
            front_matter = {}
            for line in fm_str.splitlines():
                line = line.strip()
                if not line:
                    continue
                # Very simple handling: split on the first ':'.
                if ':' in line:
                    key, value = line.split(':', 1)
                    key = key.strip()
                    value = value.strip()
                    # Remove surrounding quotes if any.
                    if (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
                        value = value[1:-1]
                    # Convert boolean strings to booleans.
                    if value.lower() == 'true':
                        value = True
                    elif value.lower() == 'false':
                        value = False
                    front_matter[key] = value
            return front_matter, main_content
    return {}, content

def get_embedding(text, account_id, ai_token):
    url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/@cf/baai/bge-base-en-v1.5"
    payload = {"text": text}
    headers = {
        "Authorization": f"Bearer {ai_token}",
        "Content-Type": "application/json"
    }
    try:
        response = requests.post(url, json=payload, headers=headers)
        print("Embedding API response status:", response.status_code)
        print("Embedding API response headers:", response.headers)
        print("Embedding API response text:", response.text)
        response.raise_for_status()
        data = response.json()
        # The embedding might be under "embedding" or "result"
        embedding = data.get("embedding") or data.get("result")
        if embedding is None:
            print("Error: No embedding found in AI API response.", file=sys.stderr)
            sys.exit(1)
        return embedding
    except Exception as e:
        print("Error calling Cloudflare Workers AI embedding API:", e, file=sys.stderr)
        sys.exit(1)

def generate_document_id(file_path):
    """Generates a unique document ID from the file path using an MD5 hash."""
    return hashlib.md5(file_path.encode("utf-8")).hexdigest()

def extract_title(content, file_path):
    """
    Fallback: Extracts the title from the first Markdown header in content,
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

    # Parse the simple front matter if present.
    front_matter, main_content = parse_front_matter_simple(content)
    
    print("Generating embedding...")
    embedding = get_embedding(main_content, account_id, ai_token)
    
    # If the embedding comes in a wrapped format (with "data"), extract it.
    if isinstance(embedding, dict) and "data" in embedding:
        if isinstance(embedding["data"], list) and len(embedding["data"]) > 0:
            embedding = embedding["data"][0]
        else:
            print("Error: Unexpected embedding data structure.", file=sys.stderr)
            sys.exit(1)
    
    print("Embedding for", file_path, ":", embedding)
    # Use the front matter title if available, else fall back to extraction.
    title = front_matter.get("title", extract_title(main_content, file_path))
    # Use the front matter date if available; otherwise, use the current date.
    date_field = front_matter.get("date", datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"))
    
    doc_id = generate_document_id(file_path)
    
    # Build metadata. Feel free to add any additional fields from the front matter.
    metadata = {
        "title": title,
        "date": date_field,
        "file_path": file_path,
    }
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

    index_name = "blog-posts"  # Adjust this if needed.
    url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/vectorize/v2/indexes/{index_name}/insert"
    
    # Build an NDJSON payload (one JSON object per line).
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

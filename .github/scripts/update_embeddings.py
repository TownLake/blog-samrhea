#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
import subprocess
import sys
from datetime import datetime
import urllib.parse

import requests

# -----------------------------------------------------------------------------
# Cloudflare Workers AI Embedding Model Settings
# -----------------------------------------------------------------------------
# This script calls the Cloudflare Workers AI endpoint for the model:
#   @cf/baai/bge-base-en-v1.5
#
# The expected JSON request body is:
#
# {
#   "text": "The text to embed"
# }
#
# For batch requests, an array is supported (up to 100 items), but here we
# assume one text per call.
# -----------------------------------------------------------------------------

def get_embedding(text, account_id):
    """
    Calls Cloudflare Workers AI to generate an embedding for the provided text
    using the model @cf/baai/bge-base-en-v1.5.
    """
    # URL-encode the model name so that the "@" is properly encoded.
    model_name = "@cf/baai/bge-base-en-v1.5"
    # Keep the slash ("/") characters unencoded.
    encoded_model_name = urllib.parse.quote(model_name, safe='/')
    url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/workers/ai/models/{encoded_model_name}/invoke"
    
    payload = {"text": text}
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        # Expecting a response like: { "embedding": [ ... ] }
        embedding = data.get("embedding")
        if embedding is None:
            print("Error: No 'embedding' field found in AI API response.", file=sys.stderr)
            print("Response content:", response.text, file=sys.stderr)
            sys.exit(1)
        return embedding
    except Exception as e:
        print(f"Error calling Cloudflare Workers AI embedding API: {e}", file=sys.stderr)
        # If available, print response content for debugging.
        if 'response' in locals():
            print("Response content:", response.text, file=sys.stderr)
        sys.exit(1)

# -----------------------------------------------------------------------------
# Functions for processing blog post files
# -----------------------------------------------------------------------------

def generate_document_id(file_path):
    """
    Generates a unique document ID from the file path using an MD5 hash.
    """
    return hashlib.md5(file_path.encode("utf-8")).hexdigest()

def extract_title(content, file_path):
    """
    Extracts the title from the post content.
    Assumes the first Markdown header (a line starting with '#') is the title.
    If not found, falls back to the file name.
    """
    for line in content.splitlines():
        if line.startswith("#"):
            return line.lstrip("#").strip()
    return os.path.basename(file_path)

def get_changed_posts():
    """
    Uses git to determine which files under the 'posts/' directory have changed.
    Adjust the git diff command as needed.
    """
    try:
        result = subprocess.run(
            ["git", "diff", "--name-only", "HEAD~1", "HEAD"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=True
        )
        files = result.stdout.splitlines()
        # Only include files in 'posts/' ending with '.md'
        changed_posts = [f for f in files if f.startswith("posts/") and f.endswith(".md")]
        return changed_posts
    except subprocess.CalledProcessError as e:
        print(f"Error getting changed files: {e.stderr}", file=sys.stderr)
        sys.exit(1)

def process_file(file_path, account_id):
    """
    Processes a single blog post file:
      - Reads its content.
      - Generates an embedding using Cloudflare Workers AI.
      - Logs the embedding.
      - Returns a document dictionary with metadata.
    """
    print(f"Processing file: {file_path}")
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {file_path}: {e}", file=sys.stderr)
        return None

    print("Generating embedding...")
    embedding = get_embedding(content, account_id)
    
    # Log the generated embedding
    print(f"Embedding for {file_path}: {embedding}")

    # Extract metadata (e.g., title) from the content
    title = extract_title(content, file_path)
    
    # Generate a document ID (using the file path)
    doc_id = generate_document_id(file_path)

    # Assemble the document payload as required by Vectorize.
    document = {
        "id": doc_id,
        "embedding": embedding,
        "metadata": {
            "title": title,
            "file_path": file_path,
            "last_modified": datetime.utcnow().isoformat() + "Z"
        }
    }
    return document

# -----------------------------------------------------------------------------
# Function to push documents to Cloudflare Vectorize in NDJSON format
# -----------------------------------------------------------------------------

def push_to_vectorize_batch(documents, account_id, token):
    """
    Pushes a batch of documents to Cloudflare Vectorize.
    The documents are sent as NDJSON (newline-delimited JSON) to the insert API.
    """
    if not documents:
        print("No documents to push.")
        return

    index_name = "blog-posts"
    url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/vectorize/v2/indexes/{index_name}/insert"

    # Build NDJSON payload: one JSON object per line.
    ndjson_payload = "\n".join(json.dumps(doc) for doc in documents) + "\n"

    headers = {
        "Content-Type": "application/x-ndjson",
        "Authorization": f"Bearer {token}"
    }
    try:
        response = requests.post(url, headers=headers, data=ndjson_payload)
        response.raise_for_status()
        print("Successfully pushed documents to Cloudflare Vectorize. Response:")
        print(response.text)
    except Exception as e:
        print(f"Error pushing documents to Cloudflare Vectorize: {e}", file=sys.stderr)
        sys.exit(1)

# -----------------------------------------------------------------------------
# Main entry point
# -----------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Update blog post embeddings using Cloudflare Workers AI and push to Vectorize"
    )
    parser.add_argument(
        "--post",
        help="Path to a specific blog post file (e.g., posts/my-post.md)",
        required=False
    )
    args = parser.parse_args()

    # Get required environment variables.
    account_id = os.getenv("CLOUDFLARE_ACCOUNT_ID")
    token = os.getenv("CLOUDFLARE_VECTORIZE_TOKEN")
    if not account_id or not token:
        print("Error: CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_VECTORIZE_TOKEN must be set in the environment.", file=sys.stderr)
        sys.exit(1)

    # Determine which posts to process.
    if args.post:
        posts_to_process = [args.post]
    else:
        posts_to_process = get_changed_posts()
        if not posts_to_process:
            print("No changed posts found in this commit. Exiting.")
            sys.exit(0)

    print(f"Found {len(posts_to_process)} post(s) to process: {posts_to_process}")
    documents = []
    for post_file in posts_to_process:
        doc = process_file(post_file, account_id)
        if doc:
            documents.append(doc)

    # Push the batch of documents to Vectorize.
    push_to_vectorize_batch(documents, account_id, token)

if __name__ == "__main__":
    main()

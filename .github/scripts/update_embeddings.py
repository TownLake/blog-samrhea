#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
import subprocess
import sys
from datetime import datetime

import requests

# -----------------------------------------------------------------------------
# Cloudflare Workers AI Embedding Model Settings
# -----------------------------------------------------------------------------
# We now use the endpoint:
#
# curl https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/@cf/baai/bge-base-en-v1.5 \
#   -H 'Authorization: Bearer {AI_TOKEN}' \
#   -d '{ "prompt": "Where did the phrase Hello World come from" }'
#
# -----------------------------------------------------------------------------

def get_embedding(text, account_id, ai_token):
    """
    Calls Cloudflare Workers AI to generate an embedding for the provided text
    using the model @cf/baai/bge-base-en-v1.5.
    """
    url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/@cf/baai/bge-base-en-v1.5"
    payload = {"prompt": text}
    headers = {
        "Authorization": f"Bearer {ai_token}",
        "Content-Type": "application/json"
    }
    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        # Depending on the API response, the embedding might be under "embedding" or "result".
        embedding = data.get("embedding") or data.get("result")
        if embedding is None:
            print("Error: No embedding found in AI API response.", file=sys.stderr)
            print("Response content:", response.text, file=sys.stderr)
            sys.exit(1)
        return embedding
    except Exception as e:
        print(f"Error calling Cloudflare Workers AI embedding API: {e}", file=sys.stderr)
        if 'response' in locals():
            print("Response content:", response.text, file=sys.stderr)
        sys.exit(1)

def generate_document_id(file_path):
    """Generates a unique document ID from the file path using an MD5 hash."""
    return hashlib.md5(file_path.encode("utf-8")).hexdigest()

def extract_title(content, file_path):
    """Extracts the title from the post content by using the first Markdown header."""
    for line in content.splitlines():
        if line.startswith("#"):
            return line.lstrip("#").strip()
    return os.path.basename(file_path)

def get_changed_posts():
    """Uses git to determine which files under the 'posts/' directory have changed."""
    try:
        result = subprocess.run(
            ["git", "diff", "--name-only", "HEAD~1", "HEAD"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=True
        )
        files = result.stdout.splitlines()
        changed_posts = [f for f in files if f.startswith("posts/") and f.endswith(".md")]
        return changed_posts
    except subprocess.CalledProcessError as e:
        print(f"Error getting changed files: {e.stderr}", file=sys.stderr)
        sys.exit(1)

def process_file(file_path, account_id, ai_token):
    """Processes a single blog post file and returns a document dictionary with an embedding."""
    print(f"Processing file: {file_path}")
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {file_path}: {e}", file=sys.stderr)
        return None

    print("Generating embedding...")
    embedding = get_embedding(content, account_id, ai_token)
    print(f"Embedding for {file_path}: {embedding}")
    title = extract_title(content, file_path)
    doc_id = generate_document_id(file_path)
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

def push_to_vectorize_batch(documents, account_id, vectorize_token):
    """Pushes a batch of documents to Cloudflare Vectorize using NDJSON."""
    if not documents:
        print("No documents to push.")
        return

    index_name = "blog-posts"
    url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/vectorize/v2/indexes/{index_name}/insert"
    ndjson_payload = "\n".join(json.dumps(doc) for doc in documents) + "\n"
    headers = {
        "Content-Type": "application/x-ndjson",
        "Authorization": f"Bearer {vectorize_token}"
    }
    try:
        response = requests.post(url, headers=headers, data=ndjson_payload)
        response.raise_for_status()
        print("Successfully pushed documents to Cloudflare Vectorize. Response:")
        print(response.text)
    except Exception as e:
        print(f"Error pushing documents to Cloudflare Vectorize: {e}", file=sys.stderr)
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(
        description="Update blog post embeddings using Cloudflare Workers AI and push to Vectorize"
    )
    parser.add_argument("--post", help="Path to a specific blog post file", required=False)
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
            print("No changed posts found in this commit. Exiting.")
            sys.exit(0)

    print(f"Found {len(posts_to_process)} post(s) to process: {posts_to_process}")
    documents = []
    for post_file in posts_to_process:
        doc = process_file(post_file, account_id, ai_token)
        if doc:
            documents.append(doc)
    push_to_vectorize_batch(documents, account_id, vectorize_token)

if __name__ == "__main__":
    main()

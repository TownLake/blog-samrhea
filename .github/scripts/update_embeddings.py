#!/usr/bin/env python3
import os
import json
import re
import yaml
import hashlib
import requests
import argparse
import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple


def parse_markdown(file_path):
    """
    Parse markdown file to extract front matter and content.
    
    Args:
        file_path (str): Path to the markdown file
        
    Returns:
        tuple: (front_matter_dict, content)
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Extract front matter
        front_matter_match = re.match(r'^---\s+(.*?)\s+---\s+(.*)', content, re.DOTALL)
        
        if front_matter_match:
            front_matter_yaml = front_matter_match.group(1)
            content_text = front_matter_match.group(2)
            
            try:
                front_matter = yaml.safe_load(front_matter_yaml)
                return front_matter, content_text.strip()
            except yaml.YAMLError as e:
                print(f"Error parsing YAML front matter in {file_path}: {e}")
                return {}, content
        else:
            print(f"No frontmatter found in {file_path}")
            return {}, content
    except Exception as e:
        print(f"Error processing {file_path}: {str(e)}")
        return {}, content


def extract_title(content, file_path):
    """
    Extracts the title from the first Markdown header in content,
    or uses the file name if no header is found.
    """
    for line in content.splitlines():
        if line.startswith("#"):
            return line.lstrip("#").strip()
    return os.path.basename(file_path)


def get_embedding(text, account_id, api_token):
    """
    Get embedding using Cloudflare Workers AI BGE model.
    
    Args:
        text (str): Text to embed
        account_id (str): Cloudflare account ID
        api_token (str): Cloudflare AI API token
        
    Returns:
        list: Embedding vector
    """
    # Try first with BGE-M3 model
    url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/@cf/baai/bge-m3"
    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/json"
    }
    payload = {
        "contexts": [{"text": text}]
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code != 200:
            print(f"Failed with BGE-M3 model, trying BGE-Base-EN-V1.5")
            # Fallback to BGE-Base-EN-V1.5 model
            url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/@cf/baai/bge-base-en-v1.5"
            payload = {"text": text}
            response = requests.post(url, headers=headers, json=payload)
            
            if response.status_code != 200:
                print(f"Error getting embedding: {response.status_code}")
                print(response.text)
                return None
        
        # Extract the embedding from the response
        embedding_data = response.json()
        
        # Debug response structure
        print(f"Embedding response received. Status: {response.status_code}")
        
        # The response format may vary based on the model, try different paths
        if "result" in embedding_data:
            result = embedding_data["result"]
            if "response" in result and len(result["response"]) > 0:
                return result["response"][0]
            elif "data" in result and len(result["data"]) > 0:
                return result["data"][0]
        elif "embedding" in embedding_data:
            return embedding_data["embedding"]
        
        print(f"Unexpected response format: {embedding_data}")
        return None
    except Exception as e:
        print(f"Exception during embedding API call: {str(e)}")
        return None


def store_in_vectorize(documents, account_id, api_token, index_name):
    """
    Store vectors and metadata in Cloudflare Vectorize in a batch.
    
    Args:
        documents (list): List of document objects with id, values, and metadata
        account_id (str): Cloudflare account ID
        api_token (str): Cloudflare Vectorize API token
        index_name (str): Name of the Vectorize index
        
    Returns:
        bool: Success status
    """
    if not documents:
        print("No documents to push.")
        return False

    # Using the correct API endpoint format according to the documentation
    url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/vectorize/v2/indexes/{index_name}/upsert"
    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/x-ndjson"
    }
    
    # Build an NDJSON payload (one JSON object per line)
    ndjson_payload = ""
    for doc in documents:
        # Ensure vector is a list of floats
        if isinstance(doc["values"], list):
            doc["values"] = [float(v) if not isinstance(v, float) else v for v in doc["values"]]
        
        # Clean metadata - ensure all values are of acceptable types
        clean_metadata = {}
        for key, value in doc["metadata"].items():
            # Handle lists specially (particularly for tags)
            if isinstance(value, list):
                # Convert list to JSON string
                clean_metadata[key] = json.dumps(value)
            elif value is not None:
                # Convert other values to strings
                clean_metadata[key] = str(value)
        
        doc["metadata"] = clean_metadata
        ndjson_payload += json.dumps(doc) + "\n"
    
    try:
        print(f"Sending {len(documents)} vectors to Vectorize")
        response = requests.post(url, headers=headers, data=ndjson_payload)
        
        if response.status_code != 200:
            print(f"Error storing in Vectorize: {response.status_code}")
            print(response.text)
            return False
        
        print(f"Successfully stored {len(documents)} documents in Vectorize")
        return True
    except Exception as e:
        print(f"Exception during Vectorize API call: {str(e)}")
        return False


def update_kv_metadata(metadata_list, account_id, namespace_id, api_token):
    """
    Upload the metadata list to Cloudflare KV namespace.
    Returns True if successful, False otherwise.
    """
    url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/storage/kv/namespaces/{namespace_id}/values/all_posts_metadata"
    
    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/json"
    }
    
    try:
        # Convert metadata list to JSON
        data = json.dumps(metadata_list)
        
        # Upload to Cloudflare KV
        response = requests.put(url, headers=headers, data=data)
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print(f"Successfully uploaded metadata for {len(metadata_list)} posts to Cloudflare KV")
                return True
            else:
                print(f"API returned error: {result.get('errors')}")
                return False
        else:
            print(f"Error uploading to Cloudflare KV: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"Exception during upload: {str(e)}")
        return False


def get_changed_files(path_pattern):
    """
    Uses git to determine which files matching the path pattern have changed.
    """
    try:
        # Get all changed files between current commit and previous commit
        result = subprocess.run(
            ["git", "diff", "--name-only", "HEAD~1", "HEAD"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=True
        )
        files = result.stdout.splitlines()
        return [f for f in files if path_pattern in f and f.endswith(".md")]
    except subprocess.CalledProcessError as e:
        print("Error getting changed files:", e.stderr, file=sys.stderr)
        print("Trying to get all files matching pattern instead...")
        # Fallback: Get all files matching the pattern
        result = subprocess.run(
            ["find", ".", "-path", f"*{path_pattern}*", "-name", "*.md"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=True
        )
        return result.stdout.splitlines()


def generate_document_id(file_path):
    """Generates a unique document ID from the file path using an MD5 hash."""
    return hashlib.md5(file_path.encode("utf-8")).hexdigest()


def process_files(files, account_id, ai_token, index_name):
    """
    Process a list of markdown files, embedding them and preparing for Vectorize.
    Returns processed documents and metadata for KV.
    """
    documents = []
    metadata_list = []
    
    for file_path in files:
        print(f"Processing {file_path}")
        
        try:
            # Parse markdown file
            front_matter, content = parse_markdown(file_path)
            
            # Generate an ID for the document
            file_id = generate_document_id(file_path)
            
            # If missing required metadata, try to extract from content
            if not front_matter or "title" not in front_matter:
                front_matter["title"] = extract_title(content, file_path)
                
            # Make sure we have a slug
            if "slug" not in front_matter:
                # Generate slug from filepath
                slug_path = os.path.dirname(file_path).split("/")[-1]
                front_matter["slug"] = slug_path
            
            # Get embedding for the content
            embedding = get_embedding(content, account_id, ai_token)
            
            if embedding is None:
                print(f"Failed to get embedding for {file_path}")
                continue
            
            # Extract required metadata for KV
            if front_matter and "title" in front_matter and "slug" in front_matter:
                # Clean up the slug if needed
                slug = front_matter["slug"]
                if slug.startswith('/'):
                    slug = slug[1:]
                
                metadata_list.append({
                    'title': front_matter["title"],
                    'slug': slug
                })
            
            # Prepare full metadata for Vectorize
            metadata = {}
            for key in ["title", "slug", "date", "category", "tags", "description"]:
                if key in front_matter:
                    metadata[key] = front_matter[key]
            
            # Add file path to metadata
            metadata["file_path"] = file_path
            
            # Create document object for Vectorize
            document = {
                "id": file_id,
                "values": embedding,
                "metadata": metadata
            }
            
            documents.append(document)
            print(f"Successfully processed {file_path}")
            
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
    
    return documents, metadata_list


def main():
    parser = argparse.ArgumentParser(description="Embed markdown files, store them in Cloudflare Vectorize, and update KV metadata")
    parser.add_argument("--post", help="Path to a specific blog post file", required=False)
    parser.add_argument("--path-pattern", help="Pattern to match file paths (default: content/posts)", default="content/posts")
    parser.add_argument("--account-id", help="Cloudflare Account ID", default=os.getenv("CLOUDFLARE_ACCOUNT_ID"))
    parser.add_argument("--ai-token", help="Cloudflare AI API token", default=os.getenv("CLOUDFLARE_AI_TOKEN"))
    parser.add_argument("--vectorize-token", help="Cloudflare Vectorize API token", default=os.getenv("CLOUDFLARE_VECTORIZE_TOKEN"))
    parser.add_argument("--index-name", help="Vectorize index name", default="blog-posts")
    parser.add_argument("--namespace-id", help="Cloudflare KV namespace ID", default=os.getenv("CLOUDFLARE_KV_NAMESPACE_ID"))
    parser.add_argument("--kv-token", help="Cloudflare KV API token", default=os.getenv("CLOUDFLARE_KV_TOKEN"))
    
    args = parser.parse_args()
    
    # Check if required environment variables are set
    if not args.account_id or not args.ai_token or not args.vectorize_token:
        print("Error: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_AI_TOKEN, and CLOUDFLARE_VECTORIZE_TOKEN must be set")
        sys.exit(1)
        
    if not args.namespace_id:
        print("Error: CLOUDFLARE_KV_NAMESPACE_ID must be set")
        sys.exit(1)
        
    if not args.kv_token:
        print("Error: CLOUDFLARE_KV_TOKEN must be set")
        sys.exit(1)
    
    # Determine which files to process
    if args.post:
        print(f"Processing specified file: {args.post}")
        files_to_process = [args.post]
    else:
        print(f"Getting changed files matching pattern: {args.path_pattern}")
        files_to_process = get_changed_files(args.path_pattern)
        
    if not files_to_process:
        print("No files to process. Exiting.")
        sys.exit(0)
        
    print(f"Found {len(files_to_process)} files to process")
    
    # Process files
    documents, metadata_list = process_files(
        files_to_process, 
        args.account_id, 
        args.ai_token,
        args.index_name
    )
    
    if not documents:
        print("No documents were processed successfully. Exiting.")
        sys.exit(1)
    
    # Store in Vectorize
    success = store_in_vectorize(
        documents, 
        args.account_id, 
        args.vectorize_token,
        args.index_name
    )
    
    # Always update KV metadata
    if metadata_list:
        print("Updating KV metadata...")
        update_kv_metadata(
            metadata_list,
            args.account_id,
            args.namespace_id,
            args.kv_token  # Using the separate KV token
        )
    else:
        print("No metadata available to update KV")
    
    if success:
        print("\nProcessing complete!")
        print(f"Successfully processed: {len(documents)}")
    else:
        print("\nProcessing failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()

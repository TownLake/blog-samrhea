#!/usr/bin/env python3
import os
import re
import json
import argparse
import requests
from typing import Dict, List, Optional, Any


def extract_frontmatter(file_path: str) -> Optional[Dict[str, Any]]:
    """
    Extract frontmatter from a markdown file.
    Returns a dictionary with the frontmatter data or None if parsing fails.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find content between --- markers (frontmatter)
        frontmatter_match = re.search(r'^---\s*$(.*?)^---\s*$', content, re.MULTILINE | re.DOTALL)
        
        if not frontmatter_match:
            print(f"No frontmatter found in {file_path}")
            return None
            
        frontmatter_content = frontmatter_match.group(1).strip()
        
        # Parse the YAML-like frontmatter
        metadata = {}
        for line in frontmatter_content.split('\n'):
            line = line.strip()
            if not line or line.startswith('#'):
                continue
                
            # Match key-value pairs
            match = re.match(r'^([^:]+):\s*(.*)$', line)
            if match:
                key = match.group(1).strip().strip('"')
                value = match.group(2).strip().strip('"')
                
                # Handle quoted strings
                if value.startswith('"') and value.endswith('"'):
                    value = value[1:-1]
                
                metadata[key] = value
        
        return metadata
    except Exception as e:
        print(f"Error processing {file_path}: {str(e)}")
        return None


def process_blog_directory(blog_dir: str) -> List[Dict[str, str]]:
    """
    Process all markdown files in the given directory and extract title and slug.
    Returns a list of dictionaries with title and slug.
    """
    metadata_list = []
    
    for root, _, files in os.walk(blog_dir):
        for file in files:
            if file.endswith('.md') or file.endswith('.markdown'):
                file_path = os.path.join(root, file)
                print(f"Processing {file_path}")
                
                metadata = extract_frontmatter(file_path)
                if metadata and 'title' in metadata and 'slug' in metadata:
                    # Clean up the slug if needed
                    slug = metadata['slug']
                    if slug.startswith('/'):
                        slug = slug[1:]
                    
                    metadata_list.append({
                        'title': metadata['title'],
                        'slug': slug
                    })
                else:
                    print(f"Missing title or slug in {file_path}")
    
    return metadata_list


def upload_to_cloudflare_kv(account_id: str, namespace_id: str, api_token: str, metadata_list: List[Dict[str, str]]) -> bool:
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


def main():
    parser = argparse.ArgumentParser(description="Extract blog post metadata and upload to Cloudflare KV")
    
    parser.add_argument("--blog-dir", required=True, help="Directory containing blog markdown files")
    parser.add_argument("--account-id", required=True, help="Cloudflare account ID")
    parser.add_argument("--namespace-id", required=True, help="Cloudflare KV namespace ID")
    parser.add_argument("--api-token", required=True, help="Cloudflare API token with KV write permissions")
    parser.add_argument("--dry-run", action="store_true", help="Process files but don't upload to Cloudflare")
    
    args = parser.parse_args()
    
    # Process blog directory
    metadata_list = process_blog_directory(args.blog_dir)
    
    if not metadata_list:
        print("No valid metadata found in blog files")
        return
    
    print(f"Found {len(metadata_list)} blog posts with title and slug")
    
    # Print first few entries as a sample
    print("\nSample metadata entries:")
    for entry in metadata_list[:3]:
        print(f"Title: {entry['title']}")
        print(f"Slug: {entry['slug']}")
        print("---")
    
    # Upload to Cloudflare KV if not in dry run mode
    if not args.dry_run:
        upload_to_cloudflare_kv(
            account_id=args.account_id,
            namespace_id=args.namespace_id,
            api_token=args.api_token,
            metadata_list=metadata_list
        )
    else:
        print("\nDry run mode - not uploading to Cloudflare KV")
        print(f"Would upload {len(metadata_list)} entries to Cloudflare KV")


if __name__ == "__main__":
    main()

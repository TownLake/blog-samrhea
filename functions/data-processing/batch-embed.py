import os
import json
import re
import yaml
import hashlib
import requests
import argparse
from pathlib import Path


def parse_markdown(file_path):
    """
    Parse markdown file to extract front matter and content.
    
    Args:
        file_path (str): Path to the markdown file
        
    Returns:
        tuple: (front_matter_dict, content)
    """
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
        return {}, content


def get_embedding(text, ai_api_key, account_id):
    """
    Get embedding using Cloudflare Workers AI BGE-M3 model.
    
    Args:
        text (str): Text to embed
        ai_api_key (str): Cloudflare AI API key
        account_id (str): Cloudflare account ID
        
    Returns:
        list: Embedding vector
    """
    url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/@cf/baai/bge-m3"
    headers = {
        "Authorization": f"Bearer {ai_api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "contexts": [{"text": text}]
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code != 200:
            print(f"Error getting embedding: {response.status_code}")
            print(response.text)
            return None
        
        # Extract the embedding from the response
        embedding_data = response.json()
        
        # Debug response structure
        print(f"Embedding response keys: {embedding_data.keys()}")
        if "result" in embedding_data:
            print(f"Result keys: {embedding_data['result'].keys()}")
        
        # The response format may vary, try different paths
        if "result" in embedding_data:
            result = embedding_data["result"]
            if "response" in result:
                return result["response"][0]
            elif "data" in result and len(result["data"]) > 0:
                return result["data"][0]
        
        print(f"Unexpected response format: {embedding_data}")
        return None
    except Exception as e:
        print(f"Exception during embedding API call: {str(e)}")
        return None


def store_in_vectorize(id, vector, metadata, vectorize_api_key, account_id, index_name):
    """
    Store vector and metadata in Cloudflare Vectorize.
    
    Args:
        id (str): Unique identifier for the vector
        vector (list): Embedding vector
        metadata (dict): Metadata to store with the vector
        vectorize_api_key (str): Cloudflare Vectorize API key
        account_id (str): Cloudflare account ID
        index_name (str): Name of the Vectorize index
        
    Returns:
        bool: Success status
    """
    # Using the correct API endpoint format according to the documentation
    url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/vectorize/v2/indexes/{index_name}/upsert"
    headers = {
        "Authorization": f"Bearer {vectorize_api_key}",
        "Content-Type": "application/x-ndjson"
    }
    
    # Ensure vector is a list of floats
    if isinstance(vector, list):
        vector = [float(v) if not isinstance(v, float) else v for v in vector]
    
    # Clean metadata - ensure all values are of acceptable types
    clean_metadata = {}
    for key, value in metadata.items():
        # Handle lists specially (particularly for tags)
        if isinstance(value, list):
            # Convert list to JSON string
            clean_metadata[key] = json.dumps(value)
        elif value is not None:
            # Convert other values to strings
            clean_metadata[key] = str(value)
    
    # Create the vector data in NDJSON format
    vector_data = {
        "id": id,
        "values": vector,
        "metadata": clean_metadata
    }
    
    # Convert to NDJSON (one JSON object per line)
    ndjson_data = json.dumps(vector_data)
    
    # Debug
    print(f"Sending vector to Vectorize: {ndjson_data[:200]}...")
    
    try:
        # According to docs, this is a POST with application/x-ndjson content type
        response = requests.post(url, headers=headers, data=ndjson_data)
        
        if response.status_code != 200:
            print(f"Error storing in Vectorize: {response.status_code}")
            print(response.text)
            return False
        
        return True
    except Exception as e:
        print(f"Exception during Vectorize API call: {str(e)}")
        return False


def process_folder(folder_path, ai_api_key, vectorize_api_key, account_id, index_name, batch_size=10):
    """
    Process all markdown files in a folder, embed them, and store in Vectorize.
    
    Args:
        folder_path (str): Path to folder containing markdown files
        ai_api_key (str): Cloudflare AI API key
        vectorize_api_key (str): Cloudflare Vectorize API key
        account_id (str): Cloudflare account ID
        index_name (str): Name of the Vectorize index
        batch_size (int): Number of vectors to process in each batch
        
    Returns:
        tuple: (success_count, fail_count)
    """
    folder = Path(folder_path)
    markdown_files = list(folder.glob("**/*.md"))
    total_files = len(markdown_files)
    
    print(f"Found {total_files} markdown files in {folder_path}")
    
    success_count = 0
    fail_count = 0
    
    # Process files in batches
    for i, file_path in enumerate(markdown_files):
        print(f"Processing {i+1}/{total_files}: {file_path}")
        
        try:
            # Parse markdown file
            front_matter, content = parse_markdown(file_path)
            
            if not front_matter or "title" not in front_matter or "slug" not in front_matter:
                print(f"Missing required metadata in {file_path}")
                fail_count += 1
                continue
            
            # Use file path as ID if needed
            file_id = str(file_path.stem)
            
            # Truncate or hash the ID if it's too long
            if len(file_id.encode('utf-8')) > 64:
                # Option 1: Truncate to 64 bytes
                # file_id = file_id.encode('utf-8')[:64].decode('utf-8', errors='ignore')
                
                # Option 2: Hash the ID
                file_id = hashlib.md5(file_id.encode('utf-8')).hexdigest()
                print(f"ID too long, using hash instead: {file_id}")
            
            # Get embedding for the content
            embedding = get_embedding(content, ai_api_key, account_id)
            
            if embedding is None:
                print(f"Failed to get embedding for {file_path}")
                fail_count += 1
                continue
            
            # Extract required metadata
            metadata = {
                "title": front_matter.get("title", ""),
                "slug": front_matter.get("slug", ""),
                "date": front_matter.get("date", ""),
                "category": front_matter.get("category", ""),
                "tags": front_matter.get("tags", []),
                "description": front_matter.get("description", "")
            }
            
            # Store in Vectorize
            if store_in_vectorize(file_id, embedding, metadata, vectorize_api_key, account_id, index_name):
                print(f"Successfully processed {file_path}")
                success_count += 1
            else:
                print(f"Failed to store {file_path} in Vectorize")
                fail_count += 1
            
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
            fail_count += 1
    
    return success_count, fail_count


def main():
    parser = argparse.ArgumentParser(description="Embed markdown files and store them in Cloudflare Vectorize")
    parser.add_argument("folder", help="Path to folder containing markdown files")
    parser.add_argument("--ai-api-key", help="Cloudflare AI API key", required=True)
    parser.add_argument("--vectorize-api-key", help="Cloudflare Vectorize API key", required=True)
    parser.add_argument("--account-id", help="Cloudflare Account ID", required=True)
    parser.add_argument("--index-name", help="Vectorize index name", default="blog-samrhea-posts-2025-03-18-v2")
    parser.add_argument("--batch-size", type=int, default=10, help="Number of vectors to process in each batch")
    
    args = parser.parse_args()
    
    success_count, fail_count = process_folder(
        args.folder, 
        args.ai_api_key, 
        args.vectorize_api_key, 
        args.account_id,
        args.index_name,
        args.batch_size
    )
    
    print(f"\nProcessing complete!")
    print(f"Successfully processed: {success_count}")
    print(f"Failed to process: {fail_count}")


if __name__ == "__main__":
    main()

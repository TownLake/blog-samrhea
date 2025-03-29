#!/usr/bin/env python3
import argparse
import json
import requests
from typing import List, Dict, Any, Optional


class CloudflareVectorizeSearcher:
    """A Python implementation of the Cloudflare Vectorize search API using BGE-M3."""
    
    def __init__(self, account_id: str, vectorize_token: str, ai_token: str):
        self.account_id = account_id
        self.vectorize_token = vectorize_token
        self.ai_token = ai_token
        
        # Base URLs for Cloudflare APIs
        self.ai_api_base = "https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run"
        self.vectorize_api_base = "https://api.cloudflare.com/client/v4/accounts/{account_id}/vectorize/v2/indexes/{index_name}/query"
        
        # BGE-M3 model (for 1024-dimensional embeddings)
        self.embedding_model = "@cf/baai/bge-m3"
        
        # Default index name for your vectorize database
        self.index_name = "blog-samrhea-posts-2025-03-18-v2"

    def set_index_name(self, index_name: str):
        """Set the Vectorize index name to use."""
        self.index_name = index_name
        
    def generate_embedding(self, text: str) -> Optional[List[float]]:
        """Generate embeddings using Cloudflare AI API with BGE-M3."""
        # Construct the URL exactly like in the test script
        url = f"https://api.cloudflare.com/client/v4/accounts/{self.account_id}/ai/run/@cf/baai/bge-m3"
        
        # Headers exactly like in the test script
        headers = {
            "Authorization": f"Bearer {self.ai_token}",
            "Content-Type": "application/json"
        }
        
        # Payload exactly like in the test script (contexts_only format)
        payload = {
            "contexts": [
                {
                    "text": text
                }
            ]
        }
        
        print(f"Requesting embedding from {url}")
        print(f"Payload: {json.dumps(payload)}")
        
        try:
            # Make the request
            response = requests.post(url, headers=headers, json=payload)
            
            print(f"Response status: {response.status_code}")
            
            # Check if the request was successful
            if response.status_code != 200:
                print(f"Error response: {response.text[:500]}")
                return None
                
            # Parse the response
            result = response.json()
            
            # Extract the embedding vector from the response
            if "result" in result and "response" in result["result"]:
                response_data = result["result"]["response"]
                
                if isinstance(response_data, list) and response_data:
                    print(f"Successfully received embedding data")
                    print(f"First element type: {type(response_data[0])}")
                    
                    # Extract embedding properly based on response structure
                    if len(response_data) == 1 and isinstance(response_data[0], list):
                        # Format is [[ ... vector ... ]]
                        embedding = response_data[0]
                    elif all(isinstance(x, (int, float)) for x in response_data):
                        # Format is [ ... vector ... ]
                        embedding = response_data
                    else:
                        print(f"Unknown embedding format. First few elements: {response_data[:10]}")
                        return None
                        
                    print(f"Embedding dimensions: {len(embedding)}")
                    return embedding
                    
            print(f"Unexpected response structure: {json.dumps(result)[:1000]}")
            return None
            
        except Exception as e:
            print(f"Error generating embedding: {str(e)}")
            return None

    def query_vectorize(self, vector: List[float], top_k: int = 5) -> List[Dict[str, Any]]:
        """Query Vectorize database with the given vector."""
        url = self.vectorize_api_base.format(
            account_id=self.account_id,
            index_name=self.index_name
        )
        
        headers = {
            "Authorization": f"Bearer {self.vectorize_token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "vector": vector,
            "topK": top_k,
            "returnMetadata": "all"
        }
        
        print(f"Querying Vectorize at: {url}")
        
        try:
            response = requests.post(url, headers=headers, json=payload)
            
            if response.status_code != 200:
                print(f"Error querying Vectorize: {response.status_code}")
                print(f"Response: {response.text[:500]}")
                return []
            
            result = response.json()
            
            if "result" in result and "matches" in result["result"]:
                matches = result["result"]["matches"]
                print(f"Found {len(matches)} matches")
                return matches
            
            print(f"Unexpected Vectorize response structure")
            return []
            
        except Exception as e:
            print(f"Error querying Vectorize: {str(e)}")
            return []

    def format_results(self, matches: List[Dict[str, Any]]) -> List[Dict[str, str]]:
        """Format the Vectorize matches to the expected output format."""
        results = []
        
        for match in matches:
            metadata = match.get("metadata", {})
            if metadata.get("title") and metadata.get("slug"):
                results.append({
                    "title": metadata["title"],
                    "slug": metadata["slug"],
                    "score": f"{match.get('score', 0):.4f}"
                })
            else:
                print(f"Match missing title or slug: {match}")
                
        return results

    def search(self, query: str, top_k: int = 5) -> List[Dict[str, str]]:
        """Perform a complete search operation."""
        # Step 1: Generate embedding with BGE-M3
        embedding = self.generate_embedding(query)
        if not embedding:
            print("Failed to generate embedding")
            return []
        
        # Step 2: Query Vectorize
        matches = self.query_vectorize(embedding, top_k)
        if not matches:
            print("No matches found or error in querying Vectorize")
            return []
        
        # Step 3: Format results
        return self.format_results(matches)


def main():
    parser = argparse.ArgumentParser(description="Cloudflare Vectorize Search with BGE-M3")
    
    parser.add_argument("--account-id", required=True, help="Cloudflare account ID")
    parser.add_argument("--vectorize-token", required=True, help="Cloudflare Vectorize API token")
    parser.add_argument("--ai-token", required=True, help="Cloudflare AI API token")
    parser.add_argument("--index-name", help="Vectorize index name (defaults to blog-samrhea-posts-2025-03-18-v2)")
    parser.add_argument("--query", required=True, help="Search query text")
    parser.add_argument("--top-k", type=int, default=5, help="Number of results to return (default: 5)")
    parser.add_argument("--debug", action="store_true", help="Enable detailed debug output")
    
    args = parser.parse_args()
    
    # Initialize the searcher
    searcher = CloudflareVectorizeSearcher(
        account_id=args.account_id,
        vectorize_token=args.vectorize_token,
        ai_token=args.ai_token
    )
    
    # Set the index name if provided
    if args.index_name:
        searcher.set_index_name(args.index_name)
    
    # Perform the search
    results = searcher.search(args.query, args.top_k)
    
    # Print results in a nice format
    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
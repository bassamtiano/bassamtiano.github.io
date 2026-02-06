import os
import json

BLOG_DIR = 'blog'
INDEX_FILE = 'blog-index.json'

def generate_index():
    posts = []
    
    if not os.path.exists(BLOG_DIR):
        print(f"Error: Directory '{BLOG_DIR}' not found.")
        return

    # Walk through the blog directory
    for root, dirs, files in os.walk(BLOG_DIR):
        for file in files:
            if file == 'index.md':
                # Get path relative to BLOG_DIR
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, BLOG_DIR)
                
                # Ensure forward slashes for JSON/Web regardless of OS
                rel_path = rel_path.replace(os.sep, '/')
                
                posts.append(rel_path)

    # Sort posts: Reverse sort puts YYYY-MM-DD dates in descending order (newest first)
    # Files starting with letters (like 'test-image') will typically appear before numbers in reverse sort
    # depending on ASCII/Unicode value, but usually 't' > '2', so 'test' comes first. It's a reasonable default.
    posts.sort(reverse=True)

    with open(INDEX_FILE, 'w') as f:
        json.dump(posts, f, indent=4)

    print(f"Successfully generated {INDEX_FILE} with {len(posts)} posts:")
    for p in posts:
        print(f" - {p}")

if __name__ == "__main__":
    generate_index()

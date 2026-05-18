import os
import re

def print_section(title):
    print("\n" + "="*50)
    print(f"  {title}")
    print("="*50)

def scan_directory(path, prefix=""):
    """Recursively lists the structure of the directory, ignoring node_modules."""
    try:
        entries = sorted(os.listdir(path))
    except Exception as e:
        print(f"{prefix}└── Error reading directory: {e}")
        return

    entries = [e for e in entries if e not in ['node_modules', '.git', '.DS_Store', 'dist']]
    
    for i, entry in enumerate(entries):
        is_last = (i == len(entries) - 1)
        connector = "└── " if is_last else "├── "
        next_prefix = prefix + ("    " if is_last else "│   ")
        
        full_path = os.path.join(path, entry)
        if os.path.isdir(full_path):
            print(f"{prefix}{connector}[DIR] {entry}")
            scan_directory(full_path, next_prefix)
        else:
            print(f"{prefix}{connector}{entry}")

def read_file_content(path, max_lines=100):
    """Safely reads and prints a configuration or controller file."""
    if not os.path.exists(path):
        print(f"File not found: {path}")
        return
    print(f"\n--- File: {path} ---")
    try:
        with open(path, 'r', encoding='utf-8') as f:
            for i, line in enumerate(f):
                if i >= max_lines:
                    print("... [truncated]")
                    break
                print(line.rstrip())
    except Exception as e:
        print(f"Error reading file: {e}")

def find_and_display_auth_logic(backend_dir):
    """Looks for files handling authentication patterns."""
    print_section("LOOKING FOR AUTHENTICATION LOGIC")
    
    possible_paths = [
        "server.js",
        "index.js",
        "src/server.js",
        "src/index.js",
        "routes/auth.route.js",
        "routes/auth.js",
        "controllers/auth.controller.js",
        "controllers/auth.js"
    ]
    
    for rel_path in possible_paths:
        full_path = os.path.join(backend_dir, rel_path)
        if os.path.exists(full_path):
            read_file_content(full_path)

def main():
    backend_dir = os.getcwd()
    
    print_section("BACKEND FILE ENVIRONMENT STRUCTURE")
    print(f"Root: {backend_dir}")
    scan_directory(backend_dir)
    
    find_and_display_auth_logic(backend_dir)
    print("\n" + "="*50 + "\nBackend Inspection Complete.\n")

if __name__ == "__main__":
    main()
import os
import json
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

    # Filter out common build artifacts and dependencies
    entries = [e for e in entries if e not in ['node_modules', '.vite', 'dist', '.DS_Store']]
    
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

def read_file_snippet(path, max_lines=40):
    """Safely reads and prints the beginning of a file."""
    if not os.path.exists(path):
        print(f"File not found: {path}")
        return
    print(f"--- File: {path} ---")
    try:
        with open(path, 'r', encoding='utf-8') as f:
            for i, line in enumerate(f):
                if i >= max_lines:
                    print("... [truncated]")
                    break
                print(line.rstrip())
    except Exception as e:
        print(f"Error reading file: {e}")

def check_tailwind_references(src_dir):
    """Searches source files for key elements to confirm routing/wiring."""
    print_section("TAILWIND & SOURCE ANALYSIS")
    html_path = os.path.join(os.path.dirname(src_dir), "index.html")
    
    if os.path.exists(html_path):
        print("Checking index.html for root mounting node and script entry...")
        with open(html_path, 'r', encoding='utf-8') as f:
            content = f.read()
            print(f"  - Has id=\"root\": {'root' in content}")
            print(f"  - Script tag src: {re.findall(r'<script.*src=[\'\"](.*?)[\'\"]', content)}")
    else:
        print("index.html not found at root level!")

def main():
    frontend_dir = os.getcwd()
    
    print_section("PROJECT FILE ENVIRONMENT STRUCTURE")
    print(f"Root: {frontend_dir}")
    scan_directory(frontend_dir)
    
    print_section("CRITICAL CONFIGURATION FILES")
    read_file_snippet("vite.config.js")
    print()
    read_file_snippet("src/index.css")
    
    check_tailwind_references(os.path.join(frontend_dir, "src"))
    print("\n" + "="*50 + "\nInspection Complete.\n")

if __name__ == "__main__":
    main()
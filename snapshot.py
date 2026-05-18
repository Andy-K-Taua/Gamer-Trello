import os
import sys

# Common directories and files to ignore to prevent prompt bloating
DEFAULT_IGNORE_DIRS = {
    '.git', '__pycache__', 'node_modules', '.venv', 'venv', 
    'env', '.idea', '.vscode', 'build', 'dist', '.egg-info'
}
DEFAULT_IGNORE_FILES = {
    '.DS_Store', 'snapshot.py', 'package-lock.json', 'yarn.lock'
}
# Text-based extensions to include
ALLOWED_EXTENSIONS = {
    '.py', '.js', '.ts', '.jsx', '.tsx', '.json', '.yaml', 
    '.yml', '.md', '.txt', '.ini', '.cfg', '.html', '.css'
}

def get_project_structure(root_dir):
    """Generates a text-based tree structure of the project."""
    tree = []
    for root, dirs, files in os.walk(root_dir):
        dirs[:] = [d for d in dirs if d not in DEFAULT_IGNORE_DIRS]
        level = root.replace(root_dir, '').count(os.sep)
        indent = ' ' * 4 * level
        sub_folder = os.path.basename(root)
        
        if sub_folder and sub_folder != os.path.basename(root_dir):
            tree.append(f"{indent}📁 {sub_folder}/")
            
        sub_indent = ' ' * 4 * (level + 1)
        for f in files:
            if f not in DEFAULT_IGNORE_FILES and os.path.splitext(f)[1] in ALLOWED_EXTENSIONS:
                tree.append(f"{sub_indent}📄 {f}")
                
    return "\n".join(tree)

def build_snapshot(root_dir):
    """Combines project structure and file contents into one master string."""
    snapshot = []
    snapshot.append("=== PROJECT STRUCTURE ===")
    snapshot.append(get_project_structure(root_dir))
    snapshot.append("\n=== FILE CONTENTS ===")
    
    for root, dirs, files in os.walk(root_dir):
        dirs[:] = [d for d in dirs if d not in DEFAULT_IGNORE_DIRS]
        
        for f in files:
            if f in DEFAULT_IGNORE_FILES or os.path.splitext(f)[1] not in ALLOWED_EXTENSIONS:
                continue
                
            file_path = os.path.join(root, f)
            relative_path = os.path.relpath(file_path, root_dir)
            
            snapshot.append(f"\n--- START OF FILE: {relative_path} ---")
            try:
                with open(file_path, 'r', encoding='utf-8', errors='replace') as file_content:
                    snapshot.append(file_content.read())
            except Exception as e:
                snapshot.append(f"[Error reading file: {str(e)}]")
            snapshot.append(f"--- END OF FILE: {relative_path} ---")
            
    return "\n".join(snapshot)

def chunk_snapshot(snapshot_text, max_chars):
    """Splits the snapshot text into chunks based on character limit."""
    chunks = []
    current_chunk = []
    current_length = 0
    lines = snapshot_text.splitlines()
    
    for line in lines:
        if current_length + len(line) + 1 > max_chars:
            if current_chunk:
                chunks.append("\n".join(current_chunk))
            current_chunk = [line]
            current_length = len(line) + 1
        else:
            current_chunk.append(line)
            current_length += len(line) + 1
            
    if current_chunk:
        chunks.append("\n".join(current_chunk))
        
    return chunks

def main():
    root_directory = os.getcwd()
    print("🤖 Gathering code and wiring snapshot...")
    
    full_snapshot = build_snapshot(root_directory)
    total_chars = len(full_snapshot)
    
    print(f"✅ Snapshot created! Total size: {total_chars:,} characters.\n")
    
    print("--- MENU OPTIONS ---")
    print("1. Print full snapshot to terminal")
    print("2. Split and print chunks by character limit")
    print("3. Exit")
    
    choice = input("\nSelect an option (1-3): ").strip()
    
    if choice == '1':
        print("\n=== FULL SNAPSHOT START ===")
        print(full_snapshot)
        print("=== FULL SNAPSHOT END ===\n")
        
    elif choice == '2':
        try:
            limit_input = input("Enter max character limit per prompt (e.g., 10000, 32000): ").strip()
            max_chars = int(limit_input)
            
            chunks = chunk_snapshot(full_snapshot, max_chars)
            total_chunks = len(chunks)
            print(f"\n🧩 Split into {total_chunks} chunks.")
            
            for i, chunk in enumerate(chunks, 1):
                print(f"\n--- [PART {i} OF {total_chunks}] ({len(chunk):,} chars) ---")
                print(chunk)
                print(f"--- [END OF PART {i}] ---")
                
                if i < total_chunks:
                    input(f"\n👉 Press Enter to display Part {i+1}...")
            
            print("\n🎉 All chunks have been printed!")
            
        except ValueError:
            print("❌ Invalid number entered. Exiting.")
            
    else:
        print("👋 Exiting.")

if __name__ == "__main__":
    main()

import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Remove framer-motion imports
    content = re.sub(r"import\s+\{.*motion.*\}\s+from\s+['\"]framer-motion['\"];?\n?", "", content)
    content = re.sub(r"import\s+motion\s+from\s+['\"]framer-motion['\"];?\n?", "", content)
    content = re.sub(r"import\s+\{.*AnimatePresence.*\}\s+from\s+['\"]framer-motion['\"];?\n?", "", content)

    # Replace <motion.div> with <div> etc.
    content = re.sub(r"<motion\.([a-zA-Z0-9]+)", r"<\1", content)
    content = re.sub(r"</motion\.([a-zA-Z0-9]+)>", r"</\1>", content)

    # Remove framer-motion props
    props_to_remove = [
        r"initial=\{[^}]+\}",
        r"animate=\{[^}]+\}",
        r"transition=\{[^}]+\}",
        r"whileHover=\{[^}]+\}",
        r"whileTap=\{[^}]+\}",
        r"whileInView=\{[^}]+\}",
        r"viewport=\{[^}]+\}",
        r"exit=\{[^}]+\}",
        r"variants=\{[^}]+\}",
        r"layoutId=[\"'][^\"']+[\"']",
        r"layout=\{[^}]+\}",
        r"\blayout\b(?=[\s>])",
        r"style=\{\{.*?\}\}"  # Be careful with styles, but motion relies on them often for transforms
    ]
    
    # Also need to handle nested braces in props roughly.
    # For now, simplistic regex for common cases.
    def remove_prop(match):
        return ""
        
    # Better nested brace matching for props like initial={{ opacity: 0, y: 20 }}
    # We will just remove the known word and following curly braces
    for prop in ['initial', 'animate', 'transition', 'whileHover', 'whileTap', 'whileInView', 'viewport', 'exit', 'variants', 'layout', 'layoutId']:
        # This handles `prop={{...}}` or `prop={...}`
        content = re.sub(r"\b" + prop + r"\s*=\s*\{\{.*?\}\}", "", content, flags=re.DOTALL)
        content = re.sub(r"\b" + prop + r"\s*=\s*\{[^{}]*\}", "", content, flags=re.DOTALL)
        content = re.sub(r"\b" + prop + r"\s*=\s*['\"][^'\"]*['\"]", "", content)
        content = re.sub(r"\b" + prop + r"\b(?=[\s>])", "", content)

    if content != original_content:
        # Add basic class to retain some animation if wanted
        # content = re.sub(r"<div(\s+className=[\"'])([^\"']*)[\"']", r"<div\1\2 animate-fade-in\"", content)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

def main():
    for root, dirs, files in os.walk('.'):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if '.next' in dirs:
            dirs.remove('.next')
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                process_file(os.path.join(root, file))

if __name__ == '__main__':
    main()

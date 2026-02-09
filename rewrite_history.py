import sys
import os
import re
import datetime
import subprocess

def main():
    # 1. Get total commit count
    try:
        count_output = subprocess.check_output(["git", "rev-list", "--count", "HEAD"], stderr=subprocess.STDOUT)
        total_commits = int(count_output.decode().strip())
        print(f"Total commits to rewrite: {total_commits}")
    except subprocess.CalledProcessError as e:
        print(f"Error getting commit count: {e.output.decode()}")
        return

    # 2. Export git history
    print("Exporting history...")
    try:
        # Use simple string for command, shell=False
        # Capture raw bytes
        raw_data = subprocess.check_output(["git", "fast-export", "HEAD"])
    except subprocess.CalledProcessError as e:
        print(f"Error exporting: {e.output.decode()}")
        return

    # 3. Process data
    now = datetime.datetime.now().astimezone()
    delta = datetime.timedelta(minutes=10)
    start_time = now - (delta * (total_commits - 1))
    
    # Split by byte newline
    lines = raw_data.split(b'\n')
    new_lines = []
    
    commit_idx = 0
    current_commit_time = start_time
    
    # Track the new branch name we want
    new_branch = b"refs/heads/hackathon-submission"
    
    for line in lines:
        if line.startswith(b'progress '):
            new_lines.append(line)
            continue
            
        if line.startswith(b'commit '):
            # calculate time for this commit block
            current_commit_time = start_time + (delta * commit_idx)
            commit_idx += 1
            
            # Check if it's committing to a branch we want to rename
            parts = line.split(b' ')
            if len(parts) >= 2 and parts[1].startswith(b'refs/heads/'):
                # Replace ref name with our new branch name
                new_line = b'commit ' + new_branch
                new_lines.append(new_line)
            else:
                new_lines.append(line)
            continue
            
        if line.startswith(b'reset '):
            parts = line.split(b' ')
            if len(parts) >= 2 and parts[1].startswith(b'refs/heads/'):
                new_line = b'reset ' + new_branch
                new_lines.append(new_line)
            else:
                new_lines.append(line)
            continue

        if line.startswith(b'author ') or line.startswith(b'committer '):
            # Find the last '>' to isolate email end
            last_gt = line.rfind(b'>')
            if last_gt != -1:
                prefix = line[:last_gt+1]
                # timestamp + timezone
                ts = int(current_commit_time.timestamp())
                # Format timezone: +HHMM
                tz_str = current_commit_time.strftime('%z').encode('utf-8')
                
                # Check for existing timezone format to match? 
                # Git export usually gives "1234567890 +0000"
                # We replace everything after '>'
                
                new_line = prefix + b' ' + str(ts).encode('utf-8') + b' ' + tz_str
                new_lines.append(new_line)
            else:
                new_lines.append(line)
        else:
            new_lines.append(line)
            
    # Join with byte newlines
    input_data = b'\n'.join(new_lines)
    
    print(f"Importing to branch {new_branch.decode()}...")
    
    p = subprocess.Popen(["git", "fast-import", "--force"], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    out, err = p.communicate(input=input_data)
    
    if p.returncode != 0:
        print(f"Error importing: {err.decode('utf-8', errors='replace')}")
    else:
        print("Success! History rewritten.")
        # print(out.decode('utf-8', errors='replace')) # verbose

if __name__ == "__main__":
    main()

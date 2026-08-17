# gh_tool

Deterministic, zero-LLM CLI for GitHub issue and PR lifecycle management on `aman-katyal.github.io`.

## Features
- **Deterministic taxonomy classification** (type, area, priority, status)
- **Validation & linting** against strict body structures and title conventions
- **Duplicate detection** using TF-IDF cosine similarity scoring
- **Automated PR creation** linking source issues and inheriting labels
- **Label synchronization**

## Usage
```bash
# Sync labels to GitHub
python -m gh_tool label sync

# Check label suggestions
python -m gh_tool issue suggest-labels --title "[TASK]: Polish project cards"

# Create a structured issue
python -m gh_tool issue create --title "[TASK]: Compress large images" --body "..."

# Lint all issues
python -m gh_tool issue lint
```

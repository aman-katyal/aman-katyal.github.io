"""Allow `python -m gh_tool` invocation."""
import sys
from pathlib import Path

# Support running both `python -m gh_tool` and `python .agents/tools/gh_tool`
if __package__ is None or __package__ == "":
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
    from gh_tool.cli import main
else:
    from .cli import main

if __name__ == "__main__":
    main()

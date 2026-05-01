"""conftest.py — KN020/BP002 distribution test path resolution."""
import sys
from pathlib import Path

# Ensure distribution package directory is importable without full package path
sys.path.insert(0, str(Path(__file__).parent))

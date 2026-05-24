#!/usr/bin/env bash
# git_commit_message.sh — Canonical multi-line git commit helper for bash.
#
# Wraps `git commit -F <tempfile>` with proper UTF-8 encoding and automatic cleanup.
# Avoids shell argument-quoting hazards by routing the message through git's -F flag.
# Per BRIDLE v10.5 (B124). Canonical pattern for multi-line commit messages across
# all Knight + Bishop sessions on bash / WSL / git-bash / Linux environments.
#
# Usage:
#   ./librarian-mcp/scripts/git_commit_message.sh "$msg" [--extra-arg ...]
#
#   # Pipe-based (preferred for very long messages):
#   echo "$msg" | ./librarian-mcp/scripts/git_commit_message.sh - [--extra-arg ...]
#
#   # File-based:
#   ./librarian-mcp/scripts/git_commit_message.sh -F commit_message.txt [--extra-arg ...]
#
# Exit codes:
#   Passed through from `git commit`. 0 = success.
#
# Notes:
#   - Temp file is created via mktemp and removed on exit (success, fail, or signal).
#   - UTF-8 encoding is the system default; explicit re-encoding not required on Linux/Mac.
#   - The `-` (stdin) and `-F <file>` modes are alternatives to the positional arg.

set -euo pipefail

usage() {
    cat <<EOF
Usage:
  $(basename "$0") "<message>" [extra git args...]
  $(basename "$0") - [extra git args...]                # message from stdin
  $(basename "$0") -F <file> [extra git args...]        # message from file

Examples:
  msg=\$(cat <<'INNER_EOF'
K###: Title

Body.
INNER_EOF
)
  $(basename "$0") "\$msg"

  echo "K###: Quick fix" | $(basename "$0") -

  $(basename "$0") -F commit_msg.txt --signoff
EOF
}

if [[ $# -eq 0 ]] || [[ "$1" == "-h" ]] || [[ "$1" == "--help" ]]; then
    usage
    exit 0
fi

# Determine input source
TEMP_FILE=""
SOURCE_FILE=""
EXTRA_ARGS=()
CLEANUP=0

cleanup() {
    if [[ "$CLEANUP" == "1" ]] && [[ -n "$TEMP_FILE" ]] && [[ -f "$TEMP_FILE" ]]; then
        rm -f "$TEMP_FILE"
    fi
}
trap cleanup EXIT INT TERM

if [[ "$1" == "-" ]]; then
    # Read from stdin
    TEMP_FILE=$(mktemp)
    CLEANUP=1
    cat > "$TEMP_FILE"
    SOURCE_FILE="$TEMP_FILE"
    shift
    EXTRA_ARGS=("$@")
elif [[ "$1" == "-F" ]]; then
    # User-supplied file
    if [[ $# -lt 2 ]]; then
        echo "ERROR: -F requires a filename argument" >&2
        usage
        exit 2
    fi
    SOURCE_FILE="$2"
    if [[ ! -f "$SOURCE_FILE" ]]; then
        echo "ERROR: file not found: $SOURCE_FILE" >&2
        exit 2
    fi
    shift 2
    EXTRA_ARGS=("$@")
else
    # Positional arg = message string
    TEMP_FILE=$(mktemp)
    CLEANUP=1
    printf '%s' "$1" > "$TEMP_FILE"
    SOURCE_FILE="$TEMP_FILE"
    shift
    EXTRA_ARGS=("$@")
fi

# Invoke git commit with -F
git commit -F "$SOURCE_FILE" "${EXTRA_ARGS[@]}"
GIT_EXIT=$?

exit $GIT_EXIT

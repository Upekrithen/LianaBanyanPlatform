from .file_exists import check as file_exists
from .git_committed import check as git_committed
from .supabase_row_exists import check as supabase_row_exists
from .librarian_index_contains import check as librarian_index_contains
from .count_matches import check as count_matches
from .hash_matches import check as hash_matches
from .response_received_within import check as response_received_within

PREDICATE_REGISTRY = {
    "file_exists": file_exists,
    "git_committed": git_committed,
    "supabase_row_exists": supabase_row_exists,
    "librarian_index_contains": librarian_index_contains,
    "count_matches": count_matches,
    "hash_matches": hash_matches,
    "response_received_within": response_received_within,
}

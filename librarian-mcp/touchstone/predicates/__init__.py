from .file_exists import check as file_exists
from .git_committed import check as git_committed
from .supabase_row_exists import check as supabase_row_exists
from .librarian_index_contains import check as librarian_index_contains
from .count_matches import check as count_matches
from .hash_matches import check as hash_matches
from .response_received_within import check as response_received_within
from .letter_drafted import check as letter_drafted
from .letter_locked import check as letter_locked
from .letter_dispatched import check as letter_dispatched
from .letter_dispatch_authorized import check as letter_dispatch_authorized
from .conductor_routing_within import check as conductor_routing_within

PREDICATE_REGISTRY = {
    "file_exists": file_exists,
    "git_committed": git_committed,
    "supabase_row_exists": supabase_row_exists,
    "librarian_index_contains": librarian_index_contains,
    "count_matches": count_matches,
    "hash_matches": hash_matches,
    "response_received_within": response_received_within,
    "letter_drafted": letter_drafted,
    "letter_locked": letter_locked,
    "letter_dispatched": letter_dispatched,
    "letter_dispatch_authorized": letter_dispatch_authorized,
    "conductor_routing_within": conductor_routing_within,
}

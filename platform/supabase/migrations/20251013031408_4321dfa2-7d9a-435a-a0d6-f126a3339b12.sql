-- Top up the LB funding pool to enable gas budget for testing
update public.lb_funding_pool
set total_pool_amount = 1000, -- $1000 total pool
    gas_budget_percentage = 1.0, -- keep 1%
    allocated_to_gas = 0,
    updated_at = now();
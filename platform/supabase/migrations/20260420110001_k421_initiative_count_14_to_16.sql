-- K421 Task 1: Fix initiative count drift in letter_dispatch_queue
-- Founder greenlit B110: "Yes correct that to 16. Please, once and FOR ALL."
-- Targets: "14 initiatives", "14 charitable initiatives", "14 Charitable Initiatives",
--          "15 initiatives" (Bambu Lab letter), "The 14 Initiatives"
-- Column: letter_body (TEXT)
-- Safety: only exact text substring replacement; no regex; no structural changes

-- Pass 1: "The 14 Initiatives" → "The 16 Initiatives" (section headers)
UPDATE letter_dispatch_queue
SET letter_body = REPLACE(letter_body, 'The 14 Initiatives', 'The 16 Initiatives'),
    updated_at = now()
WHERE letter_body ILIKE '%The 14 Initiatives%';

-- Pass 2: "14 charitable initiatives" → "16 charitable initiatives" (lowercase)
UPDATE letter_dispatch_queue
SET letter_body = REPLACE(letter_body, '14 charitable initiatives', '16 charitable initiatives'),
    updated_at = now()
WHERE letter_body ILIKE '%14 charitable initiatives%';

-- Pass 3: "14 Charitable Initiatives" → "16 Charitable Initiatives" (title case)
UPDATE letter_dispatch_queue
SET letter_body = REPLACE(letter_body, '14 Charitable Initiatives', '16 Charitable Initiatives'),
    updated_at = now()
WHERE letter_body ILIKE '%14 Charitable Initiatives%';

-- Pass 4: "14 initiatives" → "16 initiatives" (catch remaining lowercase)
UPDATE letter_dispatch_queue
SET letter_body = REPLACE(letter_body, '14 initiatives', '16 initiatives'),
    updated_at = now()
WHERE letter_body ILIKE '%14 initiatives%';

-- Pass 5: "15 initiatives" → "16 initiatives" (Bambu Lab letter + any others)
UPDATE letter_dispatch_queue
SET letter_body = REPLACE(letter_body, '15 initiatives', '16 initiatives'),
    updated_at = now()
WHERE letter_body ILIKE '%15 initiatives%';

-- Pass 6: "The 14 Initiatives Overview" → "The 16 Initiatives Overview"
UPDATE letter_dispatch_queue
SET letter_body = REPLACE(letter_body, 'The 14 Initiatives Overview', 'The 16 Initiatives Overview'),
    updated_at = now()
WHERE letter_body ILIKE '%The 14 Initiatives Overview%';

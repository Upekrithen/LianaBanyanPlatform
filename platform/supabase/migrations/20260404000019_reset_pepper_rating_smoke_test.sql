-- B076 / BISHOP SESSION
-- One-shot cleanup: reset smoke-test data from K272 deployment verification
-- Removes 3 anonymous smoke-test ratings on pudding #1 and resets its counters

DELETE FROM public.pudding_pepper_ratings
  WHERE pudding_number = 1
    AND rater_id IS NULL
    AND comment LIKE 'smoke test%';

UPDATE public.cephas_puddings
  SET view_count = 0,
      rating_active = false,
      pepper_rating_avg = NULL,
      pepper_rating_count = 0
  WHERE pudding_number = 1;

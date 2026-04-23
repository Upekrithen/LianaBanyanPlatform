-- Seed default 8-step walkthrough for Ambassadors (Session 5 V1)
-- Run after 20260312000004_ambassador_system.sql (which seeds the default sequence)

INSERT INTO walkthrough_steps (sequence_id, step_number, title, instruction, screen_hint, tip, common_questions, estimated_seconds, requires_action, action_label)
SELECT s.id, 1, 'Open the Link Together',
  'Say: "Open the link I sent you, and let''s start there." Wait for them to confirm they see the Welcome page.',
  'They should see the WelcomeGate with the fable flipbook and three doors.',
  'If the page is slow, have them refresh. If they''re on mobile, it works fine — just smaller.',
  ARRAY['What if they can''t open the link?', 'What browser works best?'],
  30, true, 'Wait for recruit to confirm they see the page'
FROM walkthrough_sequences s WHERE s.sequence_key = 'default' LIMIT 1
ON CONFLICT (sequence_id, step_number) DO NOTHING;

INSERT INTO walkthrough_steps (sequence_id, step_number, title, instruction, screen_hint, tip, common_questions, estimated_seconds, requires_action, action_label)
SELECT s.id, 2, 'Take the Treasure Map Quiz',
  'Say: "Click the first door — Start the Treasure Map. It''s a 5-minute quiz that helps us figure out where you fit best." Walk them through each question. Explain that there are no wrong answers.',
  'They should see the 7-question Treasure Map quiz at /treasure-map.',
  'Most people pick "I want to earn money" or "I want to save money" — both are great. If they seem overwhelmed, say "Just pick what feels right, we can always change later."',
  ARRAY['What if I don''t know the answer?', 'Can I retake it?', 'What does this quiz do?'],
  300, true, 'Wait for recruit to complete all 7 questions'
FROM walkthrough_sequences s WHERE s.sequence_key = 'default' LIMIT 1
ON CONFLICT (sequence_id, step_number) DO NOTHING;

INSERT INTO walkthrough_steps (sequence_id, step_number, title, instruction, screen_hint, tip, common_questions, estimated_seconds, requires_action, action_label)
SELECT s.id, 3, 'Review Their Results',
  'Say: "Great! Now look at your results. You got [X] play tiles. Each one is a starting path." Point out which tile matches their interests. Recommend starting with ONE.',
  'They should see 1-3 play tiles based on their quiz answers.',
  'If they got Let''s Make Dinner AND Let''s Get Groceries, suggest starting with whichever they''re more excited about. One at a time.',
  ARRAY['What''s a play tile?', 'Can I do more than one?'],
  120, false, NULL
FROM walkthrough_sequences s WHERE s.sequence_key = 'default' LIMIT 1
ON CONFLICT (sequence_id, step_number) DO NOTHING;

INSERT INTO walkthrough_steps (sequence_id, step_number, title, instruction, screen_hint, tip, common_questions, estimated_seconds, requires_action, action_label)
SELECT s.id, 4, 'Sign Up for Membership',
  'Say: "Now let''s get you signed up. It''s $5 for the whole year — that''s it. This saves everything you just did and connects you to real Crews in your area." Guide them through the signup form.',
  'They should see the membership signup flow.',
  'The $5 is a HUGE selling point. Say: "Five dollars for the year. Not per month. For the YEAR." If they hesitate, remind them their Treasure Map results are saved and they''ll get matched to a real Crew.',
  ARRAY['Why does it cost anything?', 'What do I get for $5?', 'Can I try it free first?'],
  180, true, 'Wait for recruit to complete signup and payment'
FROM walkthrough_sequences s WHERE s.sequence_key = 'default' LIMIT 1
ON CONFLICT (sequence_id, step_number) DO NOTHING;

INSERT INTO walkthrough_steps (sequence_id, step_number, title, instruction, screen_hint, tip, common_questions, estimated_seconds, requires_action, action_label)
SELECT s.id, 5, 'Join or Start a Crew',
  'Say: "Now you''re a member! Let''s get you into a Crew. A Crew is 12 people who each list one small offer — like a dinner or a grocery run — and back one other person''s offer." Help them find an existing Crew or start one.',
  'They should see the Crew creation wizard or a list of available Crews.',
  'If there are existing Crews with open spots, joining is easier. If not, they can start a new Crew and we''ll help fill it. Either way, they need to list ONE offer.',
  ARRAY['What if I don''t know what to offer?', 'Do I have to cook?', 'How much should I charge?'],
  240, true, 'Wait for recruit to join or create a Crew'
FROM walkthrough_sequences s WHERE s.sequence_key = 'default' LIMIT 1
ON CONFLICT (sequence_id, step_number) DO NOTHING;

INSERT INTO walkthrough_steps (sequence_id, step_number, title, instruction, screen_hint, tip, common_questions, estimated_seconds, requires_action, action_label)
SELECT s.id, 6, 'List Their First Offer',
  'Say: "What''s one thing you could offer to a neighbor for $15-$20? A home-cooked meal? A grocery run? A craft? Let''s list it." Help them fill in the offer details on their Crew page.',
  'They should see the offer creation form within their Crew dashboard.',
  'Keep it simple. One dish they already know how to make. One errand route they already drive. The point is STARTING, not perfection. Say: "You can always change it later."',
  ARRAY['What if my offer isn''t good enough?', 'What can I legally sell?', 'How do I price it?'],
  180, true, 'Wait for recruit to list one offer'
FROM walkthrough_sequences s WHERE s.sequence_key = 'default' LIMIT 1
ON CONFLICT (sequence_id, step_number) DO NOTHING;

INSERT INTO walkthrough_steps (sequence_id, step_number, title, instruction, screen_hint, tip, common_questions, estimated_seconds, requires_action, action_label)
SELECT s.id, 7, 'Back One Other Member',
  'Say: "Last step for today — pick one other person in your Crew and back their offer. You''re spending about $15-$20, and 83.3% goes straight to them. This is how everyone gets their first real customer." Walk them through the backing flow.',
  'They should see the CrewOfferGrid with other members'' offers.',
  'If there are no other members yet (new Crew), say: "As soon as someone else joins, you''ll see their offer here and you can be their first backer. You''re early — that''s a good thing."',
  ARRAY['Where does the money go?', 'What if I don''t like any offers?', 'Is this like an investment?'],
  120, true, 'Wait for recruit to back one offer (or confirm they understand the process if Crew is still filling)'
FROM walkthrough_sequences s WHERE s.sequence_key = 'default' LIMIT 1
ON CONFLICT (sequence_id, step_number) DO NOTHING;

INSERT INTO walkthrough_steps (sequence_id, step_number, title, instruction, screen_hint, tip, common_questions, estimated_seconds, requires_action, action_label)
SELECT s.id, 8, 'Wrap Up — You''re In!',
  'Say: "That''s it. You''re a member, you''re in a Crew, and you''ve got your first offer listed. I''m your Ambassador — if you ever have a question, you come to me first. Not a support ticket, not a chatbot. Me." Give them your contact info if they don''t already have it.',
  'They should see their Crew dashboard with their offer listed.',
  'This is the most important moment. Make it PERSONAL. They now have a human being — you — as their go-to. That''s what makes this different from every other platform.',
  ARRAY['What happens next?', 'How do I contact you?', 'When does the Crew start?'],
  60, false, NULL
FROM walkthrough_sequences s WHERE s.sequence_key = 'default' LIMIT 1
ON CONFLICT (sequence_id, step_number) DO NOTHING;

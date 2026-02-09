-- Add tagline column to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS tagline text;

-- Update Let's Make Dinner with tagline
UPDATE projects 
SET tagline = 'Everyone Eats Tonight'
WHERE name = 'Let''s Make Dinner';

-- Update DefenseClaws to Defense Claws with tagline and description
UPDATE projects 
SET 
  name = 'Defense Claws',
  tagline = 'For Someone You Love',
  description = 'The physical product protects as much as we can without physically being there; Legal Protection and Support for when you need it. All proceeds of Defense Claws™ go to funding the Legal Defense Fund for any registered member. Any person with an Email Address can be confidentially registered by anyone else. All it does is link a confidential purchase to a registered email (but does NOT send an email to it) so that it provides defenses for someone that you hope never needs it. So that for $6, you have protection. Physically. Legally. Backed by The Liana Banyan Corporation.'
WHERE name = 'DefenseClaws' OR name = 'Defense Claws';
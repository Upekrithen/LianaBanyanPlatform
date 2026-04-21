# Hexisle Campaign - Liana Banyan Branch Project

**Status**: Branch (Subsidiary/Affiliate of Liana Banyan)
**Campaign Type**: 3D Printed Miniatures Game
**Source**: Google Doc imported 2025-01-16
**Asset Lock Status**: Content locked, authority on LB Portal

---

## Campaign Overview

Hexisle is a survival-exploration tabletop game following exiled peoples across seven mysterious islands, each presenting unique challenges and requiring different skills to overcome.

---

## Stage 1: Harvest

**Theme**: Survival • Resource Gathering • First Steps
**Image**: `src/assets/hexisle-1-harvest.jpg`

You awake to the sound of waves.

Wiping the sand from your face and clothes, you exit your small shelter and take in your surroundings. An enormous beach stretches out before you, desolate and rocky. Small shrubs and grasses cling to the stones, clawing at whatever resources this barren place can provide. Among them are shelters, cobbled from driftwood and debris, and filled with haggard and starving people: your subjects. They look up from their sputtering campfires as you pass. You, their king. You have all been left here to die in this lifeless place, a slow and honorless death. Your gaze moves from them to the greater beach, following its ascent upwards as the landscape rises from the sea into the distance. On a small hill many miles away, a small, thin tree sticks out from the horizon, stubbornly growing from the desolate landscape into the sky. You may have been left here to die, but you're not dead yet. You take a deep breath, and take your first steps into the island.

---

## Stage 2: Navigate

**Theme**: Exploration • Navigation • Danger
**Image**: `src/assets/hexisle-2-navigate.jpg`

*(Implied to be an extension of the same island, as a canoe isn't strong enough to survive the open sea, but it's treated as a different level all the same)*

As your people paddle their canoes across the coast along the island, the land seems to rise from the sea: cliffs. The land here is jagged and hostile, separated into mesas by fjords that snake through them, forming a great stone maze. The water between them swirls hungrily with whirlpools, and the skeletal remains of shipwrecks stick out from below; other exiles. Yours are not the first people to sail these waters, or die in them. From the tops of the cliffs you see the branches of trees growing. The resources found above could be useful, should you find a way to reach them…

---

## Stage 3: Engineer

**Theme**: Construction • Problem Solving • Scale
**Image**: `src/assets/hexisle-3-engineer.jpg`

Sailing your longship far away from the desert island, you encounter great towers reaching from the sea. Massive fossilized tree stumps, remains of what was once a great forest, serve as the landscape here. Smaller trees yet grow from their walls, reaching from one another like bridges connecting the spires together. Small creatures can be seen crossing them, apelike and large enough to pose a threat. As you dock along the side of one of the large roots, you look upwards to the groves above and wonder how one might reach them.

---

## Stage 4: Battle

**Theme**: Combat • Enemies • Weather
**Image**: `src/assets/hexisle-4-battle.jpg`

Your fleet follows the trail of shipwrecks like a trail, chasing the signs of life until they lead you to a new island. It rises from the horizon like a dark head of a giant, and flashes angrily at your approach. A thunderhead. This island is permanently covered by storms which wrack its beaches with fierce winds and torrential rain. The weathered landscape is covered in discarded weapons and armor, which are so plentiful they seem to grow from the sand like grass. But as you look, a wailing can be heard through the storm. Scores of bright eyes gaze at your ship from just beyond your limited field of vision, their approach covered by the veil of the rain. Arm yourself, for you are not alone here.

---

## Stage 5: Seek

**Theme**: Discovery • Survival • Adaptation
**Image**: `src/assets/hexisle-5-seek.jpg`

You hear this island before you see it. Huge columns of fire spew from volcanic geysers, towers of molten rock seeming to grow from them. The island itself seems to churn and move as if alive. Its surface is porous and pocked with numerous caves and tunnels that glow with rivers of magma. Despite these conditions, old shelters can be found hidden within the rocks, signs that this place was traversable somehow. People lived here. You must find the method they used to survive this climate if your people are to survive the gauntlet of fire.

---

## Stage 6: Magic

**Theme**: Mystery • Ancient Power • Runes
**Image**: `src/assets/hexisle-6-magic.jpg`

Natural formation gives way to monstrosity as you approach the next island, which lies in the water as a great skeleton. Its ribs are beaches, its limbs reaching into the horizon as if trying to grasp the world itself. Plants and animals sprout from the cracked bone of its mass, supping on the nutrients of its ancient marrow. The skull of this creature is nowhere to be found, and the exact nature of its form in life is impossible to surmise from what little of it you can see from your ship. Along with the flora and fauna that sup on the carcass of this ancient titan, you see sigils carved into the walls of its landscape. Further exploration reveals caves full of tablets written in a strange language that seems to wake the forces of nature itself.

---

## Stage 7: Train

**Theme**: Finale • Mystery • Homecoming
**Image**: `src/assets/hexisle-7-train.jpg`

A great siege engine lies capsized in the water, its build larger than any human civilization could have ever created. It is miles long, its form stretching so far into the sky that the clouds are halted against it. Its deck is a country. Its hull is like the crust of the earth. A great feat of engineering that could humble the very gods. And yet it crumbled all the same, reclaimed by nature and sticking out from the sea like a gargantuan shadow. But more than just nature lives here, as strange life forms vanish into its portholes at your fleet's approach. Whispering is heard all around, eyes peek from darkened openings, and strange humming from deep in your mind seems to call out to you from within it. A door, the hum tells you. A door that pierces through the dark sea. A door that can take you home. The whispers grow louder as you dock along the side of the great machine, and delve into its depths.

---

## Production Notes

- **Branch Insignia**: Liana vine/tendril (to be designed)
- **Asset Lock Mechanism**: Google Doc import → LB Portal asset_submissions table
- **Categories**: Tabletop Gaming > Fantasy Miniatures > Game Compatible
- **Scale**: 28mm-32mm standard miniature scale
- **Production Stage**: Germination (concept/design phase)

---

## Asset Locking Workflow

1. Designer shares Google Doc with campaign content
2. LB Portal fetches and parses content
3. Content imported to `asset_submissions` table with:
   - `asset_type`: 'campaign_narrative' or 'campaign_artwork'
   - `is_contribution_locked`: true (prevents unauthorized edits)
   - `asset_content`: JSON with stage data and image references
4. Project owner reviews and approves
5. Locked content serves as authoritative source for manufacturing

---

*This document represents the locked creative assets for the Hexisle campaign project under the Liana Banyan Branch program.*

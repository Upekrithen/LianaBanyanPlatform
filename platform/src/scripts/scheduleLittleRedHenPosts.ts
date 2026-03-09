/**
 * Little Red Hen Story - Social Media Post Scheduler
 * 
 * Creates 25 posts across 3 acts, building up cumulatively within each act.
 * Each act starts fresh with image 1 of that act.
 * 
 * Usage: Import and call scheduleLittleRedHenPosts() from admin panel
 */

import { supabase } from '@/integrations/supabase/client';

// Image mapping: display order -> actual hen file number
const SCENE_ORDER = [
  // Act 1: Village Story (1-13)
  { img: 1, caption: "The Little Red Hen finds some wheat seeds..." },
  { img: 2, caption: "'Who will help me plant this wheat?' 'Not I!' said the others." },
  { img: 3, caption: "So she planted, harvested, ground, and baked it herself." },
  { img: 4, caption: "'Let's do it TOGETHER next time!' She packs bread and seeds." },
  { img: 5, caption: "The Hen arrives at a village, carrying her basket and a stone." },
  { img: 6, caption: "'Soup from a STONE?' The villagers watch, confused." },
  { img: 7, caption: "Each villager adds something small: salt, a potato, herbs, an onion..." },
  { img: 8, caption: "Soup is ready! But the bread runs out before everyone gets some." },
  { img: 9, caption: "The Hen holds up wheat seeds. 'To have more bread, we need to GROW more wheat.'" },
  { img: 10, caption: "In the fields, ants pile up seeds while grasshoppers take the piles." },
  { img: 11, caption: "The Hen and villagers approach the ants." },
  { img: 12, caption: "The Hen shows the ants: 'Plant wheat, don't just pile seeds!'" },
  { img: 13, caption: "Together they plant, harvest, grind, and bake as ONE team." },
  // Act 2: The Dream (14-18)
  { img: 24, caption: "The Hen turns to the ants: 'You're gonna rattle the stars.'" },
  { img: 19, caption: "'How did you know what to do?' asks a young ant." },
  { img: 20, caption: "The Hen daydreams of a Viking ship while cooking in the city." },
  { img: 21, caption: "She sees hungry animals outside a locked building full of bread." },
  { img: 22, caption: "She reaches into her dream and grabs an oar — the same as her spoon." },
  // Act 3: The Stand (19-25)
  { img: 14, caption: "The grasshoppers watch, angry. Hopper points at the ants." },
  { img: 15, caption: "Two groups face each other. Tension in the air." },
  { img: 16, caption: "The ants realize: 'Wait... WE outnumber THEM!'" },
  { img: 17, caption: "The ants link arms in army ant formation." },
  { img: 18, caption: "'WE ARE THE ANTS' — Standing firm together." },
  { img: 25, caption: "Hopper sits alone, defeated. Cold and sad." },
  { img: 26, caption: "..." },
];

// Act boundaries (0-indexed)
const ACT_1_END = 12; // indices 0-12 (13 scenes)
const ACT_2_END = 17; // indices 13-17 (5 scenes)
// Act 3 is indices 18-24 (7 scenes)

interface PostData {
  postNumber: number;
  act: number;
  actName: string;
  content: string;
  imageUrls: string[];
  latestCaption: string;
}

function getImageUrl(henNumber: number): string {
  return `https://lianabanyan.com/fabled/hen${henNumber}.png`;
}

const STORY_LINK = 'lianabanyan.com/get-a-job';

function generatePosts(): PostData[] {
  const posts: PostData[] = [];
  
  // Act 1: Village Story (posts 1-13)
  for (let i = 0; i <= ACT_1_END; i++) {
    const imagesInPost = SCENE_ORDER.slice(0, i + 1);
    const latestScene = SCENE_ORDER[i];
    
    let actLabel = i === ACT_1_END ? 'ACT 1 FINALE: The Village' : 'ACT 1: The Village';
    if (i < 4) actLabel = ''; // First few are just the classic story
    
    const hashtags = i === ACT_1_END 
      ? '#LianaBanyan #LittleRedHen #Together #OneTeam'
      : '#LianaBanyan #LittleRedHen #Cooperation';
    
    posts.push({
      postNumber: i + 1,
      act: 1,
      actName: 'The Village',
      content: `${actLabel ? actLabel + '\n' : ''}${latestScene.caption}\n\n🌾 Part ${i + 1} of 25\n\n📖 ${STORY_LINK}\n\n${hashtags}`,
      imageUrls: imagesInPost.map(s => getImageUrl(s.img)),
      latestCaption: latestScene.caption,
    });
  }
  
  // Act 2: The Dream (posts 14-18)
  for (let i = ACT_1_END + 1; i <= ACT_2_END; i++) {
    const actStartIndex = ACT_1_END + 1;
    const imagesInPost = SCENE_ORDER.slice(actStartIndex, i + 1);
    const latestScene = SCENE_ORDER[i];
    
    const actLabel = i === ACT_2_END ? 'ACT 2 FINALE: The Dream' : 'ACT 2: The Dream';
    const hashtags = i === ACT_2_END 
      ? '#LianaBanyan #LittleRedHen #Dreams #TakeAction'
      : '#LianaBanyan #LittleRedHen #RattleTheStars';
    
    posts.push({
      postNumber: i + 1,
      act: 2,
      actName: 'The Dream',
      content: `${actLabel}\n${latestScene.caption}\n\n⭐ Part ${i + 1} of 25\n\n📖 ${STORY_LINK}\n\n${hashtags}`,
      imageUrls: imagesInPost.map(s => getImageUrl(s.img)),
      latestCaption: latestScene.caption,
    });
  }
  
  // Act 3: The Stand (posts 19-25)
  for (let i = ACT_2_END + 1; i < SCENE_ORDER.length; i++) {
    const actStartIndex = ACT_2_END + 1;
    const imagesInPost = SCENE_ORDER.slice(actStartIndex, i + 1);
    const latestScene = SCENE_ORDER[i];
    
    const isFinale = i === SCENE_ORDER.length - 1;
    const actLabel = isFinale ? 'ACT 3 FINALE: Grace' : 'ACT 3: The Stand';
    const hashtags = isFinale 
      ? '#LianaBanyan #LittleRedHen #HelpEachOther #Grace'
      : '#LianaBanyan #LittleRedHen #WeAreTheAnts';
    
    posts.push({
      postNumber: i + 1,
      act: 3,
      actName: 'The Stand',
      content: `${actLabel}\n${latestScene.caption}\n\n🦗 Part ${i + 1} of 25\n\n📖 ${STORY_LINK}\n\n${hashtags}`,
      imageUrls: imagesInPost.map(s => getImageUrl(s.img)),
      latestCaption: latestScene.caption,
    });
  }
  
  return posts;
}

// Platform-specific image limits
const PLATFORM_IMAGE_LIMITS: Record<string, number> = {
  twitter: 4,
  linkedin: 9,
  facebook: 10,
  instagram: 10,
  threads: 10,
  bluesky: 4,
  tiktok: 1, // Video only, but we'll include first image
};

function getImagesForPlatform(imageUrls: string[], platform: string): string[] {
  const limit = PLATFORM_IMAGE_LIMITS[platform] || 4;
  // Take the LAST N images (most recent in the story)
  if (imageUrls.length <= limit) return imageUrls;
  return imageUrls.slice(-limit);
}

export interface ScheduleOptions {
  platforms: string[];
  startDate: Date;
  intervalHours: number;
  userId?: string;
}

export async function scheduleLittleRedHenPosts(options: ScheduleOptions): Promise<{
  success: boolean;
  postsCreated: number;
  error?: string;
}> {
  const { platforms, startDate, intervalHours, userId } = options;
  
  // Get current user if not provided
  let targetUserId = userId;
  if (!targetUserId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, postsCreated: 0, error: 'No user logged in' };
    }
    targetUserId = user.id;
  }
  
  const posts = generatePosts();
  let postsCreated = 0;
  
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const scheduledFor = new Date(startDate.getTime() + (i * intervalHours * 60 * 60 * 1000));
    
    for (const platform of platforms) {
      const platformImages = getImagesForPlatform(post.imageUrls, platform);
      
      const { error } = await supabase
        .from('member_scheduled_posts')
        .insert({
          user_id: targetUserId,
          content: post.content,
          media_urls: platformImages,
          scheduled_for: scheduledFor.toISOString(),
          status: 'scheduled',
          platform: platform,
        });
      
      if (error) {
        console.error(`Error scheduling post ${post.postNumber} for ${platform}:`, error);
      } else {
        postsCreated++;
      }
    }
  }
  
  return {
    success: true,
    postsCreated,
  };
}

// Preview function to see what would be posted
export function previewPosts(): PostData[] {
  return generatePosts();
}

// Export for use in admin panel
export { generatePosts, getImagesForPlatform, PLATFORM_IMAGE_LIMITS };

// MoneyPenny Social Media Command Center — Service Layer
// "MoneyPenny reads it. AI drafts it. You approve it. Nothing goes out without your say."

import { supabase } from "@/integrations/supabase/client";

export type SocialChannel = 'twitter' | 'instagram' | 'facebook' | 'linkedin' | 'tiktok' | 'discord' | 'reddit' | 'youtube';
export type InteractionType = 'mention' | 'comment' | 'dm' | 'reply' | 'tag' | 'review' | 'share';
export type Priority = 'urgent' | 'high' | 'medium' | 'low' | 'ignore';
export type ResponseStatus = 'new' | 'ai_drafted' | 'pending_review' | 'approved' | 'published' | 'rejected' | 'no_response_needed';
export type Sentiment = 'positive' | 'neutral' | 'negative' | 'hostile';
export type Category = 'question' | 'praise' | 'complaint' | 'feature_request' | 'partnership_inquiry' | 'press' | 'spam' | 'troll' | 'general';

export interface SocialInteraction {
  id: string;
  channel: SocialChannel;
  interactionType: InteractionType;
  authorName: string;
  authorHandle: string;
  authorFollowers?: number;
  content: string;
  sentiment: Sentiment;
  priority: Priority;
  category: Category;
  draftResponse: string;
  responseStatus: ResponseStatus;
  aiNotes: string;
  relatedQAId?: string;
  receivedAt: string;
  reviewedAt?: string;
  publishedAt?: string;
}

export interface SocialMediaStats {
  totalInbox: number;
  pendingReview: number;
  draftedToday: number;
  publishedToday: number;
  byChannel: Record<SocialChannel, number>;
  byPriority: Record<Priority, number>;
  bySentiment: { positive: number; neutral: number; negative: number; hostile: number };
  avgReviewTimeMinutes: number;
}

export interface DailyDigest {
  date: string;
  totalInteractions: number;
  requiresResponse: number;
  highlights: string[];
  channelBreakdown: Record<SocialChannel, number>;
}

export interface SocialInboxFilters {
  channel?: SocialChannel | 'all';
  priority?: Priority | 'all';
  status?: ResponseStatus | 'all';
  sortBy?: 'newest' | 'priority' | 'sentiment' | 'channel';
  searchQuery?: string;
}

// ─── SAMPLE DATA ───────────────────────────────────────────────────

const SAMPLE_INTERACTIONS: SocialInteraction[] = [
  {
    id: 'sm-001',
    channel: 'twitter',
    interactionType: 'mention',
    authorName: 'Sarah Chen',
    authorHandle: '@sarahbuilds',
    authorFollowers: 12400,
    content: 'Just discovered @LianaBanyan — a cooperative platform that actually gives makers ownership? This is what we\'ve been asking for. Thread incoming.',
    sentiment: 'positive',
    priority: 'high',
    category: 'praise',
    draftResponse: 'Welcome to the movement, Sarah! We believe makers should own what they build. Would love to hear your thoughts as we approach launch. The thread is going to be great.',
    responseStatus: 'pending_review',
    aiNotes: 'High-follower maker advocate. Positive organic discovery. Her thread could drive significant awareness. Recommend warm, authentic response that encourages engagement without over-selling.',
    receivedAt: '2026-03-18T08:15:00Z',
  },
  {
    id: 'sm-002',
    channel: 'twitter',
    interactionType: 'reply',
    authorName: 'CryptoMaxi99',
    authorHandle: '@cryptomaxi99',
    authorFollowers: 340,
    content: '@LianaBanyan So this is basically another crypto project pretending to be different? Joules sound like tokens to me.',
    sentiment: 'negative',
    priority: 'medium',
    category: 'question',
    draftResponse: 'Fair question! Joules are not crypto tokens — they\'re a closed-loop surplus storage mechanism within the cooperative. No blockchain, no speculation, no trading on exchanges. Think of them more like a forever stamp at the post office. Happy to explain more.',
    responseStatus: 'pending_review',
    aiNotes: 'Common misconception worth addressing publicly since others will have the same question. The "forever stamp" analogy is strong for this audience. Not hostile — genuinely confused.',
    receivedAt: '2026-03-18T09:22:00Z',
  },
  {
    id: 'sm-003',
    channel: 'instagram',
    interactionType: 'comment',
    authorName: 'MakerMike',
    authorHandle: '@makermike3d',
    authorFollowers: 8700,
    content: 'Those hexagonal pieces are incredible! Are these 3D printed or injection molded? Would love to know more about the manufacturing process.',
    sentiment: 'positive',
    priority: 'high',
    category: 'question',
    draftResponse: 'Thanks Mike! The Tereno Certified pieces use lithographic manufacturing with compliant mechanisms — no magnets or electronics needed. We\'re building a modular manufacturing system where makers like you can pioneer their own process paths. DM us if you want to learn more about the HexIsle Compatible certification tiers!',
    responseStatus: 'pending_review',
    aiNotes: 'Active 3D printing creator with solid following. Potential Creator Draft Pick candidate. His question about manufacturing opens the door to discuss the certification tier system. High-value engagement opportunity.',
    relatedQAId: 'qa-hexisle-manufacturing',
    receivedAt: '2026-03-18T07:45:00Z',
  },
  {
    id: 'sm-004',
    channel: 'linkedin',
    interactionType: 'dm',
    authorName: 'Jessica Thornton',
    authorHandle: 'jessica-thornton-cfo',
    authorFollowers: 3200,
    content: 'Hi Jonathan, I saw your post about the cooperative model. I\'m a CFO with experience in cooperative finance structures. Would love to chat about how your three-currency system works from a regulatory perspective.',
    sentiment: 'positive',
    priority: 'urgent',
    category: 'partnership_inquiry',
    draftResponse: 'Jessica, thank you for reaching out. Your cooperative finance expertise is exactly the kind of insight we value. I\'d welcome a conversation about our credit/mark/joule system and its regulatory framework. Would you be open to a brief call this week?',
    responseStatus: 'pending_review',
    aiNotes: 'URGENT: Potential strategic contact. CFO with cooperative finance background is rare and valuable. Her regulatory perspective could strengthen our SEC compliance posture. Recommend personal, warm response with call invitation.',
    receivedAt: '2026-03-18T06:30:00Z',
  },
  {
    id: 'sm-005',
    channel: 'reddit',
    interactionType: 'comment',
    authorName: 'cooperativefan42',
    authorHandle: 'u/cooperativefan42',
    authorFollowers: undefined,
    content: 'r/cooperatives: Has anyone looked into Liana Banyan? Their academic papers on non-speculative cooperative economics are actually rigorous. The C+20 reciprocity model is interesting.',
    sentiment: 'positive',
    priority: 'medium',
    category: 'general',
    draftResponse: 'Thanks for the shout-out! We\'ve put a lot of work into making sure the economic model is academically sound. The C+20 reciprocity law is one of our cornerstones — dollar-for-dollar margin sacrifice converted to purchasing power. Happy to answer questions from the community.',
    responseStatus: 'ai_drafted',
    aiNotes: 'Organic Reddit discussion in a relevant subreddit. Moderate engagement recommended — Reddit communities value authenticity over marketing. Keep it informational, not promotional.',
    receivedAt: '2026-03-18T10:05:00Z',
  },
  {
    id: 'sm-006',
    channel: 'youtube',
    interactionType: 'comment',
    authorName: 'TechReviewDave',
    authorHandle: '@techreviewdave',
    authorFollowers: 45000,
    content: 'I\'d love to do a deep dive review of this platform. Can someone from the team reach out? This cooperative model deserves more coverage.',
    sentiment: 'positive',
    priority: 'urgent',
    category: 'press',
    draftResponse: 'Dave, we\'d be honored! Sending you a DM with details. We can provide a full walkthrough of the platform, the economic model, and the HexIsle physical product line. Looking forward to connecting.',
    responseStatus: 'pending_review',
    aiNotes: 'URGENT: High-follower tech reviewer requesting coverage. This is earned media gold. 45K followers in tech review space. Recommend immediate, enthusiastic response. Coordinate DM follow-up with press materials.',
    receivedAt: '2026-03-18T11:00:00Z',
  },
  {
    id: 'sm-007',
    channel: 'discord',
    interactionType: 'dm',
    authorName: 'Alex Rivera',
    authorHandle: 'alexr#7721',
    authorFollowers: undefined,
    content: 'Hey, I\'m a full-stack developer and I love what you\'re building. Is there a way to contribute? I have experience with React and Supabase.',
    sentiment: 'positive',
    priority: 'high',
    category: 'partnership_inquiry',
    draftResponse: 'Alex, welcome! We\'re always looking for talented developers who share our vision. Our tech stack is React/Vite with Supabase — sounds like a perfect match. Check out our Bounty system where you can earn Marks for contributions. I\'ll point you to our Developer Portal.',
    responseStatus: 'pending_review',
    aiNotes: 'Potential developer recruit with relevant stack experience (React + Supabase = our exact stack). Route to Developer Portal and Bounty system. Could be a strong early contributor.',
    receivedAt: '2026-03-18T08:50:00Z',
  },
  {
    id: 'sm-008',
    channel: 'facebook',
    interactionType: 'comment',
    authorName: 'Linda McCarthy',
    authorHandle: 'linda.mccarthy.crafts',
    authorFollowers: 1200,
    content: 'My daughter told me about this. I make handmade pottery and have been looking for an alternative to Etsy. Is this real? How do I sign up?',
    sentiment: 'positive',
    priority: 'medium',
    category: 'question',
    draftResponse: 'Linda, welcome! Yes, we\'re very real and we\'re building specifically for makers like you. We\'re in pre-launch right now, but you can join our early access list. Unlike Etsy, you\'ll actually own a share of the platform through our cooperative model. Your pottery sounds wonderful!',
    responseStatus: 'ai_drafted',
    aiNotes: 'Warm lead — maker frustrated with existing platforms. The Etsy comparison is a common entry point. Respond with warmth, direct to early access. Her referral path (daughter) suggests organic word-of-mouth is working.',
    receivedAt: '2026-03-18T09:45:00Z',
  },
  {
    id: 'sm-009',
    channel: 'twitter',
    interactionType: 'mention',
    authorName: 'PlatformWatch',
    authorHandle: '@platformwatch',
    authorFollowers: 28000,
    content: '@LianaBanyan claims to be a cooperative but has zero transparent governance documentation. Show us the bylaws or it\'s just another startup with good marketing.',
    sentiment: 'negative',
    priority: 'high',
    category: 'complaint',
    draftResponse: 'Valid ask. Our governance structure includes the Star Chamber, Senate/Pnyx voting system, and Coverage Minutes model. We\'re publishing our full cooperative bylaws before launch. Transparency isn\'t optional for us — it\'s foundational. Would you be interested in reviewing them when they\'re ready?',
    responseStatus: 'pending_review',
    aiNotes: 'HIGH: Influential platform critic with large following. The criticism is actually fair and gives us an opportunity to demonstrate transparency. Respond with specifics, not defensiveness. Invite them into the process.',
    receivedAt: '2026-03-18T10:30:00Z',
  },
  {
    id: 'sm-010',
    channel: 'tiktok',
    interactionType: 'comment',
    authorName: 'CraftQueenBee',
    authorHandle: '@craftqueenbee',
    authorFollowers: 156000,
    content: 'Wait this is actually genius?? A platform where makers set their own prices with a cost+20% floor?? No race to the bottom?? Someone explain this to me like I\'m five.',
    sentiment: 'positive',
    priority: 'urgent',
    category: 'question',
    draftResponse: 'Here\'s the simple version: You make something. You decide what it costs. The platform guarantees you at least cost plus 20% — nobody can undercut you into losing money. And instead of the platform taking 30%, the cooperative model means you own a piece of everything. That\'s it!',
    responseStatus: 'pending_review',
    aiNotes: 'URGENT: TikTok creator with 156K followers asking for a simple explanation. This could go viral. The ELI5 format is perfect for TikTok. Draft keeps it casual and punchy to match platform tone. High conversion potential.',
    receivedAt: '2026-03-18T11:15:00Z',
  },
  {
    id: 'sm-011',
    channel: 'twitter',
    interactionType: 'reply',
    authorName: 'SkepticalSteve',
    authorHandle: '@skepticalsteve',
    authorFollowers: 890,
    content: '@LianaBanyan @sarahbuilds Lmao cooperatives always fail. Give it 6 months.',
    sentiment: 'hostile',
    priority: 'low',
    category: 'troll',
    draftResponse: '',
    responseStatus: 'no_response_needed',
    aiNotes: 'Low-follower troll with no substantive criticism. No engagement value. Classified as no-response. Engaging would only amplify negativity.',
    receivedAt: '2026-03-18T08:45:00Z',
  },
  {
    id: 'sm-012',
    channel: 'instagram',
    interactionType: 'dm',
    authorName: 'Fusion Fox Design',
    authorHandle: '@fusefoxdesign',
    authorFollowers: 22000,
    content: 'Hey! Love the hexagonal game pieces. I design tactical board game accessories with magnetic systems. Think there could be a collaboration here?',
    sentiment: 'positive',
    priority: 'urgent',
    category: 'partnership_inquiry',
    draftResponse: 'We\'ve been admiring your work! Your tactical accessories are exactly the kind of quality we want in the HexIsle ecosystem. We have a tiered compatibility certification system — your magnetic designs would fit as HexIsle Compatible (Tier 4). Would love to discuss a potential Guild Expert Advisor role. Can we schedule a call?',
    responseStatus: 'pending_review',
    aiNotes: 'URGENT: This is @fusefoxdesign (Tactocrat) — already identified as a top Creator Draft Pick candidate and potential Guild Expert Advisor for HexIsle. The Founder specifically wants this contact. Magnetic designs = Tier 4 HexIsle Compatible. Prioritize personal, enthusiastic response.',
    receivedAt: '2026-03-18T07:00:00Z',
  },
  {
    id: 'sm-013',
    channel: 'linkedin',
    interactionType: 'comment',
    authorName: 'Prof. Maria Santos',
    authorHandle: 'maria-santos-econ',
    authorFollowers: 5600,
    content: 'Fascinating paper on non-speculative cooperative economics. The three-currency model addresses several gaps in existing cooperative finance literature. Would be interested in peer reviewing future publications.',
    sentiment: 'positive',
    priority: 'high',
    category: 'partnership_inquiry',
    draftResponse: 'Professor Santos, what an honor! We take our academic rigor seriously and would welcome peer review from a cooperative economics specialist. Our paper series covers everything from the C+20 reciprocity model to IP load balancing. I\'ll send you the full paper list — your expertise would strengthen our work immensely.',
    responseStatus: 'pending_review',
    aiNotes: 'HIGH: Academic economist offering peer review. This is credibility gold. Aligns with our Stanford Tech Law Review ambitions. Recommend warm, professional response. Share paper arsenal list.',
    receivedAt: '2026-03-18T09:00:00Z',
  },
  {
    id: 'sm-014',
    channel: 'reddit',
    interactionType: 'comment',
    authorName: 'throwaway_critic',
    authorHandle: 'u/throwaway_critic_2026',
    authorFollowers: undefined,
    content: 'r/startups: Liana Banyan is a scam. No product, just papers and promises. Classic vaporware.',
    sentiment: 'hostile',
    priority: 'medium',
    category: 'troll',
    draftResponse: 'We understand the skepticism — the startup space has earned it. We have a live platform in beta, 8 provisional patent filings (1,754 innovations), and a deployed React/Supabase stack. We\'re not asking anyone to invest — we\'re a cooperative, not a securities offering. Happy to show receipts.',
    responseStatus: 'ai_drafted',
    aiNotes: 'Hostile but on a high-traffic subreddit. Unlike the Twitter troll, this accusation could gain traction and should be addressed factually. Response is calm, specific, and avoids SEC language. "Show receipts" matches Reddit tone.',
    receivedAt: '2026-03-18T10:45:00Z',
  },
  {
    id: 'sm-015',
    channel: 'facebook',
    interactionType: 'share',
    authorName: 'Veterans Business Network',
    authorHandle: 'VetsBizNetwork',
    authorFollowers: 34000,
    content: 'Shared your post about the cooperative model with the caption: "Veteran-founded cooperative building something different. Worth watching."',
    sentiment: 'positive',
    priority: 'high',
    category: 'praise',
    draftResponse: 'Thank you, Veterans Business Network! Building something that serves the community is what it\'s all about. We\'re proud of our founder\'s service background and the values it brings to this platform. Appreciate the signal boost!',
    responseStatus: 'pending_review',
    aiNotes: 'HIGH: Veterans organization sharing organically. Large audience (34K). Authentic veteran connection. Response should acknowledge service values without oversharing personal military details (Founder privacy boundary).',
    receivedAt: '2026-03-18T08:30:00Z',
  },
  {
    id: 'sm-016',
    channel: 'discord',
    interactionType: 'comment',
    authorName: 'BuilderBot',
    authorHandle: 'builderbot#0001',
    authorFollowers: undefined,
    content: 'FREE NFT DROP! Click here to claim your exclusive Liana Banyan founder token! Limited supply! discord.gg/scamlink',
    sentiment: 'hostile',
    priority: 'urgent',
    category: 'spam',
    draftResponse: '',
    responseStatus: 'no_response_needed',
    aiNotes: 'SPAM/SCAM: Fake NFT drop impersonating the brand. Report and ban immediately. No response — do not engage. Flag for Discord moderation action.',
    receivedAt: '2026-03-18T11:30:00Z',
  },
  {
    id: 'sm-017',
    channel: 'youtube',
    interactionType: 'comment',
    authorName: 'CoopLearner',
    authorHandle: '@cooplearner',
    authorFollowers: 2100,
    content: 'I\'m writing my thesis on platform cooperativism and this is the most detailed real-world implementation I\'ve found. Could you share more about the Coverage Minutes / Muffled Rule system?',
    sentiment: 'positive',
    priority: 'medium',
    category: 'question',
    draftResponse: 'What a great topic for a thesis! The Coverage Minutes system gates speaking by listening — you earn minutes by engaging with others\' content, then spend them to share your own. It\'s our answer to attention monopolization. We have academic papers on this if you\'d like references for your research.',
    responseStatus: 'ai_drafted',
    aiNotes: 'Academic researcher working on platform cooperativism. Good opportunity to share our paper series. The Muffled Rule paper exists in the arsenal. Low-risk, high-value engagement for academic credibility.',
    relatedQAId: 'qa-muffled-rule',
    receivedAt: '2026-03-18T09:30:00Z',
  },
  {
    id: 'sm-018',
    channel: 'tiktok',
    interactionType: 'comment',
    authorName: 'SmallBizSally',
    authorHandle: '@smallbizsally',
    authorFollowers: 43000,
    content: 'Ok but how do you actually make money if you\'re a cooperative? Like who pays for the servers and stuff?',
    sentiment: 'neutral',
    priority: 'medium',
    category: 'question',
    draftResponse: 'Great question! Members buy Credits ($1 = 1 Credit) to use on the platform. The cooperative takes a small operational margin (way less than Amazon/Etsy). Plus the Cost+20% floor means every transaction is self-sustaining. No venture capital needed, no ads, no selling your data. The members ARE the business.',
    responseStatus: 'pending_review',
    aiNotes: 'Common and important question from a mid-size TikTok creator. The answer needs to be TikTok-casual but economically accurate. Avoid SEC-triggering language. Focus on the Credits system and operational margin.',
    relatedQAId: 'qa-business-model',
    receivedAt: '2026-03-18T11:45:00Z',
  },
  {
    id: 'sm-019',
    channel: 'twitter',
    interactionType: 'dm',
    authorName: 'Jake from TechCrunch',
    authorHandle: '@jakefrommedia',
    authorFollowers: 67000,
    content: 'Hi, I\'m a reporter at TechCrunch covering cooperative tech and platform alternatives. Would your founder be available for an interview about the Liana Banyan model?',
    sentiment: 'positive',
    priority: 'urgent',
    category: 'press',
    draftResponse: 'Jake, thank you for reaching out! We\'d be happy to arrange an interview. Our founder can speak to the cooperative model, the three-currency economic system, and our approach to maker-owned commerce. What\'s your timeline? We can work around your schedule.',
    responseStatus: 'pending_review',
    aiNotes: 'URGENT: TechCrunch reporter requesting founder interview. This is tier-1 press coverage. 67K followers. Respond promptly and professionally. Coordinate with Founder schedule. Do NOT share any Founder personal details beyond what\'s on Cephas "Proof of Real" page.',
    receivedAt: '2026-03-18T06:00:00Z',
  },
  {
    id: 'sm-020',
    channel: 'instagram',
    interactionType: 'tag',
    authorName: 'Greg Dean Mann',
    authorHandle: '@greg.dean.mann',
    authorFollowers: 15000,
    content: 'Tagged @LianaBanyan in a post showcasing handmade industrial lamps with caption: "When platforms actually respect makers. Keeping an eye on this one."',
    sentiment: 'positive',
    priority: 'high',
    category: 'praise',
    draftResponse: 'Greg, your lamp work is extraordinary! We believe makers like you deserve a platform that respects the craft. Can\'t wait to see your designs in the ecosystem. Welcome aboard!',
    responseStatus: 'pending_review',
    aiNotes: 'HIGH: @greg.dean.mann is an identified Creator Draft Pick from the Instagram Factor-y collection (lamp designer). Organic endorsement from a target recruit. Respond with genuine appreciation for his specific craft. This is a warm lead for the Creator Draft Pick pipeline.',
    receivedAt: '2026-03-18T10:15:00Z',
  },
];

const SAMPLE_DAILY_DIGEST: DailyDigest = {
  date: '2026-03-18',
  totalInteractions: 20,
  requiresResponse: 15,
  highlights: [
    'TechCrunch reporter requesting founder interview — highest priority press opportunity',
    '@fusefoxdesign (Tactocrat) reached out about HexIsle collaboration — Creator Draft Pick target',
    'TikTok creator @craftqueenbee (156K followers) asking for ELI5 on pricing model — viral potential',
    'YouTube reviewer @techreviewdave (45K) wants to do a platform deep dive',
    'Discord spam bot impersonating brand with fake NFT drop — needs moderation action',
  ],
  channelBreakdown: {
    twitter: 5,
    instagram: 3,
    facebook: 2,
    linkedin: 2,
    tiktok: 2,
    discord: 2,
    reddit: 2,
    youtube: 2,
  },
};

// ─── HELPER FUNCTIONS ──────────────────────────────────────────────

function sortInteractions(items: SocialInteraction[], sortBy: string): SocialInteraction[] {
  const priorityOrder: Record<Priority, number> = { urgent: 0, high: 1, medium: 2, low: 3, ignore: 4 };
  const sentimentOrder: Record<Sentiment, number> = { hostile: 0, negative: 1, neutral: 2, positive: 3 };

  switch (sortBy) {
    case 'priority':
      return [...items].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    case 'sentiment':
      return [...items].sort((a, b) => sentimentOrder[a.sentiment] - sentimentOrder[b.sentiment]);
    case 'channel':
      return [...items].sort((a, b) => a.channel.localeCompare(b.channel));
    case 'newest':
    default:
      return [...items].sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
  }
}

// ─── DB → Frontend mapper ─────────────────────────────────────────

function mapDbInteraction(row: Record<string, any>): SocialInteraction {
  return {
    id: row.id,
    channel: row.channel ?? 'twitter',
    interactionType: row.interaction_type ?? 'mention',
    authorName: row.author_name ?? '',
    authorHandle: row.author_handle ?? '',
    authorFollowers: row.author_followers || undefined,
    content: row.content ?? '',
    sentiment: row.sentiment ?? 'neutral',
    priority: row.priority ?? 'medium',
    category: row.category ?? 'general',
    draftResponse: row.draft_response ?? '',
    responseStatus: row.response_status ?? 'new',
    aiNotes: row.ai_notes ?? '',
    relatedQAId: row.related_qa_id ?? undefined,
    receivedAt: row.received_at,
    reviewedAt: row.reviewed_at ?? undefined,
    publishedAt: row.published_at ?? undefined,
  };
}

// ─── SERVICE FUNCTIONS ─────────────────────────────────────────────

let interactions = [...SAMPLE_INTERACTIONS];

export async function fetchSocialInbox(filters: SocialInboxFilters = {}): Promise<SocialInteraction[]> {
  try {
    let query = supabase.from('social_interactions' as any).select('*').order('received_at', { ascending: false });
    if (filters.channel && filters.channel !== 'all') query = query.eq('channel', filters.channel);
    if (filters.priority && filters.priority !== 'all') query = query.eq('priority', filters.priority);
    if (filters.status && filters.status !== 'all') query = query.eq('response_status', filters.status);
    const { data, error } = await query;
    if (error) throw error;
    if (data && data.length > 0) {
      let result = (data as any[]).map(mapDbInteraction);
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        result = result.filter(i =>
          i.content.toLowerCase().includes(q) ||
          i.authorName.toLowerCase().includes(q) ||
          i.authorHandle.toLowerCase().includes(q)
        );
      }
      interactions = result;
      return sortInteractions(result, filters.sortBy || 'newest');
    }
  } catch (err) {
    console.warn('[SocialMedia] DB fetch failed, using sample data', err);
  }

  let result = [...interactions];
  if (filters.channel && filters.channel !== 'all') result = result.filter(i => i.channel === filters.channel);
  if (filters.priority && filters.priority !== 'all') result = result.filter(i => i.priority === filters.priority);
  if (filters.status && filters.status !== 'all') result = result.filter(i => i.responseStatus === filters.status);
  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    result = result.filter(i =>
      i.content.toLowerCase().includes(q) ||
      i.authorName.toLowerCase().includes(q) ||
      i.authorHandle.toLowerCase().includes(q)
    );
  }
  return sortInteractions(result, filters.sortBy || 'newest');
}

export async function fetchSocialStats(): Promise<SocialMediaStats> {
  try {
    const { data, error } = await supabase.from('social_interactions' as any).select('*');
    if (error) throw error;
    if (data && data.length > 0) {
      const rows = data as any[];
      const byChannel: Record<SocialChannel, number> = { twitter: 0, instagram: 0, facebook: 0, linkedin: 0, tiktok: 0, discord: 0, reddit: 0, youtube: 0 };
      const byPriority: Record<Priority, number> = { urgent: 0, high: 0, medium: 0, low: 0, ignore: 0 };
      const bySentiment = { positive: 0, neutral: 0, negative: 0, hostile: 0 };
      rows.forEach((r: any) => {
        if (r.channel in byChannel) byChannel[r.channel as SocialChannel]++;
        if (r.priority in byPriority) byPriority[r.priority as Priority]++;
        if (r.sentiment in bySentiment) bySentiment[r.sentiment as keyof typeof bySentiment]++;
      });
      return {
        totalInbox: rows.length,
        pendingReview: rows.filter((r: any) => ['pending_review', 'ai_drafted', 'new'].includes(r.response_status)).length,
        draftedToday: rows.filter((r: any) => r.response_status === 'ai_drafted').length,
        publishedToday: rows.filter((r: any) => r.response_status === 'published').length,
        byChannel, byPriority, bySentiment,
        avgReviewTimeMinutes: 4.2,
      };
    }
  } catch (err) {
    console.warn('[SocialMedia] Stats fetch failed, using sample data', err);
  }

  const byChannel: Record<SocialChannel, number> = { twitter: 0, instagram: 0, facebook: 0, linkedin: 0, tiktok: 0, discord: 0, reddit: 0, youtube: 0 };
  const byPriority: Record<Priority, number> = { urgent: 0, high: 0, medium: 0, low: 0, ignore: 0 };
  const bySentiment = { positive: 0, neutral: 0, negative: 0, hostile: 0 };
  interactions.forEach(i => {
    byChannel[i.channel]++;
    byPriority[i.priority]++;
    bySentiment[i.sentiment]++;
  });
  return {
    totalInbox: interactions.length,
    pendingReview: interactions.filter(i => ['pending_review', 'ai_drafted', 'new'].includes(i.responseStatus)).length,
    draftedToday: interactions.filter(i => i.responseStatus === 'ai_drafted').length,
    publishedToday: interactions.filter(i => i.responseStatus === 'published').length,
    byChannel, byPriority, bySentiment,
    avgReviewTimeMinutes: 4.2,
  };
}

export async function approveDraft(interactionId: string): Promise<SocialInteraction | null> {
  try {
    const { data, error } = await supabase.from('social_interactions' as any)
      .update({ response_status: 'approved', reviewed_at: new Date().toISOString() })
      .eq('id', interactionId).select().single();
    if (error) throw error;
    if (data) return mapDbInteraction(data as any);
  } catch (err) { console.warn('[SocialMedia] Approve failed, updating locally', err); }
  const idx = interactions.findIndex(i => i.id === interactionId);
  if (idx === -1) return null;
  interactions[idx] = { ...interactions[idx], responseStatus: 'approved', reviewedAt: new Date().toISOString() };
  return interactions[idx];
}

export async function editDraft(interactionId: string, newDraft: string): Promise<SocialInteraction | null> {
  try {
    const { data, error } = await supabase.from('social_interactions' as any)
      .update({ draft_response: newDraft, response_status: 'pending_review' })
      .eq('id', interactionId).select().single();
    if (error) throw error;
    if (data) return mapDbInteraction(data as any);
  } catch (err) { console.warn('[SocialMedia] Edit failed, updating locally', err); }
  const idx = interactions.findIndex(i => i.id === interactionId);
  if (idx === -1) return null;
  interactions[idx] = { ...interactions[idx], draftResponse: newDraft, responseStatus: 'pending_review' };
  return interactions[idx];
}

export async function rejectDraft(interactionId: string): Promise<SocialInteraction | null> {
  try {
    const { data, error } = await supabase.from('social_interactions' as any)
      .update({ response_status: 'rejected', reviewed_at: new Date().toISOString() })
      .eq('id', interactionId).select().single();
    if (error) throw error;
    if (data) return mapDbInteraction(data as any);
  } catch (err) { console.warn('[SocialMedia] Reject failed, updating locally', err); }
  const idx = interactions.findIndex(i => i.id === interactionId);
  if (idx === -1) return null;
  interactions[idx] = { ...interactions[idx], responseStatus: 'rejected', reviewedAt: new Date().toISOString() };
  return interactions[idx];
}

export async function markAsNoResponse(interactionId: string): Promise<SocialInteraction | null> {
  try {
    const { data, error } = await supabase.from('social_interactions' as any)
      .update({ response_status: 'no_response_needed', reviewed_at: new Date().toISOString() })
      .eq('id', interactionId).select().single();
    if (error) throw error;
    if (data) return mapDbInteraction(data as any);
  } catch (err) { console.warn('[SocialMedia] Mark no-response failed, updating locally', err); }
  const idx = interactions.findIndex(i => i.id === interactionId);
  if (idx === -1) return null;
  interactions[idx] = { ...interactions[idx], responseStatus: 'no_response_needed', reviewedAt: new Date().toISOString() };
  return interactions[idx];
}

export async function fetchDailyDigest(_date?: string): Promise<DailyDigest> {
  try {
    const targetDate = _date || new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase.from('social_daily_digests' as any)
      .select('*').eq('digest_date', targetDate).single();
    if (error) throw error;
    if (data) {
      const row = data as any;
      return {
        date: row.digest_date,
        totalInteractions: row.total_interactions,
        requiresResponse: row.requires_response,
        highlights: row.highlights ?? [],
        channelBreakdown: row.channel_breakdown ?? {},
      };
    }
  } catch (err) {
    console.warn('[SocialMedia] Digest fetch failed, using sample', err);
  }
  return SAMPLE_DAILY_DIGEST;
}

export async function bulkApprove(interactionIds: string[]): Promise<number> {
  try {
    const { data, error } = await supabase.from('social_interactions' as any)
      .update({ response_status: 'approved', reviewed_at: new Date().toISOString() })
      .in('id', interactionIds).select();
    if (error) throw error;
    if (data) return (data as any[]).length;
  } catch (err) { console.warn('[SocialMedia] Bulk approve failed, updating locally', err); }
  let count = 0;
  interactionIds.forEach(id => {
    const idx = interactions.findIndex(i => i.id === id);
    if (idx !== -1) { interactions[idx] = { ...interactions[idx], responseStatus: 'approved', reviewedAt: new Date().toISOString() }; count++; }
  });
  return count;
}

export async function bulkReject(interactionIds: string[]): Promise<number> {
  try {
    const { data, error } = await supabase.from('social_interactions' as any)
      .update({ response_status: 'rejected', reviewed_at: new Date().toISOString() })
      .in('id', interactionIds).select();
    if (error) throw error;
    if (data) return (data as any[]).length;
  } catch (err) { console.warn('[SocialMedia] Bulk reject failed, updating locally', err); }
  let count = 0;
  interactionIds.forEach(id => {
    const idx = interactions.findIndex(i => i.id === id);
    if (idx !== -1) { interactions[idx] = { ...interactions[idx], responseStatus: 'rejected', reviewedAt: new Date().toISOString() }; count++; }
  });
  return count;
}

export async function bulkMarkNoResponse(interactionIds: string[]): Promise<number> {
  try {
    const { data, error } = await supabase.from('social_interactions' as any)
      .update({ response_status: 'no_response_needed', reviewed_at: new Date().toISOString() })
      .in('id', interactionIds).select();
    if (error) throw error;
    if (data) return (data as any[]).length;
  } catch (err) { console.warn('[SocialMedia] Bulk no-response failed, updating locally', err); }
  let count = 0;
  interactionIds.forEach(id => {
    const idx = interactions.findIndex(i => i.id === id);
    if (idx !== -1) { interactions[idx] = { ...interactions[idx], responseStatus: 'no_response_needed', reviewedAt: new Date().toISOString() }; count++; }
  });
  return count;
}

// Channel display helpers
export const CHANNEL_CONFIG: Record<SocialChannel, { label: string; color: string }> = {
  twitter: { label: 'Twitter/X', color: 'text-sky-400' },
  instagram: { label: 'Instagram', color: 'text-pink-400' },
  facebook: { label: 'Facebook', color: 'text-blue-400' },
  linkedin: { label: 'LinkedIn', color: 'text-blue-300' },
  tiktok: { label: 'TikTok', color: 'text-cyan-400' },
  discord: { label: 'Discord', color: 'text-indigo-400' },
  reddit: { label: 'Reddit', color: 'text-orange-400' },
  youtube: { label: 'YouTube', color: 'text-red-400' },
};

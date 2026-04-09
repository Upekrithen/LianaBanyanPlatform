import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function detectPlatform(url: string): string {
  const host = new URL(url).hostname.toLowerCase();
  if (host.includes("reddit.com") || host.includes("redd.it")) return "reddit";
  if (host.includes("discord.com") || host.includes("discord.gg")) return "discord";
  if (host.includes("instagram.com")) return "instagram";
  if (host.includes("etsy.com")) return "etsy";
  if (host.includes("twitter.com") || host.includes("x.com")) return "twitter";
  if (host.includes("tiktok.com")) return "tiktok";
  return "website";
}

function extractOGTags(html: string): Record<string, string> {
  const tags: Record<string, string> = {};
  const ogRegex = /<meta\s+(?:property|name)=["'](og:[^"']+|twitter:[^"']+|description)["']\s+content=["']([^"']*)["']\s*\/?>/gi;
  let match;
  while ((match = ogRegex.exec(html)) !== null) {
    tags[match[1]] = match[2];
  }

  const reverseRegex = /<meta\s+content=["']([^"']*)["']\s+(?:property|name)=["'](og:[^"']+|twitter:[^"']+|description)["']\s*\/?>/gi;
  while ((match = reverseRegex.exec(html)) !== null) {
    tags[match[2]] = match[1];
  }

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) tags["page_title"] = titleMatch[1].trim();

  return tags;
}

function extractImages(html: string, baseUrl: string): string[] {
  const images: string[] = [];
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    try {
      const src = new URL(match[1], baseUrl).href;
      if (!src.includes("icon") && !src.includes("logo") && !src.includes("avatar") && !src.includes("1x1")) {
        images.push(src);
      }
    } catch { /* skip invalid URLs */ }
  }
  return images.slice(0, 6);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ error: "url is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const platform = detectPlatform(url);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LianaBanyan/1.0; +https://lianabanyan.com)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ title: "", description: "", images: [], platform, source_url: url }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const html = await response.text();
    const tags = extractOGTags(html);

    const title = tags["og:title"] || tags["twitter:title"] || tags["page_title"] || "";
    const description = tags["og:description"] || tags["twitter:description"] || tags["description"] || "";

    let images: string[] = [];
    if (tags["og:image"]) {
      try {
        images.push(new URL(tags["og:image"], url).href);
      } catch { /* skip */ }
    }
    if (tags["twitter:image"]) {
      try {
        images.push(new URL(tags["twitter:image"], url).href);
      } catch { /* skip */ }
    }
    if (images.length === 0) {
      images = extractImages(html, url);
    }

    return new Response(
      JSON.stringify({ title, description, images, platform, source_url: url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

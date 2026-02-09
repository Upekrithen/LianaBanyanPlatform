import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!perplexityApiKey) {
      throw new Error('PERPLEXITY_API_KEY not configured');
    }

    const { projectName, industry, targetMarket, fundingGoal, section } = await req.json();

    console.log('Generating business plan section:', section, 'for project:', projectName);

    // Build prompt based on section
    let prompt = '';
    const baseContext = `Project: ${projectName}, Industry: ${industry}, Target Market: ${targetMarket}, Funding Goal: $${fundingGoal}`;

    switch (section) {
      case 'executive_summary':
        prompt = `Create a compelling executive summary for a business plan. ${baseContext}. Include vision, mission, key objectives, and unique value proposition. Be specific and data-driven.`;
        break;
      case 'market_analysis':
        prompt = `Provide detailed market analysis and research for ${baseContext}. Include market size, growth trends, competitive landscape, target customer demographics, and market opportunities. Use current data and statistics.`;
        break;
      case 'financial_projections':
        prompt = `Generate realistic financial projections for ${baseContext}. Include 3-year revenue forecasts, cost structure, break-even analysis, ROI expectations, and key financial metrics. Base on industry standards.`;
        break;
      case 'marketing_strategy':
        prompt = `Develop a comprehensive marketing strategy for ${baseContext}. Include customer acquisition channels, pricing strategy, brand positioning, marketing budget allocation, and growth tactics.`;
        break;
      case 'operations_plan':
        prompt = `Create an operations plan for ${baseContext}. Include production/delivery process, technology requirements, staffing needs, supply chain, and operational milestones.`;
        break;
      case 'portal_architecture':
        prompt = `Analyze the strategic value of a four-portal architecture (.biz, .org, .com, .net) for ${baseContext}. Explain how each domain serves different stakeholders: .biz for business operations/project management, .org for nonprofit/community governance, .com for marketplace/commerce, .net for network/infrastructure. Include SEO benefits, user segmentation advantages, and technical architecture recommendations.`;
        break;
      case 'service_delivery_model':
        prompt = `Design a comprehensive service delivery model for ${baseContext} that includes: 1) AI-assisted automation for initial work, 2) Human expert review positions for quality assurance (e.g., CPAs for financials, legal experts for compliance), 3) Flexible engagement options (full-service steward vs à la carte services), 4) Payment structures using credit-based percentage of future profits or convertible note equity with 100-day conversion timeline. Detail the workflow, quality control processes, and value proposition for each stakeholder.`;
        break;
      case 'lb_services_integration':
        prompt = `Explain how ${baseContext} integrates with the Liana Banyan (LB) project module medallion program. Detail: 1) Business plan generation and review as a checkmark service, 2) Contract positions available for LB members (service providers), 3) Credit allocation and equity conversion methodology, 4) Project owner task checklist and steward management options, 5) Human-in-the-loop validation for AI-generated content. Include specific examples and workflows.`;
        break;
      case 'project_charter_governance':
        prompt = `Develop a comprehensive project charter and governance framework for ${baseContext}. Explain how each project requires its own tailored charter that defines: 1) Project-specific goals and objectives, 2) Decision-making processes and governance structure, 3) Roles, responsibilities, and accountability frameworks, 4) Project purpose and value proposition, 5) Deliverable specifications (e.g., storyboards, technical descriptions, creative briefs), 6) AI usage policy adherence per Liana Banyan Charter (AI as tool for human creation, placeholder-only for artwork except charts/graphs/icons/functional applications), 7) Timeline and milestone tracking, 8) Resource allocation and budget management, 9) Stakeholder communication protocols, 10) Success criteria and evaluation metrics. Include specific examples of charter components for different project types (creative, technical, operational).`;
        break;
      case 'system_analysis':
        prompt = `Provide a comprehensive system architecture analysis for ${baseContext} covering three integrated components: 1) Wave-Based Pricing System: Analyze consumer value (transparent pricing, premium vs value options, FCFS protection), member benefits (predictable work, funded expansion), and organizational advantages (non-dilutive funding, market efficiency, network effects). Include risks like perception and complexity. 2) HexIsle Integration: Evaluate team-based skill development across 7 islands (Harvest, Navigate, Engineer, Battle, Seek, Magic, Train), dual casual/real-stakes modes, guild/clan collaboration, and natural recruitment tools. Address complexity and verification challenges. 3) IP Equity + Common Currency: Assess credit-based economy (project credits, medallion credits, LB credits), contribution-based equity distribution, liquidity mechanisms, and tax implications. Conclude with synthesis of the virtuous cycle, critical success factors, phased implementation strategy, and bottom-line assessment of revolutionary potential vs complexity challenges. Be specific about grades (A-, A, B+) and provide actionable recommendations.`;
        break;
      default:
        throw new Error('Invalid section');
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are an expert business consultant and strategist. Provide detailed, data-driven business plan sections with specific insights, current market data, and actionable recommendations. Format responses in clear, professional sections with bullet points where appropriate.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 2000,
        return_images: false,
        return_related_questions: false,
        search_recency_filter: 'month',
        frequency_penalty: 1,
        presence_penalty: 0
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', response.status, errorText);
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('Successfully generated business plan section:', section);

    return new Response(
      JSON.stringify({ content: generatedContent, section }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-business-plan function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

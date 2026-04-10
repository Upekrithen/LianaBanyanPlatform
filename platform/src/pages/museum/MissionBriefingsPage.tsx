import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MissionBriefing } from '@/components/briefings/MissionBriefing';

interface BriefingTemplate {
  id: string;
  role_slug: string;
  title: string;
  description: string;
  page_sequence: Array<{
    page_number: number;
    title: string;
    description: string;
    icon: string;
  }>;
  catapult_entity_types: string[];
}

const roleIcons: Record<string, string> = {
  photographer: '\u{1F4F7}',
  pearl_diver: '\u{1F93F}',
  home_teacher: '\u{1F3EB}',
};

const roleColors: Record<string, string> = {
  photographer: 'border-blue-500/40 hover:border-blue-400/70',
  pearl_diver: 'border-emerald-500/40 hover:border-emerald-400/70',
  home_teacher: 'border-violet-500/40 hover:border-violet-400/70',
};

export default function MissionBriefingsPage() {
  const [templates, setTemplates] = useState<BriefingTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBriefing, setActiveBriefing] = useState<BriefingTemplate | null>(null);

  useEffect(() => {
    async function fetchTemplates() {
      const { data, error } = await supabase
        .from('briefing_templates')
        .select('*')
        .order('title', { ascending: true });

      if (error) {
        console.error('Failed to fetch briefing templates:', error);
      } else {
        setTemplates((data as BriefingTemplate[]) || []);
      }
      setLoading(false);
    }

    fetchTemplates();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-amber-400 mb-2">Mission Briefings</h1>
          <p className="text-gray-400">
            Role-specific informational tours. See what is happening in your domain and how you fit.
          </p>
          <p className="text-gray-600 text-sm mt-1">
            Not a Red Carpet. Repeatable. Informational. One per role.
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-amber-400" />
          </div>
        )}

        {!loading && templates.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl">No briefing templates available</p>
            <p className="mt-2">Check back as new role briefings are created.</p>
          </div>
        )}

        {!loading && templates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => setActiveBriefing(template)}
                className={`text-left bg-gray-900/60 border rounded-xl p-6 transition-all hover:bg-gray-900/90 ${
                  roleColors[template.role_slug] || 'border-gray-700/50 hover:border-gray-500/70'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">
                    {roleIcons[template.role_slug] || '\u{1F4CB}'}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{template.title}</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">
                      {template.role_slug.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-400 mb-4">{template.description}</p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {template.page_sequence.length} pages
                  </span>
                  <span className="text-xs text-amber-400 font-semibold">
                    Enter Briefing →
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {activeBriefing && (
          <MissionBriefing
            roleSlug={activeBriefing.role_slug}
            title={activeBriefing.title}
            pages={activeBriefing.page_sequence}
            catapultEntityTypes={activeBriefing.catapult_entity_types}
            onClose={() => setActiveBriefing(null)}
          />
        )}

        <div className="mt-12 text-center text-gray-600 text-xs">
          Innovation #2238 — Mission Briefings (Crown Jewel #211) — Liana Banyan CORPORATION
        </div>
      </div>
    </div>
  );
}

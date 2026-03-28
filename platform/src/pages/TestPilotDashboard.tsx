import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { FlaskConical, CheckCircle2, XCircle, AlertTriangle, Loader2, Plus, BarChart3 } from 'lucide-react';

interface TestReport {
  id: string;
  stl_file_id: string;
  printer_type: string;
  material: string;
  settings: { layer_height?: string; infill?: string; supports?: string };
  result: 'success' | 'partial' | 'fail';
  notes: string;
  print_time_minutes: number | null;
  material_grams: number | null;
  created_at: string;
  stl_files?: { display_name: string; filename: string };
}

interface QuorumEntry {
  material: string;
  printer_type: string;
  total: number;
  successes: number;
  rate: number;
}

const RESULT_CONFIG = {
  success: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-900/30', label: 'Success' },
  partial: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-900/30', label: 'Partial' },
  fail: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-900/30', label: 'Failed' },
};

export default function TestPilotDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [printerType, setPrinterType] = useState('');
  const [material, setMaterial] = useState('PLA');
  const [layerHeight, setLayerHeight] = useState('0.2');
  const [infill, setInfill] = useState('20');
  const [result, setResult] = useState<'success' | 'partial' | 'fail'>('success');
  const [notes, setNotes] = useState('');
  const [printTime, setPrintTime] = useState('');
  const [materialGrams, setMaterialGrams] = useState('');

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['test-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('test_reports')
        .select('*, stl_files(display_name, filename)')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as TestReport[];
    },
  });

  const { data: stlFiles = [] } = useQuery({
    queryKey: ['stl-for-testing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stl_files')
        .select('id, display_name')
        .eq('is_public', true)
        .order('display_name')
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  const [selectedFileId, setSelectedFileId] = useState('');

  const quorum: QuorumEntry[] = (() => {
    const groups: Record<string, { total: number; successes: number }> = {};
    reports.forEach(r => {
      const key = `${r.material}|${r.printer_type || 'Unknown'}`;
      if (!groups[key]) groups[key] = { total: 0, successes: 0 };
      groups[key].total++;
      if (r.result === 'success') groups[key].successes++;
    });
    return Object.entries(groups).map(([key, v]) => {
      const [mat, printer] = key.split('|');
      return { material: mat, printer_type: printer, ...v, rate: v.total > 0 ? Math.round((v.successes / v.total) * 100) : 0 };
    }).sort((a, b) => b.total - a.total);
  })();

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Please sign in');
      if (!selectedFileId) throw new Error('Select an STL file');

      const { error } = await supabase.from('test_reports').insert({
        stl_file_id: selectedFileId,
        tester_id: user.id,
        printer_type: printerType || null,
        material,
        settings: { layer_height: layerHeight, infill: `${infill}%`, supports: 'as needed' },
        result,
        notes: notes.trim() || null,
        print_time_minutes: printTime ? parseInt(printTime) : null,
        material_grams: materialGrams ? parseFloat(materialGrams) : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Report submitted!', description: 'Thank you, Test Pilot.' });
      queryClient.invalidateQueries({ queryKey: ['test-reports'] });
      setShowForm(false);
      setNotes('');
      setPrintTime('');
      setMaterialGrams('');
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FlaskConical className="w-8 h-8 text-cyan-400" />
              Test Pilot Dashboard
            </h1>
            <p className="text-gray-400 text-sm mt-1">Print, test, report. Help the community find the best settings.</p>
          </div>
          {user && (
            <Button className="bg-cyan-600 hover:bg-cyan-500" onClick={() => setShowForm(!showForm)}>
              <Plus className="w-4 h-4 mr-2" />{showForm ? 'Cancel' : 'Submit Report'}
            </Button>
          )}
        </div>

        {/* Submit Form */}
        {showForm && user && (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader><CardTitle className="text-white">New Test Report</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">STL File *</Label>
                {stlFiles.length > 0 ? (
                  <Select value={selectedFileId} onValueChange={setSelectedFileId}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select file..." />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800">
                      {stlFiles.map((f: any) => (
                        <SelectItem key={f.id} value={f.id}>{f.display_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-gray-500">No STL files available yet. Upload one to the Vault first.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Printer</Label>
                  <Input value={printerType} onChange={e => setPrinterType(e.target.value)} placeholder="e.g. Ender 3 V3" className="bg-gray-800 border-gray-700 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Material</Label>
                  <Select value={material} onValueChange={setMaterial}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800">
                      {['PLA','PETG','ABS','TPU','Resin','Nylon','ASA','Other'].map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Layer Height (mm)</Label>
                  <Input value={layerHeight} onChange={e => setLayerHeight(e.target.value)} className="bg-gray-800 border-gray-700 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Infill %</Label>
                  <Input value={infill} onChange={e => setInfill(e.target.value)} className="bg-gray-800 border-gray-700 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Result *</Label>
                  <Select value={result} onValueChange={(v: any) => setResult(v)}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800">
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="fail">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Print Time (min)</Label>
                  <Input type="number" value={printTime} onChange={e => setPrintTime(e.target.value)} className="bg-gray-800 border-gray-700 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Material Used (grams)</Label>
                  <Input type="number" value={materialGrams} onChange={e => setMaterialGrams(e.target.value)} className="bg-gray-800 border-gray-700 text-white" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Notes</Label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Observations, issues, tips..." className="bg-gray-800 border-gray-700 text-white" rows={3} />
              </div>

              <Button
                className="w-full bg-cyan-600 hover:bg-cyan-500"
                onClick={() => submitMutation.mutate()}
                disabled={submitMutation.isPending || !selectedFileId}
              >
                {submitMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Submit Report
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quorum Aggregation */}
        {quorum.length > 0 && (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />Success Rates by Material + Printer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {quorum.map(q => (
                  <div key={`${q.material}-${q.printer_type}`} className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium text-gray-300 truncate">{q.material}</div>
                    <div className="w-32 text-sm text-gray-500 truncate">{q.printer_type}</div>
                    <div className="flex-1 bg-gray-800 rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${q.rate >= 80 ? 'bg-green-500' : q.rate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${q.rate}%` }}
                      />
                    </div>
                    <span className="text-sm font-mono text-gray-300 w-16 text-right">{q.successes}/{q.total}</span>
                    <span className={`text-sm font-bold w-12 text-right ${q.rate >= 80 ? 'text-green-400' : q.rate >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                      {q.rate}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Report List */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-200">Recent Reports</h2>
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-cyan-500" /></div>
          ) : reports.length === 0 ? (
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="py-10 text-center">
                <FlaskConical className="w-12 h-12 mx-auto text-gray-700 mb-3" />
                <p className="text-gray-400">No test reports yet. Be the first Test Pilot.</p>
              </CardContent>
            </Card>
          ) : (
            reports.map(r => {
              const cfg = RESULT_CONFIG[r.result];
              const Icon = cfg.icon;
              return (
                <Card key={r.id} className={`bg-gray-900 border-gray-800 ${cfg.bg}`}>
                  <CardContent className="p-4 flex items-start gap-4">
                    <Icon className={`w-6 h-6 ${cfg.color} shrink-0 mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-white">{r.stl_files?.display_name || 'Unknown File'}</span>
                        <Badge variant="outline" className={`text-[10px] ${cfg.color} border-current`}>{cfg.label}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-1 flex-wrap">
                        {r.printer_type && <span>{r.printer_type}</span>}
                        <span>{r.material}</span>
                        {r.settings?.layer_height && <span>{r.settings.layer_height}mm</span>}
                        {r.settings?.infill && <span>{r.settings.infill} infill</span>}
                        {r.print_time_minutes && <span>{r.print_time_minutes}min</span>}
                        {r.material_grams && <span>{r.material_grams}g</span>}
                      </div>
                      {r.notes && <p className="text-sm text-gray-400 mt-2">{r.notes}</p>}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {!user && (
          <div className="text-center py-6">
            <Button variant="outline" className="border-cyan-700 text-cyan-400" onClick={() => navigate('/auth')}>
              Sign In to Submit Reports
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

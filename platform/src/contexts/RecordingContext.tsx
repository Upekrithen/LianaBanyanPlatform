import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";

export type RecordedAction = {
  element: string;
  action: 'click';
  route: string;
  timestamp: number;
};

interface RecordingContextValue {
  isRecording: boolean;
  isCapturing: boolean;
  actionCount: number;
  flowId: string | null;
  start: (flowId: string) => void;
  begin: () => void;
  stop: () => Promise<void>;
  record: (a: RecordedAction) => void;
}

const RecordingContext = createContext<RecordingContextValue | undefined>(undefined);

export const RecordingProvider = ({ children }: { children: React.ReactNode }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [flowId, setFlowId] = useState<string | null>(null);
  const [actions, setActions] = useState<RecordedAction[]>([]);

  const start = useCallback((id: string) => {
    setFlowId(id);
    setIsRecording(true);
    setIsCapturing(false);
    setActions([]);
    toast.success('Record Mode Active - navigate to your start page, then Begin Capture');
  }, []);

  const begin = useCallback(() => {
    if (!isRecording) return;
    setIsCapturing(true);
    toast.success('Capturing interactions...');
  }, [isRecording]);

  const stop = useCallback(async () => {
    const capturing = isCapturing;
    const id = flowId;
    const recorded = actions.slice();

    setIsRecording(false);
    setIsCapturing(false);

    if (!capturing) {
      toast.info('Recording cancelled');
      setActions([]);
      return;
    }

    if (!id || recorded.length === 0) {
      toast.info('No actions captured');
      setActions([]);
      return;
    }

    // Build step payload
    const first = recorded[0];
    const last = recorded[recorded.length - 1];
    const step_description = recorded
      .map((a, i) => `${i + 1}. ${a.action} on ${a.element}`)
      .join("\n");

    try {
      // Get next step number
      const { data: existing, error: qErr } = await supabase
        .from('test_flow_steps')
        .select('step_number')
        .eq('flow_id', id)
        .order('step_number', { ascending: false })
        .limit(1);

      if (qErr) throw qErr;
      const nextNum = existing && existing.length > 0 ? (existing[0].step_number as number) + 1 : 1;

      const { error: iErr } = await supabase
        .from('test_flow_steps')
        .insert([{
          flow_id: id,
          step_number: nextNum,
          step_title: `Recorded interactions on ${first.route}`,
          step_description,
          route_path: first.route,
          expected_outcome: `User can successfully complete recorded interactions on ${first.route}`,
          notes: `Recorded ${recorded.length} action(s) from ${new Date(first.timestamp).toLocaleTimeString()} to ${new Date(last.timestamp).toLocaleTimeString()}`
        }]);

      if (iErr) throw iErr;
      toast.success('Recorded step saved');
    } catch (e: any) {
      toast.error('Failed to save recorded step: ' + e.message);
    } finally {
      setActions([]);
      setFlowId(null);
    }
  }, [isCapturing, flowId, actions]);

  const record = useCallback((a: RecordedAction) => {
    if (!isCapturing) return;
    setActions(prev => [...prev, a]);
  }, [isCapturing]);

  const value = useMemo(() => ({
    isRecording,
    isCapturing,
    actionCount: actions.length,
    flowId,
    start,
    begin,
    stop,
    record,
  }), [isRecording, isCapturing, actions.length, flowId, start, begin, stop, record]);

  return (
    <RecordingContext.Provider value={value}>
      {children}
    </RecordingContext.Provider>
  );
};

export const useRecording = () => {
  const ctx = useContext(RecordingContext);
  if (!ctx) throw new Error('useRecording must be used within RecordingProvider');
  return ctx;
};

import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    });
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      try {
        containerRef.current.innerHTML = chart;
        mermaid.contentLoaded();
      } catch (error) {
        console.error('Mermaid rendering error:', error);
      }
    }
  }, [chart]);

  return (
    <div
      ref={containerRef}
      className="mermaid bg-white dark:bg-gray-900 p-6 rounded-lg overflow-x-auto"
    />
  );
}

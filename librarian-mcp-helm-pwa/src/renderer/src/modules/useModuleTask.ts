/**
 * useModuleTask — React hook for Helm module background task management.
 *
 * Provides: run, stop, status polling, and output streaming for a named
 * Python subprocess task running in the Helm main process.
 *
 * K486 / B123
 */

import { useState, useEffect, useCallback, useRef } from 'react'

export type TaskState = 'idle' | 'running' | 'done' | 'error'

export interface UseModuleTaskReturn {
  state: TaskState
  outputLines: string[]
  exitCode: number | null
  pid: number | null
  startedAt: string | null
  run: (script: string, args: string[], cwd: string) => Promise<void>
  stop: () => Promise<void>
  clearOutput: () => void
}

const isElectron = typeof window !== 'undefined' && typeof (window as any).helm !== 'undefined'

export function useModuleTask(taskId: string): UseModuleTaskReturn {
  const [state, setState] = useState<TaskState>('idle')
  const [outputLines, setOutputLines] = useState<string[]>([])
  const [exitCode, setExitCode] = useState<number | null>(null)
  const [pid, setPid] = useState<number | null>(null)
  const [startedAt, setStartedAt] = useState<string | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  // Subscribe to output stream
  useEffect(() => {
    if (!isElectron) return
    const helm = (window as any).helm
    const cleanup = helm.onModuleOutput(taskId, (line: string, stream: 'stdout' | 'stderr') => {
      if (line === `[task-exit] exit_code=0`) {
        setState('done')
        setExitCode(0)
      } else if (line.startsWith('[task-exit]')) {
        setState('error')
        const match = line.match(/exit_code=(-?\d+)/)
        setExitCode(match ? parseInt(match[1], 10) : -1)
      }
      setOutputLines((prev) => [...prev, stream === 'stderr' ? `⚠ ${line}` : line])
    })
    cleanupRef.current = cleanup
    return cleanup
  }, [taskId])

  const run = useCallback(async (script: string, args: string[], cwd: string) => {
    if (!isElectron) {
      setOutputLines(['[browser mode] Module tasks require the Electron desktop shell.'])
      return
    }
    const helm = (window as any).helm
    setOutputLines([])
    setExitCode(null)
    setState('running')
    setStartedAt(new Date().toISOString())

    const result = await helm.runModuleTask(taskId, '', script, args, cwd)
    if (!result.ok) {
      setOutputLines([`[error] ${result.error}`])
      setState('error')
    } else {
      // Get PID from status
      const status = await helm.getModuleTaskStatus(taskId)
      setPid(status.pid)
    }
  }, [taskId])

  const stop = useCallback(async () => {
    if (!isElectron) return
    const helm = (window as any).helm
    await helm.stopModuleTask(taskId)
    setState('idle')
  }, [taskId])

  const clearOutput = useCallback(() => {
    setOutputLines([])
  }, [])

  return { state, outputLines, exitCode, pid, startedAt, run, stop, clearOutput }
}

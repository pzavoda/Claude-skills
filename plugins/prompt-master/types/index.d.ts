export type PmStatus = 'idle' | 'working' | 'done' | 'error'

declare module 'claude-code' {
  interface PluginState {
    'prompt-master': { status: PmStatus; original: string | null; note: string }
  }
}

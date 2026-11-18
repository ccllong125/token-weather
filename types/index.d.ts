/** Context tokens in use after each turn, oldest first, at most 12. */
export type History = number[]

declare module 'claude-code' {
  interface PluginState {
    'token-weather': { history: History; window: number }
  }
}

import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { History } from '../types'

const MAX_TURNS = 12
const BARS = '▁▂▃▄▅▆▇█'

const history = atom({ plugin: 'token-weather', key: 'history' } as const, [] as History)
const windowSize = atom({ plugin: 'token-weather', key: 'window' } as const, 0)

type Forecast = { icon: string; label: string; color: string }

export function forecast(percent: number): Forecast {
  if (percent < 25) return { icon: '☀', label: 'Clear', color: 'yellow' }
  if (percent < 50) return { icon: '☁', label: 'Cloudy', color: 'cyan' }
  if (percent < 75) return { icon: '☂', label: 'Showers', color: 'blue' }
  if (percent < 90) return { icon: '☇', label: 'Storm', color: 'magenta' }
  return { icon: '↯', label: 'Compact soon', color: 'red' }
}

/** 134400 → "134.4k", 200000 → "200k", 1000000 → "1M". */
export function formatTokens(n: number): string {
  const trim = (v: number) => v.toFixed(1).replace(/\.0$/, '')
  if (Math.abs(n) >= 1_000_000) return `${trim(n / 1_000_000)}M`
  if (Math.abs(n) >= 1_000) return `${trim(n / 1_000)}k`
  return `${Math.round(n)}`
}

/** One bar per turn, scaled against the full context window. */
export function sparkline(values: History, window: number): string {
  return values
    .map(v => {
      const ratio = window > 0 ? Math.min(Math.max(v / window, 0), 1) : 0
      return BARS.charAt(Math.min(BARS.length - 1, Math.floor(ratio * BARS.length)))
    })
    .join('')
}

/** Appends the live window's fill to the history, once there is a response to measure. */
async function record($: EngineInterface): Promise<void> {
  const { context } = await $.session.usage()
  if (context.tokens === undefined) return
  const tokens = context.tokens
  await update($, windowSize, () => context.window)
  await update($, history, prev => [...prev, tokens].slice(-MAX_TURNS))
}

export const register: Register = on => {
  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    await record($)
    return result
  })

  on('session.start', async ($, e, next) => {
    const result = await next(e)
    // A resumed session already has a live window: seed the band with it.
    if ((await read($, history)).length === 0) await record($)
    return result
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const turns = await read($, history)
    const window = await read($, windowSize)

    if (e.props.hasSurvey || turns.length === 0 || window <= 0) {
      return next(e)
    }

    const { Box, Text } = $.ui.resolve(e)

    const used = turns.at(-1) ?? 0
    const before = turns.at(-2)
    const percent = Math.round((used / window) * 100)
    const sky = forecast(percent)
    const delta = before === undefined ? null : used - before

    return (
      <Box>
        <Text color={sky.color} bold>
          {sky.icon} {sky.label}
        </Text>
        <Text dimColor> · </Text>
        <Text color={sky.color}>{percent}%</Text>
        <Text>
          {' '}
          {formatTokens(used)} / {formatTokens(window)}
        </Text>
        <Text dimColor> · </Text>
        <Text color={sky.color}>{sparkline(turns, window)}</Text>
        {delta !== null && (
          <>
            <Text dimColor> · </Text>
            <Text dimColor>
              {delta >= 0 ? '▲ +' : '▼ −'}
              {formatTokens(Math.abs(delta))} last turn
            </Text>
          </>
        )}
      </Box>
    )
  })
}

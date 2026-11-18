import { expect, test } from 'claude-code/testing'

import { forecast, formatTokens, sparkline } from './register'

test('forecast bands follow the percentage thresholds', async () => {
  expect(forecast(0).label).toBe('Clear')
  expect(forecast(24).color).toBe('yellow')
  expect(forecast(25).label).toBe('Cloudy')
  expect(forecast(49).color).toBe('cyan')
  expect(forecast(50).label).toBe('Showers')
  expect(forecast(74).color).toBe('blue')
  expect(forecast(75).label).toBe('Storm')
  expect(forecast(89).color).toBe('magenta')
  expect(forecast(90).label).toBe('Compact soon')
  expect(forecast(100).color).toBe('red')
})

test('token counts read like 134.4k / 200k', async () => {
  expect(formatTokens(134_400)).toBe('134.4k')
  expect(formatTokens(200_000)).toBe('200k')
  expect(formatTokens(98_300)).toBe('98.3k')
  expect(formatTokens(1_000_000)).toBe('1M')
  expect(formatTokens(512)).toBe('512')
})

test('sparkline scales each turn against the window', async () => {
  expect(sparkline([0, 100_000, 200_000], 200_000)).toBe('▁▅█')
})

const BAND = {
  plugin: 'token-weather',
  component: 'AbovePrompt',
  props: {
    hasSurvey: false,
    isCollapsed: false,
    isWorking: false,
    maxRows: 10,
    columns: 100,
    scroll: { offset: 0, bodyRows: 10 },
  },
} as const

test('the band shows the forecast line after two turns', async ($, on) => {
  const seeded: Record<string, unknown> = { history: [36_100, 134_400], window: 200_000 }
  on('state.get', (_, e) => ({ value: { value: seeded[(e as { key: string }).key], version: 1 } }))

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...BAND, surface } as never)
    const text = (await ui.find({ type: 'Box' }))?.text ?? ''
    expect(text).toContain('☂ Showers')
    expect(text).toContain('67%')
    expect(text).toContain('134.4k / 200k')
    expect(text).toContain('▂▆')
    expect(text).toContain('▲ +98.3k last turn')
    await ui.unmount()
  }
})

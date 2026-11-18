# token-weather

A Claude Code mod that shows a weather-style forecast of your context window usage in a band above the prompt, updated after every turn.

在 Claude Code 輸入框上方的橫條，用天氣預報的方式即時顯示 context window 用量，每一輪結束後更新。

```
☂ Showers · 67% 134.4k / 200k · ▂▆ · ▲ +98.3k last turn
```

## 顯示內容

- **天氣**（依用量）：
  - 低於 25%：☀ Clear（黃色）
  - 25%–49%：☁ Cloudy（青色）
  - 50%–74%：☂ Showers（藍色）
  - 75%–89%：☇ Storm（洋紅色）
  - 90% 以上：↯ Compact soon（紅色）
- **用量**：百分比，加上已用 token 與視窗上限，例如 `134.4k / 200k`
- **小圖表**：最近 12 輪的用量，用 `▁▂▃▄▅▆▇█` 畫出，每根長條以整個視窗上限為基準
- **上一輪變化**：例如 `▲ +98.3k last turn`；壓縮 context 後會顯示 `▼`

第一輪結束前沒有數據，橫條會先隱藏。

## 安裝

在終端機的 Claude Code 輸入：

```
/plugin install token-weather --marketplace ccllong125/token-weather
```

詢問是否加入 marketplace 時按 `y`，再選擇安裝範圍（建議 user，所有 session 都會載入）。

從 shell 安裝：

```bash
claude plugin install token-weather --marketplace ccllong125/token-weather
```

在 Claude 桌面 App：點輸入框旁的「+」→ Plugins → Add marketplace，填入 `ccllong125/token-weather`，再按 Add plugin。

橫條會顯示在終端機、桌面 App 和手機 App；VS Code 擴充套件沒有輸入框上方這個位置。

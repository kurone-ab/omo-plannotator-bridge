# omo-plannotator-bridge

A bridge plugin that connects [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) with [plannotator](https://github.com/backnotprop/plannotator/tree/main/apps/opencode-plugin).

When oh-my-opencode's planning agents (Prometheus) are active, this plugin injects instructions for them to call the `submit_plan` tool — so plans get surfaced to you for review before work begins.

## How it works

This plugin hooks into opencode's system prompt pipeline and detects which agent is currently active. If it's **Prometheus** or **Sisyphus**, it appends instructions to use plannotator's `submit_plan` tool at the appropriate moment.

- **Prometheus** — instructed to call `submit_plan` after completing a plan, before asking about Start Work / High Accuracy
- **Sisyphus** — instructed to call `submit_plan` before proceeding with significant work steps that need confirmation

It also suppresses the `"Proceed with implementation"` message that would otherwise be sent when approving a plan, keeping the conversation clean.

## Prerequisites

Both plugins must be enabled in your opencode config:

- [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode)
- [plannotator](https://github.com/backnotprop/plannotator/tree/main/apps/opencode-plugin)

## Installation

~/.config/opencode/opencode.json
```json
{
  "plugin": [
    "oh-my-opencode",
    "@plannotator/opencode",
    "omo-plannotator-bridge"
  ]
}
```

## Acknowledgements

- [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) by YeonGyu Kim — [Sustainable Use License](https://github.com/code-yeongyu/oh-my-opencode/blob/master/LICENSE.md)
- [plannotator](https://github.com/backnotprop/plannotator) by backnotprop — Apache-2.0 / MIT

## License

MIT
# claude-skills

A Claude Code plugin marketplace.

## Plugins

- **prompt-master**: rewrites your rough prompt into a clearer, better-structured one before you send it. Click **✨ Prompt Master** above the prompt box, or run `/prompt-master <rough prompt>`. See [plugins/prompt-master](plugins/prompt-master/README.md).

## Install

From a shell (run once per computer; works for the terminal and the desktop app's local sessions):

```
claude plugin marketplace add pzavoda/Claude-skills
claude plugin install prompt-master@claude-skills
```

Or at the prompt of a local Claude Code session:

```
/plugin marketplace add pzavoda/Claude-skills
/plugin install prompt-master@claude-skills
```

In the desktop app (local sessions only; the Plugins menu is unavailable in cloud sessions): click + next to the prompt box, then Plugins, Add marketplace with `pzavoda/Claude-skills`, then Add plugin.

## Automatic in sessions on this repo

`.claude/settings.json` registers this marketplace and enables `prompt-master`, so any Claude Code session opened on this repository (including cloud sessions) offers or loads it with no manual install.

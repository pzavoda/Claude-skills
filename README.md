# claude-skills

A Claude Code plugin marketplace.

## Plugins

- **prompt-master**: rewrites your rough prompt into a clearer, better-structured one before you send it. Click **✨ Prompt Master** above the prompt box, or run `/prompt-master <rough prompt>`. See [plugins/prompt-master](plugins/prompt-master/README.md).

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install prompt-master --marketplace pzavoda/Claude-skills
```

From a shell:

```
claude plugin install prompt-master --marketplace pzavoda/Claude-skills
```

In the desktop app: click + next to the prompt box, then Plugins, Add marketplace with `pzavoda/Claude-skills`, then Add plugin.

## Automatic in sessions on this repo

`.claude/settings.json` registers this marketplace and enables `prompt-master`, so any Claude Code session opened on this repository (including cloud sessions) offers or loads it with no manual install.

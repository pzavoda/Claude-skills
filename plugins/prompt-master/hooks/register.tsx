import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { PmStatus } from '../types'

const status = atom({ plugin: 'prompt-master', key: 'status' } as const, 'idle' as PmStatus)
const original = atom({ plugin: 'prompt-master', key: 'original' } as const, null as string | null)
const note = atom({ plugin: 'prompt-master', key: 'note' } as const, '')

const SYSTEM = `You are Prompt Master. You rewrite a user's rough prompt for an AI coding/assistant agent into a better prompt.
Rules:
- Keep the user's intent, scope, facts, names, paths and code exactly; never invent requirements.
- Make the goal explicit up front, then add useful structure: context, specific requirements, constraints, and what "done" looks like / desired output format.
- Fix spelling and grammar; remove filler and ambiguity. Keep it concise — short asks stay short.
- Write in the user's voice (first person, imperative), as the prompt they would send.
- If something essential is unknowable, add a brief "[fill in: ...]" placeholder rather than guessing.
Output ONLY the rewritten prompt text. No preamble, no quotes, no commentary.`

type Dollar = EngineInterface

async function rewrite($: Dollar, rough: string): Promise<string | null> {
  const r = await $.model.complete({
    model: 'sonnet',
    system: SYSTEM,
    prompt: `Rough prompt:\n<<<\n${rough}\n>>>`,
    maxTokens: 2048,
    effort: 'low',
    timeoutMs: 45000,
  })
  if (!r.isAnswered) return null
  const text = r.text.trim()
  return text.length > 0 ? text : null
}

async function runOnBox($: Dollar): Promise<string> {
  if ((await read($, status)) === 'working') return 'Prompt Master is already working.'
  const box = await $.prompt.read()
  const rough = box.text.trim()
  if (!rough) {
    $.ui.toast('Type a rough prompt first, then press Prompt Master.')
    return 'Nothing to rewrite.'
  }
  await update($, status, () => 'working' as PmStatus)
  $.ui.status('Prompt Master: rewriting…')
  const better = await rewrite($, rough)
  $.ui.status(undefined)
  if (!better) {
    await update($, status, () => 'error' as PmStatus)
    await update($, note, () => 'The rewrite failed. Your prompt is unchanged.')
    return 'Rewrite failed.'
  }
  const filled = await $.prompt.fill({ text: better, mode: 'replace' })
  if (!filled.isFilled) {
    await update($, status, () => 'error' as PmStatus)
    await update($, note, () => 'Could not write into the prompt box.')
    return better
  }
  await update($, original, () => box.text)
  await update($, status, () => 'done' as PmStatus)
  await update($, note, () => 'Rewritten. Review it, then press Enter to send.')
  return 'Prompt rewritten in the box. Review and send.'
}

async function undo($: Dollar) {
  const prev = await read($, original)
  if (prev === null) return
  await $.prompt.fill({ text: prev, mode: 'replace' })
  await update($, original, () => null)
  await update($, status, () => 'idle' as PmStatus)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'prompt-master',
      description: 'Rewrite a rough prompt into a better one: /prompt-master <rough prompt>',
    })
    return next(e)
  })

  // /prompt-master <text>: rewrite the given text and leave it in the box to review.
  on('command.run', { command: 'prompt-master' }, async ($, e) => {
    const rough = e.args.trim()
    if (!rough) return { text: await runOnBox($) }
    $.ui.status('Prompt Master: rewriting…')
    const better = await rewrite($, rough)
    $.ui.status(undefined)
    if (!better) return { text: 'Prompt Master: the rewrite failed.' }
    const filled = await $.prompt.fill({ text: better, mode: 'replace' })
    await update($, original, () => rough)
    await update($, status, () => 'done' as PmStatus)
    await update($, note, () => 'Rewritten. Review it, then press Enter to send.')
    return {
      text: filled.isFilled
        ? 'Prompt Master put the rewritten prompt in your prompt box. Review it and send.'
        : `Prompt Master rewrite:\n\n${better}`,
    }
  })

  // Clear the band's "done" state once the person sends.
  on('prompt.submit', async ($, e, next) => {
    await update($, original, () => null)
    await update($, status, () => 'idle' as PmStatus)
    return next(e)
  })

  // The Prompt Master button, right above the prompt box.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e)
    const { Box, Button, Text } = $.ui.resolve(e)
    const s = await read($, status)
    const msg = await read($, note)
    const canUndo = (await read($, original)) !== null

    return (
      <Box flexDirection="row" gap={1}>
        <Button
          key="pm"
          label={s === 'working' ? '✨ Rewriting…' : '✨ Prompt Master'}
          onPress={() => void runOnBox($)}
        />
        {canUndo && <Button key="undo" label="Undo" onPress={() => void undo($)} />}
        {(s === 'done' || s === 'error') && <Text dimColor>{msg}</Text>}
        {s === 'idle' && <Text dimColor>Type a rough prompt, then click to improve it</Text>}
      </Box>
    )
  })
}

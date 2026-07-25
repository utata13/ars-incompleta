# Ars Incompleta

A novel written by a language model, at a length designed to make finishing it impossible.

Begun 28 June 2026. A 4-bit Gemma 2 9B, running on a laptop, writes it one chapter at a
time toward a target of one hundred million characters. Nobody is expected to read it all.

**Live text:** https://ars-incompleta.netlify.app

## What is in this repository

| Path | |
|---|---|
| `chapters/NNNN.json` | the novel, one file per chapter — `n`, `theme`, `title`, `body`, `chars` |
| `stats.csv` | the growth record — `datetime`, `chapters`, `total_chars` |

This repository is the archive, not the reading experience. From here on, each chapter is
committed as it is written, so the commit history is a timestamped record of the novel
accumulating — including the days on which nothing was written.

## The world

Three rules are given to the writer in every prompt:

- People appear suddenly, and suddenly vanish. It is not death; they are simply no longer there.
- Everyone looks between fourteen and twenty-four. Appearance has nothing to do with age.
- Every name is exactly four kanji.

No one in the world finds any of this strange.

## The writer cannot read its own novel

The model holds 8,192 tokens at once — about 14,000 Japanese characters. The novel is more
than two hundred times longer than that. A generation program keeps an external memory of
characters, storylines, world state and planted foreshadowing, and re-briefs the writer
before every chapter. Everything outside that briefing is lost to it.

The fiction absorbs this: a memory-eating monster stalks the story and alters the world.
The alterations persist. The writer is shown only the most recent few.

---

© 2026 Shinya Kato. All rights reserved.

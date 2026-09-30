# Chem Quests

Two campaigns share one engine:

- **Avogadro Station**: the Chem Quiz Study Guide (moles, reactions, naming).
- **Valence Spire**: the CHE1011 Unit 2 practice test, all 82 questions (Lewis structures, bonding, polarity, naming, moles, stoichiometry, reaction types).

## Avogadro Station

A phone-friendly chemistry quiz-prep game built from the Chem Quiz Study Guide.
You repair a stranded research station by solving the guide's 34 problems.

- Calculation problems are worked by hand on paper. You enter only the final answer
  (scientific notation, sig figs, units) and it's graded like a quiz.
- Wrong answers show a worked solution and queue a "rerouted" version with new numbers.
- A final systems check re-tests every topic, twice for topics you missed.
- "Remix run" replays everything with new numbers.

Pixel-art presentation: a playable station map, animated rooms, device-style
controls for each topic (IV pump keypad, reactor dials, ion tank, battery wiring,
radar, label maker), MOLLY the station AI, combos, badges, ranks, chiptune sound
effects, and an escape sequence with an optional exam timer.

Open `index.html` in any browser. Source lives in `src/parts/`:
`a-shell.html` (styles + page shell), `b-data.js` (study-guide problems, generators,
grading data), `c-game.js` (rendering, sound, game logic), `d-tower.js` (Valence Spire questions, tower art, campaign definitions), `e-init.js` (startup). Run `./build.sh` to
regenerate `src/game.html` (artifact fragment) and `index.html`.

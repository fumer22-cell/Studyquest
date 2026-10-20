# Chem Quests

One engine, four campaigns. The current exam is listed first; earlier ones sit in an archive on the title screen.

- **Night Shift at Mercy General** (current): all 74 questions from the Unit 3 practice exam (Ch. 5–6), each set as a case in a hospital department, with Dalton the therapy dog. Exam conditions: every question runs on a clock (toggle on the map), there are no formula hints, multiple choice is kept where the exam uses it, and calculations are worked by hand with only the final answer typed. A Code Blue final, plus a break room where you redo misses to win back stamina. Nine concept questions ask for a written explanation instead, graded by Claude against a points rubric with partial credit (missing one reroutes you to the exam's multiple-choice version).
- **The Skylark Run** (current, learning version of the same chapters): CHE101 FunSheets for Chapter 5 (gases, liquids, solids) and Chapter 6 Parts 1–2 (solutions). Every problem is a job aboard an airship or at an island research station, and each answer decides something in the story. Story-driven timed problems, word-bank fill-ins, intermolecular-force checklists, ranking, and an exam-conditions storm finale.

Archived:


- **Avogadro Station**: the Chem Quiz Study Guide (moles, reactions, naming).
- **Valence Spire**: the CHE1011 Unit 2 practice test, all 82 questions (Lewis structures, bonding, polarity, naming, moles, stoichiometry, reaction types).
- **Temple of the Mole**: the CHE1011 Chapters 3 & 4 unit test study guide, 78 tasks built almost entirely without multiple choice: a dot builder, a Lewis-structure workbench, typed names and formulas, an equation writer (formulas → balance → phases → type), and paper calculations.

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
grading data), `c-game.js` (rendering, sound, game logic), `d-tower.js` (Valence Spire questions, tower art, campaign definitions), `f-temple.js` (Temple of the Mole content plus the built-answer types), `g-sky.js` (The Skylark Run, cloze/checks/rank types, timed-problem badge), `h-med.js` (Night Shift at Mercy General), `i-ai.js` (Claude grading for written answers and the ask-for-help tutor), `e-init.js` (startup). Run `./build.sh` to
regenerate `src/game.html` (artifact fragment) and `index.html`.

## Claude features

When the game runs as a Claude artifact it uses the viewer's own Claude account (the artifact `sample` capability). The first use asks permission.

- **Written answers** (`type:'open'`): you type an explanation; Claude grades it against the question's rubric and returns points per rubric item, feedback, and any misconception. Full marks count as correct; partial credit costs less stamina. Without Claude (a plain copy of `index.html`, or permission declined) you grade yourself against the key and rubric instead.
- **Ask for help**: after any answer, "Ask <companion>" opens a chat about that question, with the question, your answer and the worked solution as context. While no clock is running (not in finals or exam-timed questions), "Call <companion>" costs 5 energy and gives a nudge without revealing the answer.

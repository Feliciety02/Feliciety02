# 🌱 How this farm works

My profile README is **generated** — every picture on it is an animated SVG drawn by the scripts in this repo from my live GitHub data. Nothing is hand-edited, so the page stays up to date on its own.

## 🧺 What's on the page

| Section | Made by | Data it uses |
|---|---|---|
| 🌾 Farm | `scripts/farm.mjs` | Contribution calendar — each crop is one day; more contributions = bigger crops |
| 💬 Dialogue box | `scripts/cards.mjs` → `renderDialogue` | Name, bio, latest repo + my pixel portrait |
| 🎒 Inventory | `scripts/cards.mjs` → `renderInventory` | Languages across my own (non-fork) repos |
| 📜 Quest log | `scripts/cards.mjs` → `renderQuest` | Pinned repos (or `quests` in the config) |
| 📮 Mailbox | `scripts/cards.mjs` → `renderMail` | Social links + website from my profile |


## 👩‍🌾 The farmer

The little farmer walking the rows is a pixel version of me, drawn in `scripts/farm.mjs` (`FP` palette, `TOP`, `FRONT`, `BACK`, `SIDE`, `LEGS_A`, `LEGS_B`, `SIDE_A`, `SIDE_B`):

- **Hair:** chestnut-brown hair in a low bun at the nape, with wispy bangs
- **Face:** brown eyes with a white shine, pink blush
- **Earrings:** one white pearl on each ear, visible from the front and the back
- **Outfit:** black short-sleeved top under blue overalls with gold buttons and a pocket, and brown boots
- **Watering can:** she waters each day's plot as she walks

She is drawn at half-pixel scale (32×48) so she has more detail than the crops, but takes the same space on the field. Only the left half of each row is written out; it is mirrored to make the right half. Two leg frames swap to make her walk, and she turns to face the way she is going: `FRONT` walking down a row, `BACK` walking up, and the `SIDE` view (mirrored for left) when she steps to the next row or heads home along the lane. Her watering can switches hands with her.

## 🎨 How the art is drawn

- **Pixel sprites as text grids** — every sprite is a list of strings where each character is a colour, turned into SVG by `sprite()` in `scripts/pixel.mjs` (one `<path>` per colour keeps files tiny).
- **Pixel font** — a hand-made 5×7 font (`GLYPHS`) renders all the text, so it looks the same everywhere.
- **Logos** — 16×16 pixel takes on language and social icons live in `scripts/logos.mjs`; unknown languages get an initials tile.
- **Animation without JavaScript** — GitHub shows README images through `<img>`, which blocks scripts, so all motion uses SMIL (`<animate>`, `<animateMotion>`) and CSS keyframes: the farmer walking the rows, the day/night cycle, the typewriter text.

## ⚙️ How it stays fresh

`.github/workflows/farm.yml` runs **every 6 hours**, on manual dispatch, and whenever the scripts change:

1. Fetches my profile and contribution calendar with the GitHub GraphQL API
2. Runs `node scripts/build.mjs`, which rewrites `assets/` and `README.md`
3. Commits the result as `farm-bot`

## 🛠️ Customising

`profile.config.json` tweaks what's shown:

```json
{
  "extraInventory": [{ "label": "Figma", "note": "UI/UX design" }],
  "maxQuests": 6
}
```

Other keys: `name` (display name), `intro` (custom dialogue lines) and `quests` (repo names to show instead of pins).

## 💻 Preview locally

```bash
node scripts/build.mjs --sample   # offline, uses sample data
node scripts/serve.mjs            # http://localhost:4782
```

With a token you can build from real data: `GITHUB_TOKEN=... GH_LOGIN=Feliciety02 node scripts/build.mjs`.

> Edit the scripts, not `README.md` — the next run overwrites it.

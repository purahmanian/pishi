# Pishi — bite-sized English games for Persian-speaking kids

Single-file HTML games with native-speaker audio embedded. Each game is ONE file:
download once, works offline forever, forwards over Telegram/Bluetooth like a photo.
Built by the Kargah factory (see the kargah skill) — this repo is the distribution end.

## The confirmed stack
- **One .html file per game.** All audio base64-embedded, all art inline SVG.
  No network calls, no accounts, no analytics, no student names — ever.
  Scoreboards use animal avatars, never names (safeguarding rule, non-negotiable).
- **Budgets:** ≤5 MB per file (audio at 48–64 kbps mono MP3), tap-first UI,
  works on any Android browser from the last decade, Persian UI for the teacher,
  English content for the kids.
- **games/src/** holds templates with a `/*__AUDIO__*/` placeholder;
  the build step injects base64 audio from the Kargah audio library.

## Publishing (GitHub Pages — the host that stays reachable from Iran)
```
gh repo create pishi --public --source . --push
gh api repos/{owner}/pishi/pages -X POST -f build_type=workflow 2>/dev/null || true
# or: repo Settings → Pages → Deploy from branch → main → root
```
Site: https://<you>.github.io/pishi/ — GitHub was on Iran's 2026 allowlist and
github.io is Fastly-fronted (reported accessible). Do NOT put this behind Cloudflare,
Vercel or Netlify. Always have a user inside Iran confirm reachability; and remember
the URL is the doorway, the FILE is the product — every file must survive being
forwarded with the site gone.

## Adding a game
1. Ask the Kargah skill: "new game: <idea>, week N words" — it authors src HTML
   on the design system, generates any missing audio (TTS), injects, and updates
   index.html.
2. Rules that don't bend: original content only · CC0 · no coursebook brand names ·
   color never carries meaning alone · every game playable one-handed by a 7-year-old
   or run by a teacher from her phone.

## Games
| file | what | size |
|---|---|---|
| games/pishi-week1.html | Week 1 flashcards + listen-and-tap + chant | 0.9 MB |
| games/color-cup.html | Team quiz with animal-avatar scoreboard (teacher-run) | 0.4 MB |

License: CC0. Copy, remix, rebrand, no credit needed.

# Poop Games

Three offline games: Crossword, Word Guess Daily, and Galactic Raiders, plus an AI game creator supporting HTML/CSS/JavaScript and Three.js. Apple sign-in is required for creation and cloud saves. No ads, analytics, subscriptions, or purchases. Existing crossword saves retain their original storage keys.


100% free. No ads. Just daily crosswords. A minimal native Expo iOS app. One new crossword per local day, 3,000 original bundled puzzles, automatic saves, and a simple home screen with unfinished puzzles ordered by last opened and a completed archive. The built-in games require no login or network connection.

## Run

Node 22 LTS is recommended.

```sh
npm ci
npm start
npm test
npm run typecheck
```

`npm run ios` runs a local native build with a supported Xcode. `npm run web` provides a browser preview. Production iOS builds use EAS and its current Xcode image.

## Puzzle library

The daily library contains 3,000 full-size 15×15 crosswords with 70–82 clues per puzzle. Black squares have 180-degree rotational symmetry, every white square belongs to both an Across and a Down answer, all answers are at least three letters, and every grid is connected. Pinch to enlarge the grid on iOS.

`npm run puzzles` deterministically fills six original block patterns using Python 3.10+, a C++17 compiler, and the pinned CC0 word/clue bank. Generation is reproducible with the same compiler and standard library. The generator is a development tool; puzzles ship inside the app and need no network connection. See [content provenance](data/SOURCES.md). Every grid and answer set is unique; individual words and clues recur across puzzles.

Tests independently check the entire library for size, density, symmetry, numbering, answers, duplicate answers, clue coverage, crossings, connectivity, and uniqueness. `data/legacy-puzzles.json` retains the exact old 9×9 boards so saved and completed games remain readable. New games use the newspaper edition; the daily sequence and limits are preserved.

## Saving and daily limits

A monotonic sequence assigns each puzzle only once. A local-calendar start date enforces one new puzzle per day, with rollback protection for dates already used. Opening or completing an existing puzzle does not consume a new day. After puzzle 3,000, the archive remains available and the app does not repeat puzzles.

AsyncStorage holds all game progress. A small iOS Keychain reservation is written before a new puzzle is saved. Interrupted writes recover the same puzzle, and retained Keychain data prevents starting again at puzzle 1 after reinstalling. Writes are serialized. Invalid saves show a recoverable error rather than silently deleting history.

This is an offline app: it cannot enforce a global allowance across separate devices, deliberate clock advances, or deletion of all device/Keychain data. No cross-device sync is claimed. Normal uninstall may remove saved boards; the sequence record can survive in Keychain.

## Release

```sh
npx eas-cli build -p ios --profile production
npx eas-cli submit -p ios --profile production
```

Signing and submission credentials are managed by the existing Expo account. Never commit private keys or signing certificates. Apple must approve a submission before it appears on the App Store.

Support/privacy: https://for-real-labs.github.io/poop-games/

## Create a game

Sign in with Apple, describe a 2D or 3D game, preview it, and choose **Save to games** to add it to the dashboard. Open a saved game and choose **Edit game** to request revisions. New accounts receive 10 credits; each creation or revision costs one. Failed/interrupted generations return the credit. The verified owner email `jakejohnson3700@gmail.com` receives unlimited credits (choose Share My Email on Apple sign-in for this address).

Games and drafts live in a dedicated Supabase project and are cached per account on the device. Generated games can load HTTPS libraries and assets; games with external dependencies need internet. Arbitrary game code runs inside an opaque iframe in a WebView, without Supabase tokens or native account access. There are no genre, template, 2D/3D, or game-engine restrictions. The backend makes a direct Anthropic Messages request with the existing game source for revisions; there is no Nova runtime, Docker agent, tool execution, or browser harness.

### Backend

- Railway project: https://railway.com/project/2c67b953-e4d1-4f6e-adb0-33d62cce6189
- API: https://game-api-production-1f28.up.railway.app
- Supabase project: https://supabase.com/dashboard/project/buyypwfajcaowhcggmxs
- Server: `server/`; schema and atomic credit/job functions: `supabase/migrations/`.
- `POST /generateGame`: authenticated `{requestId, prompt, gameId?}`; returns a persisted job. Poll `GET /jobs/:id`. Reusing a request ID does not charge again.
- `GET /me`, `GET /games`, `PATCH /games/:id` (`{saved:true}`), `GET /jobs`, `DELETE /account`.
- Required server secrets: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`. `APPLE_ONLY=true`; model defaults to `claude-sonnet-4-6`.
- Deploy: `railway up server --path-as-root --service game-api`. Jobs are claimed atomically across replicas; pending jobs survive in the database, and requests interrupted by a restart are refunded after ten minutes on the next account refresh. Generation has an eight-minute provider timeout.
- Public app connection settings are in `src/studio/config.ts`; `EXPO_PUBLIC_*` environment overrides are optional. No server secrets ship in the app.
- `npm run typecheck`, `npm test`, and `npm --prefix server test` run validation.
- `node server/integration-check.mjs` exercises real auth rejection, credit accounting, and RLS using disposable admin-created test accounts. Set the four connection variables described in that script; `RUN_LIVE_GENERATION=1` also exercises paid Anthropic generation, saving, isolation, and revision. It does not substitute for a real Apple sign-in test.

Apple native sign-in is configured in Supabase for `com.forreallabs.dailycrossword` and in Expo via `usesAppleSignIn`. Sign in with Apple is enabled on the Apple Developer App ID. The distribution provisioning profile must be regenerated with this entitlement before a device release. A real-device Apple authorization remains a manual acceptance check. The feature is not submitted to the App Store by this change; update App Privacy disclosures before submission.

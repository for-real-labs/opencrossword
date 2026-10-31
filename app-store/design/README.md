# Poop Games store images

Run `python render.py` after installing `requirements.txt`. The renderer composes four panels for each device: dashboard, crossword, daily word guessing, and arcade play. Captures in `app-store/screenshots/poop/` come from the current production JavaScript bundle running in the compatible native simulator app on iPhone 16 Pro Max and iPad Pro 13-inch.

The new icon uses built-in image generation. Its prompt and provenance are in `generation-ledger.json`. Backgrounds, framing, and typography are deterministic; screenshots are never invented. `capture-manifest.json` records hashes and crop bounds. Export tests validate dimensions, opacity, ordering, and capture provenance.

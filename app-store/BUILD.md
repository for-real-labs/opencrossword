# Build 4

Expo's free iOS build allowance was exhausted after the native build completed. The final change only gives crossword letters a full-width text container, fixing clipped narrow glyphs on iOS.

The Hermes bundle was rebuilt from source commit `8bd2da2` using Node 22 and `expo export:embed --entry-file index.ts --platform ios --dev false --bytecode`. It replaced `main.jsbundle` in the completed EAS production archive. The build number was changed to 4, and the archive was signed again using the existing distribution certificate and provisioning profile. The temporary signing keychain was removed afterward.

The same bundle was installed and tested in the completed simulator binary. Its SHA-256 matches the release bundle. Native libraries and assets are unchanged. Strict recursive code-signature verification passed; EAS Submit uploaded the archive to Apple. EAS's remote build number is 4 so the next normal build will increment to 5.

See `release-status.json` for build IDs and hashes, and `validation.json` for verification. Future releases can use the normal EAS build command once the account's quota resets.

# Build 5 — OpenCrossword

Source `d8404e4` renames the app to OpenCrossword and emphasizes “100% free. No ads. Just daily crosswords.” The production Hermes bundle and `CFBundleDisplayName` were updated using the same verified packaging process. The signed archive uses build number 5; EAS’s remote build number is also 5. Native libraries, dependencies, entitlements, and assets remain unchanged. Updated home screenshots were captured on iPhone and iPad.

# Build 6 — repository links

Source `212ba8c` updates the in-app support URL after the authorized repository rename to `for-real-labs/opencrossword`. The on-device name remains OpenCrossword; the App Store name is Crossword: No Ads. The release bundle was rebuilt and signed using the same process, with build number 6 also set in EAS. Six feature images combine real native captures with original fal.ai artwork. See release-status.json for the current Apple review state.

# Build 8 — full-size crosswords and Expo account

The 15×15 crossword update uses the new Expo project `58f0a11e-e3d9-4539-9549-69dd0fe8cc35` under `jjohnson5253`. The previous project remains under `jakesessiongalaxys-team`; this is a replacement build-service project, not a transfer of its history. The Apple bundle ID `com.forreallabs.dailycrossword`, Apple team, and App Store app `6826699052` are unchanged. Existing distribution credentials were reused with a new provisioning profile for this bundle.

Build 8 is a normal EAS production build. Build 7 was reserved during credentials setup but never uploaded. See `release-status.json` for the current build and Apple submission state. This app still requires native releases; OTA updates have not been enabled.

Build 8 finished successfully, passed strict signature verification, and was accepted by Apple as `VALID`. Its exact production Hermes bundle was also checked in the existing compatible simulator binary. It is available to the existing internal TestFlight group. The old build 6 review was withdrawn, both newspaper-grid feature screenshots were uploaded and verified `COMPLETE`, and build 8 was submitted to App Review with automatic release after approval.

# Build 9 — Poop Games

The app now opens to a three-game dashboard: Crossword (existing saves preserved), Word Guess Daily (six guesses and locally saved daily progress), and Galactic Raiders (original arcade artwork, waves, lives, pause, and high score). New black-and-white toilet/phone branding and eight native-capture store panels replace the crossword-only listing assets. The exact requested description is saved on Apple.

Normal EAS production build `fa8c9d0b-7dc5-45ac-814b-33ea3827cf48` completed and passed strict recursive signature verification. Apple accepted build 9 as VALID; the existing internal TestFlight group can test it. Source was pushed to main at `ab1e534`; GitHub CI passed. Support/privacy is live at https://for-real-labs.github.io/poop-games/.

The previous App Review submission was withdrawn for replacement. Apple rejected the exact store title “Poop Games” because another account owns it. The installed name is Poop Games, but the store title remains Crossword: No Ads until Jake chooses an alternative. Build 9 is selected with AFTER_APPROVAL release; the replacement has NOT been submitted and is NOT live. All eight screenshots are COMPLETE and ordered. Finish by setting an available user-approved store name, then submitting the selected version to App Review. See release-status.json and poop-games-validation.json.

# Build 11 — shared theme and continuous store wallpaper

Apple accepted the user-selected store title **Poop on your Phone**. The installed app remains **Poop Games**. All three games now share the blue/raspberry/plum palette in `src/theme.ts`; the former Wordle-like and separate crossword/arcade colors are removed. Each store image set is sliced from one continuous generated wallpaper and composed with current native captures. Eight images reached COMPLETE, and edge-pixel tests verify continuity.

Standard EAS build `17d110fa-db1b-408d-914f-56463fd99bfc`, build number 11, uses committed app source `0141905`. Artwork is committed at `61e46c2`. Build 10 was superseded by the user’s shared-theme request and was not submitted to Apple. Build 11 passed recursive signature verification and Apple processing as VALID. Its exact production bundle was checked in the compatible simulator app, including retained word guesses. All 42 game tests, two Python tests, three store-export tests, type checking, and GitHub CI pass.

Build 11 was submitted on October 31, 2026 at 17:25:20 UTC. Apple reports WAITING_FOR_REVIEW with AFTER_APPROVAL automatic release. The title conflict is resolved. This is submitted, not yet publicly live. Review submission: `24d338a4-cd29-447b-848d-58f54d988439`. See release-status.json for verified IDs and hashes.

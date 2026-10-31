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

# Build 12 — exact installed display name

The installed name now matches the App Store title, **Poop on your Phone**. Both Expo `name` and the native `CFBundleDisplayName` are explicitly set. Expo config introspection and the signed archive confirm the exact string; there are no app-level localized name overrides. Bundle ID and existing app data remain unchanged.

The exact name was installed and visually inspected on an iPhone 16 Pro simulator running iOS 18.3. SpringBoard still truncates it. iOS controls icon-label sizing; the app has no supported font-size or label-width override. This release sets the requested name but does not claim the complete text will fit on every Home Screen.

Standard EAS build `f4ed4f0a-d7d1-4265-9b6f-e5ddd98dce24` uses source `49531c0` and build number 12. Strict signature verification, all 42 game tests, two Python tests, type checking, and GitHub CI passed. Apple reports VALID and IN_BETA_TESTING, with the existing tester enrolled in the assigned internal group.

Build 12 replaced build 11 in App Review on October 31, 2026 at 17:50:13 UTC. The verified state is WAITING_FOR_REVIEW, with AFTER_APPROVAL automatic public release. Review submission: `694b5f36-6199-434d-93ae-b327000184f4`. All work from this release is pushed to main; unrelated work in the separate development checkout is preserved.

# Build 15 — visible Home Screen spacing and title case

The canonical App Store/Expo name is **Poop on Your Phone**. Native `CFBundleDisplayName` uses U+2800 blank separators because iOS collapsed ordinary and typographic spaces when fitting the long icon label. `CFBundleSpokenName` retains ordinary spaces. The signed native archive contains these exact values; there are no localized name overrides.

On an isolated iPhone 16 Pro running iOS 18.3, the final production-icon simulator app retained visible gaps and the ordinary-space accessibility name. A normal-space Spotlight query also found a test app using the same separators. A 19-character narrow-letter control kept its ordinary spaces while an 11-character wide-letter control lost them, demonstrating that character count alone does not explain fitting. The full requested name still truncates; this release fixes visible separation, not the available label width. See `verification/home-screen-visible-spacing.png` and `home-screen-name-validation.json`.

Standard EAS production build `1336b706-9226-4c32-9c7b-1d023ffa1602`, build number 15, uses source `1ca0b85`. Config introspection, strict recursive signature verification, and GitHub CI passed. Existing Game Studio gameplay/backend validation remains recorded separately. Apple reports VALID and IN_BETA_TESTING, with access verified for the existing requested tester.

Build 15 replaced build 14 in App Review on October 31, 2026 at 18:35:07 UTC. The verified state is WAITING_FOR_REVIEW with AFTER_APPROVAL automatic release. The App Store title is also **Poop on Your Phone**. Review submission: `39033b43-c764-477e-b80d-c3d302696316`.

# Build 16 — shorter label with normal spaces

The installed Home Screen name is now **Poop on Phone**, with one ordinary U+0020 space between each word. Expo `name`, `CFBundleDisplayName`, and `CFBundleSpokenName` all contain that exact string. The U+2800 blank separators are removed. The App Store title is **Poop on Your Phone**.

An iPhone 16 Pro / iOS 18.3 simulator showed the full shorter label with regular spaces and no ellipsis after opening the app once. Before first launch, the blue recently-updated dot reduced the available room and the label compressed/truncated. This verifies the ordinary Home Screen appearance, not every TestFlight indicator or device setting. See `verification/home-screen-short-name.png`; build 15's validation is preserved in `releases/build-15-name-validation.json`.

Standard EAS build `3f5a2c70-e583-4d45-9eff-51882aba7b1f`, build number 16, uses source `c627b0f`. Native config introspection, signed archive name assertions, recursive signature verification, and GitHub CI passed. Apple reports VALID and IN_BETA_TESTING, with the existing tester's group access verified.

Build 16 replaced build 15 in App Review on October 31, 2026 at 20:09:09 UTC. Status is WAITING_FOR_REVIEW with AFTER_APPROVAL automatic release. Review submission: `ff6926c9-28bd-46ad-85d8-8849f8d7ba0f`.

# Build 17 — two ordinary spaces between words

The installed name is `Poop  on  Phone`, with exactly two ordinary U+0020 spaces between each word in Expo `name` and native `CFBundleDisplayName`. The spoken name remains naturally spaced. The App Store title remains **Poop on Your Phone**.

The iPhone 16 Pro / iOS 18.3 simulator displayed the full shorter label with visible word gaps after opening the app once. With the blue update dot present, iOS still compressed/truncated it. The operating system controls rendered spacing; this does not guarantee identical fitting on every device or with TestFlight indicators. See `verification/home-screen-double-spaces.png`.

Standard EAS build `3ef29510-3588-4957-9787-b6613a6bba5e`, build number 17, uses source `afe1b80`. Config introspection, exact signed-archive name assertions, strict recursive signature verification, and GitHub CI passed. The JavaScript bundle hash is unchanged from build 16. Apple reports VALID and IN_BETA_TESTING. The internal group has access to all builds, and existing tester access was verified.

Build 17 replaced build 16 in App Review on October 31, 2026 at 20:35:33 UTC. Status is WAITING_FOR_REVIEW with AFTER_APPROVAL automatic release. Review submission: `96cf77ae-60c5-46df-9d5e-22e3d521f29d`. Build 16's release and name-validation records are preserved under `releases/`.

# Build 18 — three ordinary spaces between words

The installed name is `Poop   on   Phone`, with exactly three ordinary U+0020 spaces between each word in Expo `name` and native `CFBundleDisplayName`. The spoken name remains naturally spaced. The App Store title remains **Poop on Your Phone**. Build 17's signed archive was rechecked and confirmed to contain exactly two ordinary spaces between each word.

The iPhone 16 Pro / iOS 18.3 simulator displayed the full shorter label after opening the app once. Three configured spaces still render as compact gaps. With the blue update dot present, iOS compressed/truncated it. This change sets the exact requested spacing without claiming that iOS will display three full-width spaces. See `verification/home-screen-three-spaces.png`.

Standard EAS build `deecdc60-0107-4ade-a252-d074ace025b7`, build number 18, uses source `1e9f7c5`. Config introspection, exact signed-archive name assertions, strict recursive signature verification, and GitHub CI passed. The JavaScript bundle hash is unchanged from build 17. Apple reports VALID and IN_BETA_TESTING. The internal group has access to all builds, and existing tester access was verified.

Build 18 replaced build 17 in App Review on October 31, 2026 at 20:52:47 UTC. Status is WAITING_FOR_REVIEW with AFTER_APPROVAL automatic release. Review submission: `8e285eed-3421-4a25-a8d7-52046abc3663`. Build 17's release and name-validation records are preserved under `releases/`.

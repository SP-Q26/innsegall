# Scary moments audit · October 14, 2026

Five **real search patterns** (Apple Community, Malwarebytes, NCSC-adjacent advisories, r/applehelp themes) mapped to **calm field guides** and **how Battle Scout shines a light**.

| What people search | What is usually true | Fix order | Innsegall light |
| --- | --- | --- | --- |
| Screen Sharing on without me knowing | Sharing toggle or MDM · sometimes internet-exposed 5900 in advisories | Settings → Sharing · patch · disable if unused | Read-only **listening services** + remote-management hints in Battle Scout |
| Keychain password keeps popping up | Login password change vs fake browser “keychain” | Real Keychain Access vs force-quit browser trap | Scout lists **login items / profiles** after scare |
| Full-screen “Mac infected” in browser | **The page is the scam** | Force quit · Shift-reopen Safari · do not call | Scout answers “anything on disk?” not “is tab scary?” |
| Apple ID locked in browser | Phishing page · not System Settings | New tab → appleid.apple.com · rotate if typed | Scout receipt if a “fix” was downloaded |
| Green camera / orange mic dot | Named app in Control Center | Quit app · revoke Camera/Mic permissions | Listeners + persistence context in scout |

## New field guides (batch 5)

- `/blog/mac-screen-sharing-on-without-permission`
- `/blog/mac-keychain-password-popup-loop-scam`
- `/blog/mac-browser-full-screen-virus-locker`
- `/blog/mac-apple-id-locked-browser-scam`
- `/blog/mac-camera-microphone-light-worry`

## Updated field reports (shine-a-light boosts)

Boost version `2026-10-14` on:

- `fake-virus-popup-macintosh`
- `someone-remoted-into-my-mac`
- `apple-support-call-popup-scam-mac`
- `clicked-suspicious-link-macintosh`
- `safari-shift-key-scam-popup-mac`

## Product copy

Customer SKU: **Extra scout** ($4.20) · not “panic scout”. You pay to **end not-knowing**, not to buy fear.

Regenerate: `npm run build:scary-moments-batch-5` · `npm run sweep:blog` · `npm run sync-gospel`.

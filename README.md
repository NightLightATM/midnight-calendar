<div align="center">

# 🌙 Midnight Calendar

**A self-hosted reminder app that won't let go until you tick the task off.**

One-time, weekly, monthly, and yearly reminders · sticky notifications · installable on Android ·
your data stored in *your own* Google Drive.

No server. No build step. No account except your own Google. Just static files on GitHub Pages.

**Live:** https://nightlightatm.github.io/midnight-calendar/

</div>

---

## What it does

Midnight Calendar is a Progressive Web App (PWA) for the reminders that actually recur in life -
not just one-off appointments, but the *every Monday*, *first of the month*, *every June 14th* kind.

- **Four reminder types**
  - **Once** - a specific date & time (appointments, deadlines)
  - **Weekly** - a day of the week (a workout split, trash night)
  - **Monthly** - a day of the month, auto-clamped to the last day in short months (rent, water filter)
  - **Yearly** - a month & day (birthdays, anniversaries, renewals)
- **Three views** - a **Today** list you tick off, a **Calendar** month grid with color-coded dots, and a **Manage** list grouped by type.
- **Timezone-aware** - everything is computed in your device's own local timezone.
- **Sticky notifications** - when a task is due you get a notification that stays put and keeps nudging every few minutes until you open the app and tick it off.
- **Installable** - add it to your Android home screen and it runs full-screen like a native app.
- **Yours to keep** - reminders live on your device, and optionally sync through a single private file in *your* Google Drive.
- **Midnight aesthetic** - a dark starlit theme by default, with a light "dawn" theme and a toggle. Fully offline once loaded.

---

## Screenshots

> _Add a couple of screenshots here after it's deployed - the Today view (dark) and the Calendar view read really well._

---

## How it works

| Concern | Approach |
|---|---|
| **Hosting** | 100% static - HTML/CSS/JS + icons. Served free from GitHub Pages over HTTPS (required for PWAs). |
| **Installability** | `manifest.json` + a service worker (`sw.js`) that caches the app shell for offline use. |
| **On-device storage** | Reminders are saved in the browser (`localStorage`) - instant and works offline. |
| **Cross-device sync** | Optional. Uses Google's browser-only sign-in (no backend) to read/write one file, `midnight-calendar.json`, in your Drive. Scope is `drive.file`, so the app can *only* see that one file - nothing else in your Drive. Merge is last-edit-wins per reminder; deletions sync as tombstones. |
| **Notifications** | The page (and service worker) fire `requireInteraction` notifications for due, unticked tasks and re-nudge on a throttle, clearing them when you tick the task off. |

---

## Setup

### 1. Host it on GitHub Pages (free)

Push these files to a repo (see the commands below), then in the repo:
**Settings → Pages → Source: Deploy from a branch → `main` / `/(root)` → Save.**
Live in ~1 minute at `https://nightlightatm.github.io/<repo-name>/`.

```bash
cd path/to/midnight-calendar        # folder containing index.html
git init
git branch -M main
git add .
git commit -m "Midnight Calendar PWA"
git remote add origin https://github.com/NightLightATM/midnight-calendar.git
git push -u origin main
```

### 2. Install on Android

Open the live URL in Chrome → **Install app** (or menu ⋮ → **Add to Home screen**) → open it → tap 🔔 → **Allow** notifications.

### 3. Enable Google Drive sync (optional)

You create a free Google OAuth Client ID once (~3 minutes, no billing):

1. **console.cloud.google.com** → create a project.
2. **APIs & Services → Library** → enable **Google Drive API**.
3. **OAuth consent screen** → *External* → add your own email as a **Test user**.
4. **Credentials → Create OAuth client ID → Web application.** Under **Authorized JavaScript origins** add:
   ```
   https://nightlightatm.github.io
   ```
   (origin only - no path, no trailing slash)
5. Copy the Client ID, open the app → ⚙️ settings → paste it → **Connect Google Drive**.

Paste the same Client ID on each device to keep them in sync.

---

## Project structure

```
index.html            the entire app (markup, styles, logic)
sw.js                 service worker - offline cache + notifications
manifest.json         PWA manifest
icon-192.png          app icons
icon-512.png
icon-maskable.png
apple-touch-icon.png
favicon.png
```

---

## Limitations

Notifications are driven by the app itself, so they're reliable while it's **open or running in the
background**. When the app is **fully force-closed**, a static site can only rely on the browser's
*Periodic Background Sync*, which the OS schedules on its own (roughly a few times a day, not to the
minute) - so a closed-app reminder can be late.

For exact-time delivery even when the app is closed, a small **push server** is needed to send a Web
Push at the scheduled moment. The service worker already includes a `push` handler for this; a free
**GitHub Action** or **Cloudflare Worker** cron with the [`web-push`](https://github.com/web-push-libs/web-push)
library (VAPID keys) can drive it. _(Not included yet.)_

---

## Updating

Change a file and push again. If you edit anything that's cached, bump the cache version in `sw.js`
(`const CACHE = "midnight-cal-v1"` → `-v2`) so installed devices pick up the new version.

---

## Tech

Vanilla HTML/CSS/JavaScript - no framework, no dependencies except Google Fonts (Fraunces + Manrope)
and Google's sign-in script (loaded only if you enable Drive sync). Service Worker API, Web
Notifications, Google Identity Services + Drive REST v3.

## License

MIT - do whatever you like with it.

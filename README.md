# Fast Language Switcher

**Version:** 17.0.1.1.0
**License:** LGPL-3
**Category:** Technical
**Compatibility:** Odoo 17.0

---

## Overview

**Fast Language Switcher** adds a one-click and one-shortcut way to switch your UI language without navigating through Preferences. It sits right in the top navigation bar and works from anywhere in the backend.

---

## Features

### 1. Language Flag in the Navbar
A flag icon appears in the systray (top-right navigation bar, next to the company switcher and chat). It shows:
- The country flag of the currently active language.
- A short language code (e.g. `EN`, `KA`, `FR`).

### 2. Dropdown Language Picker
Clicking the flag opens a dropdown listing **all installed (active) languages** with:
- Country flag image.
- Full language name.
- A checkmark on the currently selected language.

Click any language to switch to it instantly. The page reloads once the language preference is saved.

### 3. Keyboard Shortcut Overlay (macOS-style)
Pressing the configured shortcut (default **Ctrl+L**) opens a floating dark overlay panel inspired by the macOS input source switcher:

- All installed languages are listed with flags and names.
- The **next** language in alphabetical order is pre-highlighted.
- Each subsequent press of the shortcut cycles to the next language.
- After **1.5 seconds** of inactivity the highlighted language is applied automatically.
- **Click** any language to apply it immediately.
- Press **Esc** to close the overlay without changing language.

---

## Installation

1. Copy the `fast_language_switcher` folder into your Odoo addons path (e.g. `my_modules/`).
2. Make sure the path is listed in `addons_path` in your `odoo.conf`.
3. Restart the Odoo server.
4. Go to **Apps**, click **Update App List**, then search for **Fast Language Switcher** and install it.

> **Note:** At least two languages must be installed for switching to be useful.
> Install additional languages via **Settings → Translations → Languages**.

---

## Configuration

The keyboard shortcut is configurable per Odoo instance:

1. Go to **Settings → General Settings**.
2. Scroll to the **Language Switcher** section.
3. Click **Record** next to the *Language Switcher Shortcut* field.
4. Press your desired key combination (e.g. `Ctrl+Shift+L`, `Alt+L`).
5. Click **Save**.

The new shortcut takes effect immediately on the next page load.

### Shortcut format

Shortcuts are stored as a `+`-separated lowercase string:

| Stored value   | Keys                |
|----------------|---------------------|
| `ctrl+l`       | Ctrl + L (default)  |
| `ctrl+shift+l` | Ctrl + Shift + L    |
| `alt+l`        | Alt + L             |
| `meta+l`       | ⌘ + L (Mac) / Win + L |

> **Note for macOS users:** The `ctrl` modifier maps to the physical **Control** key (not Command). If you prefer Command+L, record `meta+l` as the shortcut.

---

## How It Works (Technical)

| Component | Description |
|-----------|-------------|
| `LanguageSwitcher` | OWL component registered in the `systray` registry. Renders the flag button and dropdown. Reads `res.lang` via ORM on startup. Writes `res.users.lang` on selection. |
| `LanguageSwitcherDialog` | Always-mounted OWL component (also in `systray`). Attaches a capture-phase `keydown` listener on `document`. Loads the configured shortcut from `ir.config_parameter` on startup. Shows/hides the overlay. |
| `ShortcutInputField` | Custom OWL field widget (`widget="shortcut_input"`) used on the settings form. Captures raw keyboard events and converts them to a normalised shortcut string. |
| `res.config.settings` | Inherits the transient model to add `fast_language_switcher_shortcut` (stored in `ir.config_parameter` under key `fast_language_switcher.shortcut`). |

### Language data source
Languages are fetched via `res.lang.search_read` filtered by `active = True`. Flag images are served by Odoo's built-in `flag_image_url` computed field (`/base/static/img/country_flags/<code>.png`).

### Language switch mechanism
Language is changed by writing to `res.users` (`{lang: code}`) for the current user ID, followed by a full page reload so all translations refresh.

---

## Compatibility Notes

- **Ctrl+L** is the browser shortcut to focus the address bar. This module intercepts it in the **capture phase** (`addEventListener(..., true)`) and calls `preventDefault()` so the browser shortcut is suppressed while the Odoo backend is open.
- If you experience conflicts with other browser extensions, choose an alternative shortcut (e.g. `ctrl+shift+l`).

---

## Changelog

### 17.0.1.1.0
- Added configurable keyboard shortcut via General Settings.
- Added `ShortcutInputField` widget for visual shortcut recording.
- Dialog now reads configured shortcut from `ir.config_parameter` at startup.

### 17.0.1.0.0
- Initial release.
- Systray flag button with dropdown.
- macOS-style overlay with Ctrl+L (hardcoded).

---

## Support

For bugs or feature requests, open an issue in the repository where you obtained this module.

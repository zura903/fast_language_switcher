# Fast Language Switcher

**Version:** 1.1.0
**Odoo Compatibility:** 17.0, 18.0, 19.0
**License:** LGPL-3
**Category:** Tools

---

## Overview

Fast Language Switcher adds a flag-based language picker to the Odoo top navigation bar. Users can switch their interface language with a single click **or** a fully configurable keyboard shortcut — no page navigation required.

---

## Features

| Feature | Description |
|---|---|
| **Flag icon in systray** | Shows the active language flag and short code next to the user avatar |
| **Click dropdown** | Click the flag to open a clean dropdown of all installed languages |
| **Keyboard shortcut overlay** | Press the shortcut (default `Ctrl+L`) to open a macOS-style floating picker |
| **Configurable shortcut** | Set any `modifier + key` combination in General Settings |
| **Cycle with keyboard** | Each shortcut press cycles to the next language; releasing the modifier applies it |

---

## Installation

1. Copy the `fast_language_switcher` folder into your Odoo `addons` path (or a custom addons path configured in `odoo.conf`).
2. Restart the Odoo server.
3. Go to **Settings → Apps**, search for **Fast Language Switcher**, and click **Install**.

> **Requirement:** At least two languages must be installed in Odoo (`Settings → Translations → Languages`) for switching to be useful.

---

## Configuration

### Changing the keyboard shortcut

1. Open **Settings → General Settings**.
2. Scroll down to (or search for) the **Fast Language Switcher** section.
3. Next to **Keyboard Shortcut**, click **Change**.
4. Press the desired key combination (e.g. `Ctrl+Shift+L`, `Alt+L`).
   The combination is captured automatically — no typing required.
5. Click **Save**.

**Rules for shortcuts:**
- Must include at least one modifier key: `Ctrl`, `Alt`, `Meta` (⌘ on Mac), or `Shift`.
- One non-modifier key is required (letters, digits, function keys, etc.).
- The shortcut is stored as a lowercase `+`-separated string, e.g. `ctrl+l`.

**Default shortcut:** `Ctrl+L`

---

## Usage

### Click (Dropdown)

1. Click the flag/language icon in the top-right systray.
2. A dropdown lists all active languages.
3. Click any language to switch immediately.

### Keyboard shortcut (Overlay)

1. Press the configured shortcut (default `Ctrl+L`).
   A floating overlay appears with all languages listed.
2. **Cycle:** Press the shortcut again to move the highlight to the next language.
3. **Apply:** Release the modifier key (e.g. let go of `Ctrl`) to switch to the highlighted language.
4. **Quick select:** Click any language in the overlay to switch instantly.
5. **Cancel:** Press `Esc` or click the backdrop to close without switching.

The hint bar at the bottom of the overlay always shows the currently configured shortcut.

---

## Technical Details

### Module structure

```
fast_language_switcher/
├── __init__.py
├── __manifest__.py
├── models/
│   ├── __init__.py
│   └── res_config_settings.py      # Extends res.config.settings with fls_shortcut field
├── views/
│   └── res_config_settings_views.xml   # Adds shortcut field to General Settings
└── static/src/
    ├── shortcut_widget/
    │   ├── shortcut_widget.js      # Owl field widget for capturing key combos
    │   └── shortcut_widget.xml     # Widget template
    └── language_switcher/
        ├── language_switcher.js    # Main systray Owl component
        ├── language_switcher.xml   # Component template
        └── language_switcher.scss  # Styles (frosted-glass wizard, dropdown)
```

### Settings storage

The shortcut is stored as a system parameter:

| Key | Default |
|---|---|
| `fast_language_switcher.shortcut` | `ctrl+l` |

Accessible via `Settings → Technical → System Parameters` or the `ir.config_parameter` model.

### Language data source

Active languages are loaded from `res.lang` (filtered by `active = True`, ordered by name).
The current user's language is read from `res.users.lang` and written back on switch.

### Dependencies

| Module | Reason |
|---|---|
| `web` | Owl component system, systray registry, ORM service |
| `base_setup` | General Settings form view (to inject the shortcut configuration block) |

---

## Frequently Asked Questions

**Q: The shortcut conflicts with my browser's shortcut.**
A: Change it in General Settings to a combination your browser doesn't use (e.g. `Ctrl+Shift+L` or `Alt+L`).

**Q: The overlay shows the wrong shortcut hint.**
A: After changing the shortcut in Settings, do a hard reload (`Ctrl+Shift+R` / `Cmd+Shift+R`) to clear the asset cache.

**Q: Only one language appears in the list.**
A: Install additional languages via **Settings → Translations → Activate a Language** (Odoo 16+) or **Settings → Translations → Languages**.

**Q: The flag shows 🌐 instead of a proper flag.**
A: The module derives flags from the ISO territory code in the language code (e.g. `fr_FR` → 🇫🇷). Languages with only a two-letter language code and no territory (e.g. `en`) fall back to the globe emoji.

---

## Changelog

### 19.0.1.0.1
- Added configurable keyboard shortcut via General Settings (`res.config.settings`).
- Added `fls_shortcut_input` Owl field widget for capturing key combinations.
- Shortcut hint in the overlay and dropdown footer now reflects the configured shortcut dynamically.
- Generalised modifier-release detection to support non-Ctrl shortcuts.

### 19.0.1.0.0
- Initial release.
- Flag icon in systray with click dropdown.
- `Ctrl+L` keyboard shortcut with cycling overlay.

---

## License

This module is licensed under the [LGPL-3 license](https://www.gnu.org/licenses/lgpl-3.0.html).

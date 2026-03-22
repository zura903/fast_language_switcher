# Fast Language Switcher

**Odoo 18** module — Quick language switcher with emoji flags and a configurable keyboard shortcut.

## Features

- **Flag icon in systray** — shows the active language at a glance
- **Click dropdown** — pick any installed language from a clean list
- **Keyboard shortcut** (default `Ctrl+L`) — opens a macOS-style floating picker; cycle languages, release the modifier to apply
- **Configurable shortcut** — set any key combination in General Settings
- **Responsive** — language code label hides on small screens

## Installation

1. Copy `fast_language_switcher/` into your Odoo addons directory.
2. Restart the Odoo server.
3. Go to **Apps**, search for *Fast Language Switcher*, and install it.
4. Make sure at least two languages are active under **Settings → Translations → Languages**.

## Configuration

Go to **Settings → General Settings → Fast Language Switcher**.

| Setting | Default | Description |
|---|---|---|
| Language Switcher Shortcut | `Ctrl+L` | Click the field and press a new key combination to record a custom shortcut. |

Supported modifiers: `Ctrl`, `Alt`, `Shift`, `Meta`.
Examples: `ctrl+l`, `ctrl+shift+l`, `alt+l`.

## Usage

### Click-based
1. Click the flag icon in the top navigation bar.
2. Select a language — page reloads with that language applied.

### Keyboard shortcut (default `Ctrl+L`)
1. Press `Ctrl+L` — floating picker opens with the next language pre-selected.
2. Press again to cycle further.
3. **Release `Ctrl`** to apply, or **click** a language in the list.
4. Press `Esc` to cancel.

## Keyboard Reference

| Key | Action |
|---|---|
| Shortcut (default `Ctrl+L`) | Open picker / cycle to next language |
| Release modifier (`Ctrl`) | Apply highlighted language |
| `Esc` | Close without switching |
| Click language in picker | Switch immediately |

## Compatibility

- Odoo: **18.0**
- License: **LGPL-3**

## Module Structure

```
fast_language_switcher/
├── __manifest__.py
├── __init__.py
├── models/
│   ├── __init__.py
│   └── res_config_settings.py        # Shortcut setting field
├── views/
│   └── res_config_settings_views.xml # General Settings section
└── static/src/
    ├── keyboard_shortcut_input/       # Custom field widget for recording shortcuts
    │   ├── keyboard_shortcut_input.js
    │   ├── keyboard_shortcut_input.xml
    │   └── keyboard_shortcut_input.scss
    └── language_switcher/             # Systray component
        ├── language_switcher.js
        ├── language_switcher.xml
        └── language_switcher.scss
```

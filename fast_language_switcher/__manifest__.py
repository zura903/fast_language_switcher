{
    "name": "Fast Language Switcher",
    "version": "18.0.1.1.0",
    "category": "Tools",
    "summary": "Quick language switcher with flag icons and configurable keyboard shortcut",
    "description": """
        Adds a language switcher to the main header systray.

        Features:
        - Flag icon showing the current active language
        - Click the flag to open a dropdown listing all installed languages
        - Press the configured shortcut (default: Ctrl+L) to open a macOS-style floating language picker
          * Each additional shortcut press cycles to the next language
          * Releasing the modifier key applies the selection automatically
          * Or click any language in the panel to switch instantly
        - Configurable keyboard shortcut in General Settings (Settings → General Settings → Fast Language Switcher)
    """,
    "author": "Zura Mukbaniani",
    "depends": ["web"],
    "data": [
        "views/res_config_settings_views.xml",
    ],
    'images': ['static/description/banner.png'],
    "assets": {
        "web.assets_backend": [
            # Keyboard shortcut input widget (used in settings)
            "fast_language_switcher/static/src/keyboard_shortcut_input/keyboard_shortcut_input.js",
            "fast_language_switcher/static/src/keyboard_shortcut_input/keyboard_shortcut_input.xml",
            "fast_language_switcher/static/src/keyboard_shortcut_input/keyboard_shortcut_input.scss",
            # Systray language switcher
            "fast_language_switcher/static/src/language_switcher/language_switcher.js",
            "fast_language_switcher/static/src/language_switcher/language_switcher.xml",
            "fast_language_switcher/static/src/language_switcher/language_switcher.scss",
        ],
    },
    "installable": True,
    "application": False,
    "auto_install": False,
    "license": "LGPL-3",
}

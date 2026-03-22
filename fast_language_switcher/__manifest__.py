{
    "name": "Fast Language Switcher",
    "version": "19.0.1.0.1",
    "category": "Tools",
    "summary": "Quick language switcher with flag icons and a configurable keyboard shortcut",
    "description": """
        Adds a language switcher to the main header systray.

        Features:
        - Flag icon showing the current active language
        - Click the flag to open a dropdown listing all installed languages
        - Press the configured shortcut (default Ctrl+L) to open a floating language picker
          * Each additional press cycles to the next language
          * Releasing the modifier key applies the selection automatically
          * Or click any language in the panel to switch instantly
        - Configure the shortcut in Settings → General Settings → Fast Language Switcher
    """,
    "author": "Custom",
    "depends": ["web", "base_setup"],
    "data": [
        "views/res_config_settings_views.xml",
    ],
    'images': ['static/description/banner.png'],
    "assets": {
        "web.assets_backend": [
            "fast_language_switcher/static/src/shortcut_widget/shortcut_widget.js",
            "fast_language_switcher/static/src/shortcut_widget/shortcut_widget.xml",
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

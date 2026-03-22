from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    language_switcher_shortcut = fields.Char(
        string="Language Switcher Shortcut",
        default="ctrl+l",
        config_parameter="fast_language_switcher.shortcut",
        help=(
            "Keyboard shortcut to open the floating language picker. "
            "Use modifier keys separated by '+', e.g. ctrl+l, ctrl+shift+l, alt+l. "
            "Default: ctrl+l"
        ),
    )

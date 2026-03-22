from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    fls_shortcut = fields.Char(
        string="Language Switcher Shortcut",
        config_parameter="fast_language_switcher.shortcut",
        default="ctrl+l",
        help="Keyboard shortcut to open the language switcher (e.g. ctrl+l, alt+l, ctrl+shift+l).",
    )

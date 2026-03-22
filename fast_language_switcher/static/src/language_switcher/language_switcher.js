/** @odoo-module **/

import { Component, useState, onWillStart, onMounted, onWillUnmount } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { Dropdown } from "@web/core/dropdown/dropdown";
import { DropdownItem } from "@web/core/dropdown/dropdown_item";
import { DropdownGroup } from "@web/core/dropdown/dropdown_group";
import { user } from "@web/core/user";
import { browser } from "@web/core/browser/browser";
import { jsToPyLocale } from "@web/core/l10n/utils/locales";

/**
 * Convert a language code (e.g. "en_US", "fr_FR") to a Unicode flag emoji.
 * Uses Unicode Regional Indicator Symbol Letters (U+1F1E6–U+1F1FF).
 *
 * Special cases:
 *  - "en" without region → 🌐 (globe)
 *  - languages with no recognisable 2-letter country suffix → 🌐
 */
function langCodeToFlag(code) {
    if (!code) return "🌐";
    // code is in Python XPG format: language[_TERRITORY][@modifier]
    // Strip any codeset/modifier and grab the territory part.
    const clean = code.split("@")[0]; // "en_US", "fr_BE", "sr_RS"
    const parts = clean.split("_");
    const territory = parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "";
    if (!territory || territory.length !== 2 || !/^[A-Z]{2}$/.test(territory)) {
        // Fall back: try using the language itself as a pseudo-country (e.g. "EN" for "en")
        const lang = parts[0].toUpperCase().slice(0, 2);
        if (lang.length === 2 && /^[A-Z]{2}$/.test(lang)) {
            return _toFlagEmoji(lang);
        }
        return "🌐";
    }
    return _toFlagEmoji(territory);
}

function _toFlagEmoji(cc) {
    // Regional Indicator A starts at U+1F1E6 = 0x1F1E6, 'A' = 65
    return String.fromCodePoint(
        0x1F1E6 + cc.charCodeAt(0) - 65,
        0x1F1E6 + cc.charCodeAt(1) - 65
    );
}

/** Return the short language tag shown beside the flag, e.g. "EN", "FR" */
function langCodeToShortLabel(code) {
    if (!code) return "";
    return code.split("_")[0].toUpperCase();
}

/**
 * Parse a raw shortcut string (e.g. "ctrl+l") into a structured object.
 * Defaults to Ctrl+L if the string is empty or unparseable.
 */
function parseShortcut(raw) {
    const parts = (raw || "ctrl+l").toLowerCase().split("+");
    const modifiers = new Set(["ctrl", "alt", "meta", "shift"]);
    const key = parts.find((p) => !modifiers.has(p)) || "l";
    return {
        ctrlKey:  parts.includes("ctrl"),
        altKey:   parts.includes("alt"),
        metaKey:  parts.includes("meta"),
        shiftKey: parts.includes("shift"),
        key,
    };
}

/**
 * Given a parsed shortcut, return the DOM key name of the primary modifier
 * to listen for on keyup (e.g. "Control", "Alt").
 */
function primaryModifierKey(parsed) {
    if (parsed.ctrlKey)  return "Control";
    if (parsed.altKey)   return "Alt";
    if (parsed.metaKey)  return "Meta";
    if (parsed.shiftKey) return "Shift";
    return null;
}

/** Format a raw shortcut string into display parts, e.g. ["Ctrl", "L"] */
function shortcutDisplayParts(raw) {
    return (raw || "ctrl+l").split("+").map((p) => p.charAt(0).toUpperCase() + p.slice(1));
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export class LanguageSwitcher extends Component {
    static template = "fast_language_switcher.LanguageSwitcher";
    static components = { Dropdown, DropdownItem, DropdownGroup };
    static props = {};

    setup() {
        this.orm = useService("orm");

        this.state = useState({
            languages: [],       // [{id, code, name, flag, shortLabel}]
            currentCode: "",     // Python-format code of the active language
            showWizard: false,
            wizardIndex: 0,      // index of highlighted language in wizard
        });

        // Shortcut – initialised to the default; updated from ir.config_parameter
        this._shortcutRaw = "ctrl+l";
        this._shortcut    = parseShortcut("ctrl+l");

        onWillStart(async () => {
            await Promise.all([
                this._loadLanguages(),
                this._loadShortcut(),
            ]);
        });

        onMounted(() => {
            this._onKeyDown = this._handleKeyDown.bind(this);
            this._onKeyUp   = this._handleKeyUp.bind(this);
            document.addEventListener("keydown", this._onKeyDown, true);
            document.addEventListener("keyup",   this._onKeyUp,   true);
        });

        onWillUnmount(() => {
            document.removeEventListener("keydown", this._onKeyDown, true);
            document.removeEventListener("keyup",   this._onKeyUp,   true);
        });
    }

    // -----------------------------------------------------------------------
    // Data loading
    // -----------------------------------------------------------------------

    async _loadLanguages() {
        const rawLangs = await this.orm.searchRead(
            "res.lang",
            [["active", "=", true]],
            ["code", "name"],
            { order: "name asc" }
        );

        this.state.languages = rawLangs.map((l) => ({
            ...l,
            flag: langCodeToFlag(l.code),
            shortLabel: langCodeToShortLabel(l.code),
        }));

        // user.lang is in JS locale format (e.g. "en-US"); convert to Python
        this.state.currentCode = jsToPyLocale(user.lang) || this.state.languages[0]?.code || "";
        this._syncWizardIndex();
    }

    async _loadShortcut() {
        try {
            const value = await this.orm.call(
                "ir.config_parameter",
                "get_param",
                ["fast_language_switcher.shortcut", "ctrl+l"]
            );
            this._shortcutRaw = value || "ctrl+l";
            this._shortcut    = parseShortcut(this._shortcutRaw);
        } catch {
            // Keep the default if the RPC fails (e.g. public user)
        }
    }

    _syncWizardIndex() {
        const idx = this.state.languages.findIndex((l) => l.code === this.state.currentCode);
        this.state.wizardIndex = idx >= 0 ? idx : 0;
    }

    // -----------------------------------------------------------------------
    // Keyboard handling
    // -----------------------------------------------------------------------

    _handleKeyDown(ev) {
        const s = this._shortcut;

        // Match the configured shortcut
        const modifiersMatch =
            ev.ctrlKey  === s.ctrlKey  &&
            ev.altKey   === s.altKey   &&
            ev.metaKey  === s.metaKey  &&
            ev.shiftKey === s.shiftKey;

        if (modifiersMatch && ev.key.toLowerCase() === s.key && !ev.repeat) {
            ev.preventDefault();
            ev.stopPropagation();

            const langs = this.state.languages;
            if (!langs.length) return;

            if (!this.state.showWizard) {
                // First press: open wizard and pre-select the NEXT language
                const currentIdx = langs.findIndex((l) => l.code === this.state.currentCode);
                this.state.wizardIndex = (currentIdx + 1) % langs.length;
                this.state.showWizard = true;
            } else {
                // Subsequent presses: keep cycling forward
                this.state.wizardIndex = (this.state.wizardIndex + 1) % langs.length;
            }
        } else if (ev.key === "Escape" && this.state.showWizard) {
            // Cancel without switching
            this.state.showWizard = false;
        }
    }

    _handleKeyUp(ev) {
        // When the primary modifier of the shortcut is released while the wizard
        // is open → apply the currently highlighted selection.
        const releaseKey = primaryModifierKey(this._shortcut);
        if (releaseKey && ev.key === releaseKey && this.state.showWizard) {
            const selected = this.state.languages[this.state.wizardIndex];
            this.state.showWizard = false;
            if (selected && selected.code !== this.state.currentCode) {
                this._applyLanguage(selected.code);
            }
        }
    }

    // -----------------------------------------------------------------------
    // Language switching
    // -----------------------------------------------------------------------

    async _applyLanguage(langCode) {
        await this.orm.write("res.users", [user.userId], { lang: langCode });
        browser.location.reload();
    }

    // -----------------------------------------------------------------------
    // Event handlers called from the template
    // -----------------------------------------------------------------------

    onDropdownSelect(lang) {
        if (lang.code === this.state.currentCode) return;
        this._applyLanguage(lang.code);
    }

    onWizardItemClick(lang) {
        this.state.showWizard = false;
        if (lang.code !== this.state.currentCode) {
            this._applyLanguage(lang.code);
        }
    }

    onWizardBackdropClick() {
        this.state.showWizard = false;
    }

    // -----------------------------------------------------------------------
    // Computed helpers used in the template
    // -----------------------------------------------------------------------

    get currentLang() {
        return (
            this.state.languages.find((l) => l.code === this.state.currentCode) ||
            this.state.languages[0] ||
            null
        );
    }

    /** Display parts for the configured shortcut, e.g. ["Ctrl", "L"] */
    get shortcutParts() {
        return shortcutDisplayParts(this._shortcutRaw);
    }

    /** Label for the modifier key shown in "Release X to apply" hint */
    get releaseModifierLabel() {
        const s = this._shortcut;
        if (s.ctrlKey)  return "Ctrl";
        if (s.altKey)   return "Alt";
        if (s.metaKey)  return "⌘";
        if (s.shiftKey) return "Shift";
        return "";
    }
}

registry.category("systray").add(
    "fast_language_switcher.language_switcher",
    { Component: LanguageSwitcher },
    { sequence: 1 }   // right after the user avatar (sequence 0)
);

/** @odoo-module **/

import { Component, useState, onWillStart, onMounted, onWillUnmount } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { Dropdown } from "@web/core/dropdown/dropdown";
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
 * Parse a shortcut string (e.g. "ctrl+l") into display labels (e.g. ["Ctrl", "L"]).
 */
function parseShortcutParts(shortcut) {
    return (shortcut || "ctrl+l").split("+").map((p) => {
        const part = p.trim().toLowerCase();
        if (part === "ctrl") return "Ctrl";
        if (part === "alt") return "Alt";
        if (part === "shift") return "Shift";
        if (part === "meta") return "Meta";
        return p.trim().toUpperCase();
    });
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export class LanguageSwitcher extends Component {
    static template = "fast_language_switcher.LanguageSwitcher";
    static components = { Dropdown, DropdownGroup };
    static props = {};

    setup() {
        this.orm = useService("orm");

        this.state = useState({
            languages: [],       // [{id, code, name, flag, shortLabel}]
            currentCode: "",     // Python-format code of the active language
            showWizard: false,
            wizardIndex: 0,      // index of highlighted language in wizard
            shortcut: "ctrl+l",  // canonical shortcut string from settings
        });

        onWillStart(async () => {
            await Promise.all([
                this._loadLanguages(),
                this._loadShortcut(),
            ]);
        });

        onMounted(() => {
            this._onKeyDown = this._handleKeyDown.bind(this);
            this._onKeyUp = this._handleKeyUp.bind(this);
            document.addEventListener("keydown", this._onKeyDown, true);
            document.addEventListener("keyup", this._onKeyUp, true);
        });

        onWillUnmount(() => {
            document.removeEventListener("keydown", this._onKeyDown, true);
            document.removeEventListener("keyup", this._onKeyUp, true);
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
        const value = await this.orm.call(
            "ir.config_parameter",
            "get_param",
            ["fast_language_switcher.shortcut", "ctrl+l"]
        );
        this.state.shortcut = (value || "ctrl+l").toLowerCase().trim();
    }

    _syncWizardIndex() {
        const idx = this.state.languages.findIndex((l) => l.code === this.state.currentCode);
        this.state.wizardIndex = idx >= 0 ? idx : 0;
    }

    // -----------------------------------------------------------------------
    // Shortcut helpers
    // -----------------------------------------------------------------------

    /**
     * Check whether a KeyboardEvent matches the configured shortcut.
     */
    _matchesShortcut(ev) {
        const parts = this.state.shortcut.split("+").map((p) => p.trim().toLowerCase());
        const needsCtrl  = parts.includes("ctrl");
        const needsAlt   = parts.includes("alt");
        const needsShift = parts.includes("shift");
        const needsMeta  = parts.includes("meta");
        const modifiers  = ["ctrl", "alt", "shift", "meta"];
        const keyPart    = parts.find((p) => !modifiers.includes(p)) || "";

        return (
            ev.ctrlKey  === needsCtrl  &&
            ev.altKey   === needsAlt   &&
            ev.shiftKey === needsShift &&
            ev.metaKey  === needsMeta  &&
            ev.key.toLowerCase() === keyPart
        );
    }

    /**
     * Return the DOM key string (e.g. "Control") of the primary modifier used
     * in the configured shortcut, for detecting key-release to apply.
     */
    get _primaryModifierKey() {
        const parts = this.state.shortcut.split("+").map((p) => p.trim().toLowerCase());
        if (parts.includes("ctrl"))  return "Control";
        if (parts.includes("alt"))   return "Alt";
        if (parts.includes("shift")) return "Shift";
        if (parts.includes("meta"))  return "Meta";
        return "Control";
    }

    /** Display label for the primary modifier (used in wizard hint). */
    get primaryModifierDisplay() {
        const parts = this.state.shortcut.split("+").map((p) => p.trim().toLowerCase());
        if (parts.includes("ctrl"))  return "Ctrl";
        if (parts.includes("alt"))   return "Alt";
        if (parts.includes("shift")) return "Shift";
        if (parts.includes("meta"))  return "Meta";
        return "Ctrl";
    }

    /** Shortcut broken into display labels, e.g. ["Ctrl", "L"]. */
    get shortcutDisplay() {
        return parseShortcutParts(this.state.shortcut);
    }

    // -----------------------------------------------------------------------
    // Keyboard handling – macOS-style shortcut wizard
    // -----------------------------------------------------------------------

    _handleKeyDown(ev) {
        if (this._matchesShortcut(ev)) {
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
        // When the primary modifier is released while the wizard is open → apply selection
        if (ev.key === this._primaryModifierKey && this.state.showWizard) {
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
}

registry.category("systray").add(
    "fast_language_switcher.language_switcher",
    { Component: LanguageSwitcher },
    { sequence: 1 }   // right after the user avatar (sequence 0)
);

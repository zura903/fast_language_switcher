/** @odoo-module **/

import { Component, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { standardFieldProps } from "@web/views/fields/standard_field_props";

/**
 * Parse a shortcut string (e.g. "ctrl+l") into display labels (e.g. ["Ctrl", "L"]).
 */
function parseShortcutParts(str) {
    if (!str) return [];
    return str.split("+").map((p) => {
        const part = p.trim().toLowerCase();
        if (part === "ctrl") return "Ctrl";
        if (part === "alt") return "Alt";
        if (part === "shift") return "Shift";
        if (part === "meta") return "Meta";
        return p.trim().toUpperCase();
    });
}

/**
 * Build a canonical shortcut string from a KeyboardEvent,
 * e.g. Ctrl+L → "ctrl+l".
 */
function eventToShortcut(ev) {
    const parts = [];
    if (ev.ctrlKey) parts.push("ctrl");
    if (ev.altKey) parts.push("alt");
    if (ev.shiftKey) parts.push("shift");
    if (ev.metaKey) parts.push("meta");

    const key = ev.key.toLowerCase();
    // Skip lone modifier keypresses
    if (!["control", "alt", "shift", "meta"].includes(key)) {
        parts.push(key);
    }
    return parts.join("+");
}

/**
 * Keyboard Shortcut Input widget for Odoo 18 settings.
 *
 * Renders the stored shortcut as styled <kbd> elements.
 * Clicking the widget enters capture mode: the next key combination pressed
 * becomes the new shortcut.
 */
export class KeyboardShortcutInput extends Component {
    static template = "fast_language_switcher.KeyboardShortcutInput";
    static props = { ...standardFieldProps };

    setup() {
        this.state = useState({
            capturing: false,
        });
    }

    get currentValue() {
        return this.props.record.data[this.props.name] || "";
    }

    get displayParts() {
        return parseShortcutParts(this.currentValue);
    }

    onClick() {
        if (this.props.readonly) return;
        this.state.capturing = true;
    }

    onKeyDown(ev) {
        if (!this.state.capturing) return;
        ev.preventDefault();
        ev.stopPropagation();

        const shortcut = eventToShortcut(ev);
        if (!shortcut) return;

        // Require at least one non-modifier key
        const modifiers = ["ctrl", "alt", "shift", "meta"];
        const hasNonModifier = shortcut.split("+").some((p) => !modifiers.includes(p));
        if (!hasNonModifier) return;

        this.state.capturing = false;
        this.props.record.update({ [this.props.name]: shortcut });
    }

    onBlur() {
        this.state.capturing = false;
    }
}

registry.category("fields").add("keyboard_shortcut", {
    component: KeyboardShortcutInput,
    displayName: "Keyboard Shortcut",
    supportedTypes: ["char"],
});

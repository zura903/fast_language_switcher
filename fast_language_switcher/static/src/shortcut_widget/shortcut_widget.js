/** @odoo-module **/

import { Component, useState, onWillUnmount } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { standardFieldProps } from "@web/views/fields/standard_field_props";

/**
 * Format a raw shortcut string (e.g. "ctrl+l") into display parts (e.g. ["Ctrl", "L"]).
 */
function toDisplayParts(raw) {
    if (!raw) return ["Ctrl", "L"];
    return raw.split("+").map((p) => p.charAt(0).toUpperCase() + p.slice(1));
}

/**
 * ShortcutInputField – a field widget for capturing keyboard shortcuts.
 *
 * Renders the current shortcut as <kbd> elements.  Clicking "Change" enters
 * recording mode; the next key combination that includes at least one modifier
 * (Ctrl / Alt / Meta / Shift) plus a non-modifier key is saved as the new value.
 */
export class ShortcutInputField extends Component {
    static template = "fast_language_switcher.ShortcutInput";
    static props = { ...standardFieldProps };

    setup() {
        this.state = useState({ recording: false });
        this._recordingHandler = null;

        onWillUnmount(() => this._cancelRecording());
    }

    // -----------------------------------------------------------------------
    // Computed helpers
    // -----------------------------------------------------------------------

    get shortcutParts() {
        return toDisplayParts(this.props.record.data[this.props.name]);
    }

    // -----------------------------------------------------------------------
    // Recording logic
    // -----------------------------------------------------------------------

    startRecording() {
        this.state.recording = true;

        this._recordingHandler = (ev) => {
            // Ignore lone modifier keypresses
            if (["Control", "Alt", "Meta", "Shift"].includes(ev.key)) return;

            ev.preventDefault();
            ev.stopPropagation();

            const modifiers = [];
            if (ev.ctrlKey) modifiers.push("ctrl");
            if (ev.altKey) modifiers.push("alt");
            if (ev.metaKey) modifiers.push("meta");
            if (ev.shiftKey) modifiers.push("shift");

            // Require at least one modifier to avoid swallowing regular keys
            if (!modifiers.length) return;

            const key = ev.key.toLowerCase();
            const shortcut = [...modifiers, key].join("+");

            this.props.record.update({ [this.props.name]: shortcut });
            this._cancelRecording();
        };

        document.addEventListener("keydown", this._recordingHandler, true);
    }

    _cancelRecording() {
        if (this._recordingHandler) {
            document.removeEventListener("keydown", this._recordingHandler, true);
            this._recordingHandler = null;
        }
        this.state.recording = false;
    }

    cancelRecording() {
        this._cancelRecording();
    }
}

registry.category("fields").add("fls_shortcut_input", {
    component: ShortcutInputField,
    supportedTypes: ["char"],
});

import { LitElement, html, css } from "lit";
import { property, query, state } from "lit/decorators.js";
import { until } from "lit/directives/until.js";
import { ifDefined } from 'lit/directives/if-defined.js';
import pjson from "../package.json";
import { selectTree } from "./selecttree";
import { findParentCard, actionHandlerBind, actionHandler } from "./helpers.js";

interface LovelaceElement extends HTMLElement {
  hass?: any;
}

interface FoldEntityRowConfig {
  type: string;
  open: boolean;
  entity?: any;
  head?: any;
  items?: any[];
  entities?: any[];
  group_config?: any;
  padding?: number;
  clickable?: boolean;
  mute?: boolean;
  state_color?: boolean;
  color?: string;
}

const DEFAULT_CONFIG = {
  open: false,
  padding: 24,
  group_config: {},
  tap_unfold: undefined,
};

const SECONDARY_INFO_MIGRATED = {
  "last-changed": "last_changed", 
  "last-updated": "last_updated", 
  "last-triggered": "last_triggered"
};

function ensureObject(config: any) {
  if (config === undefined) return undefined;
  return typeof config === "string" ? { entity: config } : config;
}

class FoldEntityRow extends LitElement {
  @property({ type: Boolean }) open: boolean;
  @property({ attribute: false }) head?: Promise<LovelaceElement>;
  @property({ attribute: false }) rows?: LovelaceElement[];
  @property({ type: Boolean }) entitiesWarning = false;
  @property() hass: any;
  @state() _showContent;
  @query(".container") _container: HTMLDivElement;
  _config: FoldEntityRowConfig;
  _hassResolve?: any;

  setConfig(config: FoldEntityRowConfig) {
    this._config = config = Object.assign({}, DEFAULT_CONFIG, config);
    this.open = this.open ?? this._config.open ?? false;
    this._showContent = this.open;

    this._load_head();
    this.rows = [];
    if (this.open) this._load_rows();
  }

  async _load_head() {
    let head = ensureObject(this._config.entity || this._config.head);
    if (!head) {
      throw new Error("No fold head specified");
    }
    if (this._config.clickable === undefined) {
      if (head.entity === undefined && head.tap_action === undefined) {
        this._config.clickable = true;
      }
    }

    this.head = this._createRow(head, true);

    if (this._config.clickable) {
      this.head.then(async (head) => {
        const el = await selectTree(head, "$hui-generic-entity-row$div");
        if (el?.actionHandler) {
          const hger = await selectTree(head, "$hui-generic-entity-row");
          hger.config["tap_action"] = {
            action: "fire-dom-event",
            fold_row: true,
          };
        } else {
          actionHandlerBind(head, { fold_entity_row: true });
          head.addEventListener("action", (ev) => this.toggle(ev as CustomEvent));
        }

        head.tabIndex = 0;
        head.setAttribute("role", "switch");
        head.ariaLabel = this.open ? "Toggle fold closed" : "Toggle fold open";
        head.ariaChecked = this.open ? "true" : "false";
      });
    }
  }

  async _load_rows() {
    if (this.rows.length) return this.rows;
    let head = ensureObject(this._config.entity || this._config.head);

    // Items are taken from the first available of the following
    // - config entities: (this allows auto-population of the list)
    // - config items: (for backwards compatibility - not recommended)
    // - The group specified as head
    let items = this._config.entities || this._config.items;
    if (head.entity && items === undefined) {
      if (this.hass === undefined) {
        await new Promise((resolve) => (this._hassResolve = resolve));
      }
      this._hassResolve = undefined;
      items = this.hass.states[head.entity]?.attributes?.entity_id;
    }
    if (items === undefined) {
      throw new Error("No entities specified.");
    }
    if (!items || !Array.isArray(items)) {
      throw new Error("Entities must be a list.");
    }

    this.rows = await Promise.all(
      items.map(async (i) => {
        return await this._createRow(ensureObject(i));
      })
    );
  }

  async _createRow(config: any, head = false): Promise<LovelaceElement> {
    const helpers = await (window as any).loadCardHelpers();
    const parentCard = await findParentCard(this);
    const localStateColorMigrated = this._config.state_color == true ? "state" : this._config.state_color == false ? "none" : undefined;
    const parentStateColorMigrated = parentCard?._config?.state_color == true ? "state" : parentCard?._config?.state_color == false ? "none" : undefined;
    const groupConfig = { 
      ...this._config.group_config, 
      secondary_info: SECONDARY_INFO_MIGRATED[this._config.group_config?.secondary_info] ?? this._config.group_config?.secondary_info 
    };
    const groupColor = groupConfig.color ?? (groupConfig.state_color == true ? "state" : groupConfig.state_color == false ? "none" : undefined);
    delete groupConfig.state_color;
    delete groupConfig.color;
    const shouldApplyGroupConfig =
      !head && config?.type !== "custom:uix-forge";
    const color =
      (shouldApplyGroupConfig ? groupColor : undefined) ??
      this._config.color ??
      localStateColorMigrated ??
      parentCard?._config?.color ??
      parentStateColorMigrated ?? "state";
    config = {
      color,
      ...(shouldApplyGroupConfig ? groupConfig : {}),
      ...config,
    };

    const el = helpers.createRowElement(config);
    this.applyStyle(el, config, head);
    if (this.hass) {
      el.hass = this.hass;
    }

    return el;
  }

  async applyStyle(root: HTMLElement, config: any, head = false) {
    if (head) {
      // Special styling to stretch
      if (root.localName === "hui-section-row") {
        this.classList.add("section-head");
        const dividerEl = await selectTree(root, "$.divider");
        if (dividerEl) dividerEl.style.marginRight = "calc(calc(var(--fold-entity-row-toggle-icon-width, 32px) + 16px) * -1)";
        // Next line only to fix a bug in HA core through 2025.12
        if (dividerEl) dividerEl.style.marginTop = "0px";
        const labelEl = await selectTree(root, "$.label");
        if (labelEl) {
          labelEl.style.marginLeft = "var(--fold-entity-row-label-margin-left, inherit)";
        }
      } else {
        this.classList.remove("section-head");
      }
    }
    const cls = `type-fold-entity-row-${config?.type?.replace?.(":", "-")}`;

    customElements.whenDefined("card-mod").then(() => {
      (customElements.get("card-mod") as any).applyToElement(
        root,
        "row",
        config.card_mod ? 
          { style: config.card_mod.style, debug: config.card_mod?.debug ?? false } :
          { style: "{}", debug: config.card_mod?.debug ?? false },
        { config },
        true,
        cls
      );
    });

    customElements.whenDefined("uix-node").then(() => {
      (customElements.get("uix-node") as any).applyToElement(
        root,
        "row",
        config.uix ? 
          { style: config.uix.style, debug: config.uix?.debug ?? false } :
        config.card_mod ? 
          { style: config.card_mod.style, debug: config.card_mod?.debug ?? false } :
          { style: "{}", debug: false },
        { config },
        true,
        cls
      );
    });
  }

  async toggleIcon(ev: CustomEvent) {
    this.blur();
    this.toggle(ev);
  }

  async toggle(ev: CustomEvent) {
    if (ev) ev.stopPropagation();
    const newOpen = !this.open;

    this._container.style.overflow = "hidden";
    if (newOpen) {
      this._showContent = true;
      await this._load_rows();
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    const scrollHeight = this._container.scrollHeight;
    this._container.style.height = scrollHeight ? `${scrollHeight}px` : "auto";

    if (!newOpen) {
      setTimeout(() => {
        this._container.style.height = "0px";
      }, 0);
    }

    this.open = newOpen;

    // Accessibility
    if (this._config.clickable) {
      const head = await this.head;
      head.ariaLabel = this.open ? "Toggle fold closed" : "Toggle fold open";
      head.ariaChecked = this.open ? "true" : "false";
    }
  }

  async updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has("open")) {
      if ((this as any)._cardMod)
        (this as any)._cardMod.forEach((cm) => cm.refresh());
    }
    if (changedProperties.has("hass")) {
      this.rows?.forEach((e) => (e.hass = this.hass));
      if (this.head) this.head.then((head) => (head.hass = this.hass));
      if (this._hassResolve) this._hassResolve();
    }
  }

  connectedCallback(): void {
    super.connectedCallback();

    window.setTimeout(() => {
      if (!this.isConnected || this.entitiesWarning) return;
      findParentCard(this).then((result) => {
        if (!result && this._config.mute !== true) {
          this.entitiesWarning = true;
          console.group(
            "%cYou are doing it wrong!",
            "color: red; font-weight: bold"
          );
          console.info(
            "Fold-entity-row should only EVER be used INSIDE an ENTITIES CARD."
          );
          console.info(
            "See https://github.com/thomasloven/lovelace-fold-entity-row/issues/146"
          );
          console.info(this);
          console.groupEnd();
          // Silence this warning by placing the fold-entity-row inside an entities card.
          // or by setting mute: true
        }
      });
    }, 1000);
  }

  _customEvent(ev: CustomEvent) {
    const detail: any = ev.detail;
    // Support action coming from an "ll-action" event created by Frontend actionHandler event or generic "hass-action" event used by many custom cards
    const actionFoldRow = detail.fold_row;
    const hassActionFoldRow = detail.action && detail.config?.[`${detail.action}_action`]?.action == "fire-dom-event" && detail.config?.[`${detail.action}_action`]?.fold_row;
    const foldRow = actionFoldRow || hassActionFoldRow;
    if (foldRow) {
      this.toggle(ev);
    }
  }

  _transitionEnd(ev: Event) {
    this._container.style.removeProperty("height");
    this._container.style.overflow = this.open ? "initial" : "hidden";
    this._showContent = this.open;
  }

  render() {
    return html`
      <div
        id="head"
        @ll-custom=${this._customEvent}
        @hass-action=${this._customEvent}
        aria-expanded=${this.open}
      >
        ${until(this.head, "")}
        <ha-icon-button
          @action=${this.toggleIcon}
          .actionHandler=${actionHandler({})}
          role="${ifDefined(this._config.clickable ? undefined : "switch")}"
          tabindex="${this._config.clickable ? "-1" : "0"}"
          aria-checked=${this.open ? "true" : "false"}
          aria-label="${this._config.clickable
            ? ""
            : this.open
            ? "Toggle fold closed"
            : "Toggle fold open"}"
          class="${this.open ? "open" : ""}"
        >
        <ha-icon icon="mdi:chevron-down"></ha-icon>
      </ha-icon-button>
      </div>

      <div
        role="region"
        aria-hidden="${!this.open}"
        style=${`--row-padding: ${this._config.padding}px;`}
        class="container ${this.open ? "expanded" : ""}"
        tabindex="-1"
        @transitionend=${this._transitionEnd}
      >
        ${this.rows?.map((row) => html`<div>${row}</div>`)}
      </div>
    `;
  }

  static get styles() {
    return css`
      #head {
        display: flex;
        align-items: center;
        --toggle-icon-width: 32px;
      }
      #head :not(ha-icon-button, ha-icon) {
        flex-grow: 1;
        max-width: calc(100% - var(--fold-entity-row-toggle-icon-width, var(--toggle-icon-width)));
      }
      #head :not(ha-icon-button, ha-icon):focus-visible {
        outline: none;
        background: var(--divider-color);
        border-radius: 24px;
        background-size: cover;
      }
      #head :not(ha-icon-button, ha-icon):focus {
        outline: none;
      }

      ha-icon-button {
        width: var(--fold-entity-row-toggle-icon-width, var(--toggle-icon-width));
        cursor: pointer;
        border-radius: 50%;
        background-size: cover;
        --mdc-icon-size: var(--fold-entity-row-toggle-icon-width, var(--toggle-icon-width));
        --ha-icon-button-size: var(--fold-entity-row-toggle-icon-width, var(--toggle-icon-width));
        /* --mdc-icon-button-size can be removed once Home Assistant 2026.3 released */
        --mdc-icon-button-size: var(--fold-entity-row-toggle-icon-width, var(--toggle-icon-width));
        transition: transform var(--fold-entity-row-transition-duration, 150ms) cubic-bezier(0.4, 0, 0.2, 1);
        color: var(--fold-entity-row-toggle-icon-color, var(--primary-text-color));
        display: inline-flex;
      }

      ha-icon-button.open {
        transform: rotate(180deg);
      }

      ha-icon {
        display: flex;
      }

      :host(.section-head) ha-icon-button {
        margin-top: 8px;
      }

      .container {
        padding-left: var(--fold-entity-row-padding, var(--row-padding, 24px));
        overflow: hidden;
        transition: calc(var(--fold-entity-row-transition-duration, 150ms) * 2) cubic-bezier(0.4, 0, 0.2, 1);
        transition-property: height, margin-top;
        margin-top: 0px;
        height: 0px;
        display: flex;
        flex-direction: column;
        gap: var(--fold-entity-row-gap, var(--entities-card-row-gap, var(--card-row-gap, 8px)));
      }

      .container.expanded {
        height: auto;
        margin-top: 8px;
      }
    `;
  }
}

if (!customElements.get("fold-entity-row")) {
  customElements.define("fold-entity-row", FoldEntityRow);
  console.groupCollapsed(
    `%c💡 FOLD-ENTITY-ROW ${pjson.version} IS INSTALLED 💡`,
    'color: white; background-color: #CE3226; padding: 2px 5px; font-weight: bold; border-radius: 5px;',
  );
  console.log('Readme:', 'https://github.com/Lint-Free-Technology/lovelace-fold-entity-row');
  console.groupEnd();
}

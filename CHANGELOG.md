## [4.0.2-beta.1](https://github.com/Lint-Free-Technology/lovelace-fold-entity-row/compare/v4.0.1...v4.0.2-beta.1) (2026-09-12)

### 🐞 Bug Fixes

* Migrate group_config secondary_info `last-xxx` to `last_xxx`. Corrects the display of `last-triggered` for automation entities. ([2063ec8](https://github.com/Lint-Free-Technology/lovelace-fold-entity-row/commit/2063ec8b7767b1e0fa00d73fdb6c1c4afe686ddf)), closes [#54](https://github.com/Lint-Free-Technology/lovelace-fold-entity-row/issues/54)

## [4.0.1](https://github.com/Lint-Free-Technology/lovelace-fold-entity-row/compare/v4.0.0...v4.0.1) (2026-08-27)

### 🐞 Bug Fixes

* Listen to "hass-action" on head and toggle fold when action is `fire-dom-event` and includes `fold_row: true`. Restores `fold_row` action when using custom cards that use "hass-action" like custom:template-entity-row (>3.0.0) and custom:multiple-entity-row row and entity actions. ([#49](https://github.com/Lint-Free-Technology/lovelace-fold-entity-row/issues/49)) ([cde35a4](https://github.com/Lint-Free-Technology/lovelace-fold-entity-row/commit/cde35a4607408b2d0725f80c746be3ca3707a439)), references [#48](https://github.com/Lint-Free-Technology/lovelace-fold-entity-row/issues/48)

## [4.0.0](https://github.com/Lint-Free-Technology/lovelace-fold-entity-row/compare/v3.0.4...v4.0.0) (2026-08-05)

### ⚠ BREAKING CHANGES

* Home Assistant 2026.8.0 or greater required.

### 📦 Dependency Upgrades

* Update to Typescript v7, move to esbuild ([a66a62f](https://github.com/Lint-Free-Technology/lovelace-fold-entity-row/commit/a66a62f8bf56014599befbb1dc82efedb6868f21))

### ⚙️ Miscellaneous

* Migrate `state_color` to `color` when reading parent card for color options and also `group_config`. `state_color: true` is migrated to `color: state`. `state_color: false` is migrated to `color: none`. Default is `color: state`. These changes reflect changes in Home Assistant 2026.8.0. ([7120656](https://github.com/Lint-Free-Technology/lovelace-fold-entity-row/commit/7120656fc07ce249e991b2c46c1aee5e9fbcd081))
* Set minimum HA Version to 2026.8.0.dev0 so HACS will allow against dev builds and greater. ([81aee4a](https://github.com/Lint-Free-Technology/lovelace-fold-entity-row/commit/81aee4a1a24b40d6403d624744b2bd052b80fb2a))

## [3.0.4](https://github.com/Lint-Free-Technology/lovelace-fold-entity-row/compare/v3.0.3...v3.0.4) (2026-06-03)

### 📔 Documentation

* Update readme with up to date visual examples ([5828ba3](https://github.com/Lint-Free-Technology/lovelace-fold-entity-row/commit/5828ba3ae8b240fdaac9065919f30ce260eaf3de))

### ⚙️ Miscellaneous

* Use ha-testcontainer for visual testing and documentation images/animations. ([eb0bca5](https://github.com/Lint-Free-Technology/lovelace-fold-entity-row/commit/eb0bca571ebda6e4b227f814b91198b11e8629f5))

## [3.0.3](https://github.com/Lint-Free-Technology/lovelace-fold-entity-row/compare/v3.0.2...v3.0.3) (2026-05-13)

### ⚙️ Miscellaneous

* Skip `group_config` merge for `custom:uix-forge` rows ([#15](https://github.com/Lint-Free-Technology/lovelace-fold-entity-row/issues/15)) ([b3db3ef](https://github.com/Lint-Free-Technology/lovelace-fold-entity-row/commit/b3db3eff5e7e26d9622a31ab2a3a160f0cb6d1fe))

## [3.0.2](https://github.com/Lint-Free-Technology/lovelace-fold-entity-row/compare/v3.0.1...v3.0.2) (2026-03-23)

### 🐞 Bug Fixes

* Support uix as well as card_mod for applying row styles ([614f207](https://github.com/Lint-Free-Technology/lovelace-fold-entity-row/commit/614f20742d0bb8343a618d479fd2efc15eeab9be))

## [3.0.1](https://github.com/Lint-Free-Technology/lovelace-fold-entity-row/compare/v3.0.0...v3.0.1) (2026-02-18)

### 🐞 Bug Fixes

* Icon button size for Home Assistant 2026.3. ([d93e4da](https://github.com/Lint-Free-Technology/lovelace-fold-entity-row/commit/d93e4dafda228eab4e710a072e6fec4b3f7aa7d7))

## [3.0.0](https://github.com/Lint-Free-Technology/lovelace-fold-entity-row/compare/v2.0.0...v3.0.0) (2026-02-12)

* Update card-mod signature and apply class. by @dcapslock in https://github.com/Lint-Free-Technology/lovelace-fold-entity-row/pull/2
* 202511 button css vars by @dcapslock in https://github.com/Lint-Free-Technology/lovelace-fold-entity-row/pull/3
* Fix loading rows when open and config changes like when used with aut… by @dcapslock in https://github.com/Lint-Free-Technology/lovelace-fold-entity-row/pull/4

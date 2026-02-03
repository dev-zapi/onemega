# SwitchyAlpha - AI Agent Guide

## Project Overview

SwitchyAlpha is a modern browser extension for proxy management, supporting Chrome, Firefox, and Edge. It allows users to manage and switch between multiple proxy configurations quickly and easily.

This is a modern rewrite based on [ZeroOmega](https://github.com/zero-peak/ZeroOmega) and [SwitchyOmega](https://github.com/FelisCatus/SwitchyOmega), built with TypeScript, Svelte 5, and Vite.

### Key Features
- Quick proxy switching from popup menu
- Multiple profile types: Direct, System, Fixed Proxy, PAC Script, Auto Switch
- Smart rules based on URL patterns, domains, or wildcards
- Import/Export configuration backups
- Cross-browser compatibility

---

## Technology Stack

| Category | Technology |
|----------|------------|
| Language | TypeScript 5.4+ |
| UI Framework | Svelte 5 (Runes API) |
| Build Tool | Vite 6.0+ |
| Extension Build | @crxjs/vite-plugin |
| CSS Framework | Tailwind CSS v4 |
| Testing | Vitest 2.0+ |
| Package Manager | pnpm 9.0+ |
| Node Version | >= 20.0.0 |

---

## Project Structure

This is a monorepo managed with pnpm workspaces:

```
packages/
├── pac/                    # PAC script generation library
│   ├── src/
│   │   ├── types.ts        # Type definitions for profiles, conditions, etc.
│   │   ├── conditions.ts   # 12 condition types for URL matching
│   │   ├── profiles.ts     # Profile management logic
│   │   ├── rule-list.ts    # AutoProxy/Switchy format parsing
│   │   ├── pac-generator.ts# PAC script generation
│   │   ├── utils.ts        # General utilities
│   │   └── shexp-utils.ts  # Shell expression matching
│   └── tests/              # 45+ tests
│
├── core/                   # Options management library
│   ├── src/
│   │   ├── index.ts        # Main exports
│   │   ├── options.ts      # Profile CRUD operations
│   │   ├── storage.ts      # Abstract Storage interface
│   │   ├── browser-storage.ts # Chrome storage implementation
│   │   ├── log.ts          # Logging utility
│   │   └── errors.ts       # Custom error classes
│   └── tests/              # 39+ tests
│
└── extension/              # Browser extension (Svelte 5 UI)
    ├── src/
    │   ├── background/     # Service worker (proxy API)
    │   │   ├── index.ts    # Main background script
    │   │   ├── icon.ts     # Icon update logic
    │   │   └── tabs.ts     # Tab management
    │   ├── popup/          # Quick profile switch UI
    │   │   ├── App.svelte
    │   │   ├── index.html
    │   │   └── main.ts
    │   ├── options/        # Settings pages
    │   │   ├── App.svelte  # Main options app with routing
    │   │   ├── Layout.svelte
    │   │   ├── pages/      # ProfileList, ProfileFixed, ProfileSwitch, etc.
    │   │   ├── index.html
    │   │   └── main.ts
    │   ├── components/     # Reusable UI components
    │   │   ├── ui/         # Button, Input, Modal, Select, etc.
    │   │   ├── ProfileIcon.svelte
    │   │   └── ProfileSelect.svelte
    │   └── lib/
    │       ├── stores/     # Svelte 5 runes-based state
    │       ├── utils/      # Helper utilities
    │       ├── i18n.svelte.ts  # Internationalization
    │       └── locales.ts  # 27 language translations
    ├── manifest.json       # Chrome extension manifest (MV3)
    ├── vite.config.ts      # Vite + @crxjs/vite-plugin
    └── svelte.config.js    # Svelte 5 with runes enabled
```

---

## Build and Development Commands

All commands should be run from the repository root:

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Development mode (watch)
pnpm dev

# Run all tests
pnpm test

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Code formatting
pnpm format
```

### Package-specific Commands

```bash
# Build extension only
cd packages/extension && pnpm build

# Test specific package
cd packages/pac && pnpm test
cd packages/core && pnpm test

# Watch mode for tests
cd packages/pac && pnpm test:watch
```

### Loading Extension in Browser

After building:

1. **Chrome**: Go to `chrome://extensions` → Enable "Developer mode" → Click "Load unpacked" → Select `packages/extension/dist/chrome`
2. **Firefox**: Use `about:debugging` → Load Temporary Add-on
3. **Edge**: Go to `edge://extensions` → Enable "Developer mode" → Load unpacked

---

## Code Style Guidelines

### TypeScript

- Use strict mode (configured in `tsconfig.base.json`)
- All code uses ES modules (`"type": "module"`)
- Explicit return types for public functions
- Interface-first approach for complex types

### Svelte 5 Conventions (Required)

Use the Runes API exclusively:

```typescript
// State
let count = $state(0);

// Derived (computed) values
let doubled = $derived(count * 2);

// Side effects
$effect(() => {
  console.log('count changed:', count);
});

// Component props with TypeScript
interface Props {
  value: string;
  onChange?: (v: string) => void;
}
let { value, onChange }: Props = $props();

// Two-way binding
let { value = $bindable() }: Props = $props();
```

### Component Patterns

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  
  interface Props {
    title: string;
    children: Snippet;
  }
  let { title, children }: Props = $props();
</script>

<div>
  <h1>{title}</h1>
  {@render children()}
</div>
```

### Key Rules

- Use `$props()` with TypeScript interface for all component props
- Use `$derived()` for any reactive computed values from props
- Use `{@render children()}` instead of `<slot>`
- Use `onclick` not `on:click` for event handlers
- Always use `lang="ts"` in script tags

### CSS/Styling

- Use Tailwind CSS v4 for all styling
- Custom utilities in `packages/extension/src/app.css`
- Dark mode via `.dark` class on html element
- Custom theme variables for fonts and colors

### Prettier Configuration

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-svelte"]
}
```

---

## Testing Instructions

Tests use Vitest with Node environment:

```bash
# Run all tests across packages
pnpm -r test

# Run with coverage
pnpm -r test --coverage

# Watch mode for development
cd packages/pac && pnpm test:watch
cd packages/core && pnpm test:watch
```

### Test File Locations

- `packages/pac/tests/*.test.ts` - PAC generation tests (45+ tests)
- `packages/core/tests/*.test.ts` - Core functionality tests (39+ tests)
- `packages/extension/tests/*.test.ts` - Extension tests

### Test Patterns

```typescript
import { describe, it, expect } from 'vitest';

describe('Feature', () => {
  it('should do something', () => {
    expect(result).toBe(expected);
  });
});
```

---

## Architecture Details

### Profile Types

| Type | Key | Description |
|------|-----|-------------|
| `DirectProfile` | `+direct` | No proxy (DIRECT connection) |
| `SystemProfile` | `+system` | Use system proxy settings |
| `FixedProfile` | User-defined | Static proxy server with bypass rules |
| `SwitchProfile` | User-defined | Condition-based profile switching |
| `PacProfile` | User-defined | Custom PAC script or URL |
| `RuleListProfile` | User-defined | Online rule list (e.g., GFWList) |
| `VirtualProfile` | User-defined | Acts as another profile on demand |

### Storage Key Convention

```typescript
// Profiles: prefixed with '+'
'+myProfile'              // Profile named "myProfile"

// Settings: prefixed with '-'
'-startupProfileName'     // Startup profile setting
'-quickSwitchProfiles'    // Quick switch list
'-downloadInterval'       // Rule list update interval (minutes)
'-language'               // UI language

// State (no prefix)
'currentProfileName'      // Currently active profile
'isSystemProfile'         // Whether using system profile
```

### Background Service Worker API

Messages via `chrome.runtime.sendMessage`:

```typescript
// Get all options
{ action: 'getOptions' }
// Returns: { options: OmegaOptions, currentProfileName: string }

// Save options
{ action: 'setOptions', options: OmegaOptions }
// Returns: { success: true }

// Apply a profile
{ action: 'applyProfile', profileName: string }
// Returns: { success: true }

// Import options
{ action: 'importOptions', options: OmegaOptions }
// Returns: { success: true }

// Reset to defaults
{ action: 'resetOptions' }
// Returns: { success: true }
```

### Condition Types (for SwitchProfile)

1. `HostWildcardCondition` - Wildcard host matching (*.example.com)
2. `HostRegexCondition` - Regex host matching
3. `UrlWildcardCondition` - Wildcard URL matching
4. `UrlRegexCondition` - Regex URL matching
5. `KeywordCondition` - URL contains keyword (HTTP only)
6. `BypassCondition` - Bypass patterns (<local>, etc.)
7. `IpCondition` - IP address/CIDR matching
8. `WeekdayCondition` - Day of week matching
9. `TimeCondition` - Time range matching
10. `FalseCondition` - Always false (disabled rule)
11. `TrueCondition` - Always true
12. `ConditionGroup` - Logical group (AND/OR)

---

## Internationalization

The extension supports 27 languages:
- English (en) - base language
- Simplified Chinese (zh-CN)
- Traditional Chinese (zh-TW, zh-Hant)
- Czech (cs), Dutch (nl), French (fr), German (de)
- Hebrew (he), Icelandic (is), Italian (it), Japanese (ja)
- And more...

Translation files are in `packages/extension/src/lib/locales.ts` (auto-generated from Weblate).

### Adding Translations

Do not edit `locales.ts` directly. Translations are managed on [Weblate](https://hosted.weblate.org/engage/switchyomega/).

---

## Common Development Tasks

### Adding a New Profile Type

1. Add type to `packages/pac/src/types.ts`
2. Add matching logic to `packages/pac/src/profiles.ts`
3. Create editor component in `packages/extension/src/options/pages/`
4. Add route in `packages/extension/src/options/App.svelte`
5. Add to profile type colors/emojis in `profiles.ts`

### Adding a New Condition Type

1. Add type to `packages/pac/src/types.ts`
2. Add matching function to `packages/pac/src/conditions.ts`
3. Add tests to `packages/pac/tests/conditions.test.ts`
4. Update `ProfileSwitch.svelte` condition editor UI

### Adding a New UI Component

1. Create in `packages/extension/src/components/ui/`
2. Use Svelte 5 runes API (`$props`, `$state`, `$derived`)
3. Use Tailwind CSS for styling
4. Export from component file
5. Import in consuming files

### Adding a New Language

1. Update `packages/extension/src/lib/locales.ts` (Language type and languages array)
2. Add translation object to translations record
3. Update i18n detection logic if needed

---

## Security Considerations

- PAC scripts are executed in a sandboxed context by the browser
- Extension requires `proxy`, `tabs`, `storage`, `webRequest` permissions
- User credentials for proxy authentication are stored in extension storage
- All inter-context communication uses Chrome's message passing API
- Options are validated before being applied

---

## Deployment

Releases are built via GitHub Actions (`.github/workflows/release.yml`):

1. Tag with `v*` pattern triggers the workflow
2. Builds for both Chromium and Firefox
3. Generates SHA-256 checksums
4. Creates GitHub Release with artifacts

Published extensions:
- Chrome Web Store
- Firefox Add-ons
- Edge Add-ons

---

## License

GNU General Public License v3.0 - See COPYING file for details.

---

## Additional Resources

- [Original SwitchyOmega Wiki](https://github.com/FelisCatus/SwitchyOmega/wiki)
- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Svelte 5 Documentation](https://svelte.dev/docs/svelte)
- [Tailwind CSS v4](https://tailwindcss.com/docs)

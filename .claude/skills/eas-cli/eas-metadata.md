# App Store Metadata (EAS Metadata)

Manage App Store presence from the command line using `store.config.json`. Apple App Store only (preview).

## Commands

```sh
eas metadata:pull    # pull current metadata from App Store Connect into store.config.json
eas metadata:push    # push local store.config.json to App Store Connect
eas metadata:lint    # validate config locally
```

A binary must be submitted via `eas submit` before pushing metadata for new apps.

## Config File

`store.config.json` at project root:

```json
{
  "configVersion": 0,
  "apple": {
    "copyright": "2025 Your Company",
    "categories": ["UTILITIES", "PRODUCTIVITY"],
    "info": {
      "en-US": {
        "title": "App Name",
        "subtitle": "Your compelling tagline",
        "description": "Full app description...",
        "keywords": ["finance,budget,expense,money,tracker"],
        "releaseNotes": "What's new...",
        "promoText": "Limited time offer!",
        "privacyPolicyUrl": "https://example.com/privacy",
        "supportUrl": "https://example.com/support",
        "marketingUrl": "https://example.com"
      }
    },
    "advisory": {
      "alcoholTobaccoOrDrugUseOrReferences": "NONE",
      "gamblingSimulated": "NONE",
      "medicalOrTreatmentInformation": "NONE",
      "profanityOrCrudeHumor": "NONE",
      "sexualContentGraphicAndNudity": "NONE",
      "sexualContentOrNudity": "NONE",
      "horrorOrFearThemes": "NONE",
      "matureOrSuggestiveThemes": "NONE",
      "violenceCartoonOrFantasy": "NONE",
      "violenceRealistic": "NONE",
      "violenceRealisticProlongedGraphicOrSadistic": "NONE",
      "contests": "NONE",
      "gambling": false,
      "unrestrictedWebAccess": false,
      "seventeenPlus": false
    },
    "release": {
      "automaticRelease": true,
      "phasedRelease": true
    },
    "review": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "review@example.com",
      "phone": "+1 555-123-4567",
      "notes": "Demo account: test@example.com / password123"
    }
  }
}
```

## Key Fields

### Info (per locale)

- `title` — 30 chars max. Most important ranking factor. Brand + primary keyword.
- `subtitle` — 30 chars max. Don't duplicate title keywords.
- `keywords` — 100 chars max. Comma-separated, no spaces after commas. Singular forms only (Apple handles plurals). Don't repeat words from title/subtitle.
- `description` — 4000 chars max. Not indexed for search but critical for conversion. Front-load first 3 lines.
- `releaseNotes` — shown to existing users deciding whether to update.
- `promoText` — 170 chars max. Appears above description. Can be updated without a new binary.

### Advisory

Content descriptors use `"NONE"`, `"INFREQUENT_OR_MILD"`, or `"FREQUENT_OR_INTENSE"`. Boolean fields: `gambling`, `unrestrictedWebAccess`, `seventeenPlus`. Kids age bands: `FIVE_AND_UNDER`, `SIX_TO_EIGHT`, `NINE_TO_ELEVEN`.

### Release

- `automaticRelease: true` — release immediately on approval
- `automaticRelease: false` — manual release after approval
- `automaticRelease: "2025-02-01T10:00:00Z"` — scheduled release (RFC 3339)
- `phasedRelease: true` — 7-day gradual rollout (1%, 2%, 5%, 10%, 20%, 50%, 100%)

### Review

Contact info and test credentials for the App Review team. Include `firstName`, `lastName`, `email`, `phone`, and optionally `demoUsername`, `demoPassword`, `notes`.

## Categories

```json
{ "categories": ["FINANCE", "PRODUCTIVITY"] }
```

Available: `BOOKS`, `BUSINESS`, `DEVELOPER_TOOLS`, `EDUCATION`, `ENTERTAINMENT`, `FINANCE`, `FOOD_AND_DRINK`, `GAMES`, `GRAPHICS_AND_DESIGN`, `HEALTH_AND_FITNESS`, `KIDS`, `LIFESTYLE`, `MAGAZINES_AND_NEWSPAPERS`, `MEDICAL`, `MUSIC`, `NAVIGATION`, `NEWS`, `PHOTO_AND_VIDEO`, `PRODUCTIVITY`, `REFERENCE`, `SHOPPING`, `SOCIAL_NETWORKING`, `SPORTS`, `STICKERS`, `TRAVEL`, `UTILITIES`, `WEATHER`.

## Localization

Add locale keys under `info`. Keywords should be researched per locale — direct translations miss regional search terms.

```json
{
  "info": {
    "en-US": { "title": "Budgetly - Money Tracker", "keywords": ["budget,finance,money"] },
    "es-ES": { "title": "Budgetly - Control de Gastos", "keywords": ["presupuesto,finanzas,dinero"] },
    "ja": { "title": "Budgetly - 家計簿アプリ", "keywords": ["家計簿,支出,予算"] }
  }
}
```

Supported locales: `ar-SA`, `ca`, `cs`, `da`, `de-DE`, `el`, `en-AU`, `en-CA`, `en-GB`, `en-US`, `es-ES`, `es-MX`, `fi`, `fr-CA`, `fr-FR`, `he`, `hi`, `hr`, `hu`, `id`, `it`, `ja`, `ko`, `ms`, `nl-NL`, `no`, `pl`, `pt-BR`, `pt-PT`, `ro`, `ru`, `sk`, `sv`, `th`, `tr`, `uk`, `vi`, `zh-Hans`, `zh-Hant`.

## Dynamic Config

Use `store.config.js` for dynamic values. Set `"metadataPath": "./store.config.js"` in `eas.json` under `cli`.

```js
// store.config.js
const baseConfig = require("./store.config.json");
module.exports = {
  ...baseConfig,
  apple: {
    ...baseConfig.apple,
    copyright: `${new Date().getFullYear()} Your Company, Inc.`,
  },
};
```

Async configs are supported — export an async function to fetch translations from a CMS.

## Docs

- [EAS Metadata introduction](https://docs.expo.dev/eas/metadata/)
- [store.config.json schema](https://docs.expo.dev/eas/metadata/schema/)

# iOS Ad Hoc Builds (Internal Distribution)

Ad hoc provisioning lets you install iOS builds directly on devices without going through TestFlight or the App Store. Each device must be registered by UDID. Apple limits this to 100 devices per app per year.

## eas.json Setup

A build profile with `"distribution": "internal"` uses ad hoc provisioning on iOS:

```json
{
  "build": {
    "preview": {
      "distribution": "internal"
    },
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    }
  }
}
```

## End-to-End Flow

### 1. Register Devices

Before building, register each test device's UDID. This generates a URL/QR code the device owner opens in Safari to install a provisioning profile.

```sh
eas device:create
```

- Only devices registered **before** a build is created will be included in that build's provisioning profile.
- `--non-interactive` is not supported — this command requires interactive Apple login.

### 2. List Registered Devices

```sh
eas device:list --json
```

### 3. Build

```sh
eas build -p ios -e preview --non-interactive --json --wait
```

The build output includes a shareable install URL. Anyone with a registered device can open it to install the app.

### 4. Add a New Device to an Existing Build (Re-sign)

If a new device needs access but you don't want a full rebuild, re-sign the existing .ipa with an updated provisioning profile:

```sh
eas build:resign -p ios --id <BUILD_ID>
```

- `--target-profile preview` to specify which profile's credentials to use
- Re-signing takes ~90 seconds vs a full rebuild
- The re-signed build gets a new install URL that includes the newly registered device

### 5. Remove a Device

```sh
eas device:delete
```

This prompts to also disable the device on the Apple Developer Portal. Disabled devices still count against Apple's 100-device limit until the annual reset.

## Key Constraints

- **100 device limit** per app per year (Apple restriction, not EAS). Resets annually via Apple Developer Portal.
- **Provisioning profiles expire after 12 months.** Rebuild or run `eas credentials` to regenerate.
- **Each new device requires either a new build or a re-sign** — existing builds won't install on devices added after the build was created.
- **iOS 16+ requires Developer Mode** enabled on the device before ad hoc builds can run. This doesn't apply to enterprise provisioning.

## Docs

- [Internal distribution](https://docs.expo.dev/build/internal-distribution/)
- [Ad hoc provisioning and device management](https://docs.expo.dev/build/internal-distribution/#managing-devices)
- [Re-signing credentials](https://docs.expo.dev/app-signing/app-credentials/#re-signing-new-credentials)
- [Share a development build with your team](https://docs.expo.dev/develop/development-builds/share-with-your-team/)
- [Apple Developer Program roles and permissions](https://docs.expo.dev/app-signing/apple-developer-program-roles-and-permissions/)

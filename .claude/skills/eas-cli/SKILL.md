# EAS CLI Headless Reference

Use `bunx eas-cli` to interact with Expo Application Services. Always use `--json --non-interactive` when parsing output programmatically.

- Always use `bunx eas-cli` and not `eas`
- Auth: You are logged in automatically. Do not log out.
- You only run in non-interactive mode.

## Project Info

```sh
eas project:info                                        # fullName, ID
eas config -p ios -e production --json --non-interactive # resolved app.json + eas.json
```

## References

Read references for skills:

- EAS Build, app store submissions, or diagnosing build failures: ./eas-build.md
- EAS Update, OTA updates, branches, channels, roll-outs, or fingerprints: ./eas-update.md
- iOS ad hoc builds, internal distribution, device registration, or re-signing: ./eas-ios-adhoc.md
- App Store metadata, ASO, store.config.json, or localization: ./eas-metadata.md
- Environment variables, secrets, or .env file sync: ./eas-env.md

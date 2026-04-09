# EAS Build & Submit

## Start a Build

```sh
eas build -p ios -e production --non-interactive --json --wait
```

- `-p all` to build both platforms
- `--submit` to auto-submit to stores on success
- `--clear-cache` to clear EAS build cache
- `--build-logger-level trace` for verbose logs
- `-m "message"` to tag the build with a description

## List Builds

```sh
eas build:list --json --non-interactive
```

- `-p ios` to filter by platform
- `--status errored` to filter by status (`new`, `in-queue`, `in-progress`, `errored`, `finished`, `canceled`)
- `--build-profile preview` to filter by eas.json profile
- `--distribution simulator` to filter by distribution type (`store`, `internal`, `simulator`)
- `--git-commit-hash <hash>` to find builds from a specific commit
- `--fingerprint-hash <hash>` to find builds matching a fingerprint
- `--app-version 1.2.0` to filter by app version
- `--limit 50 --offset 0` to paginate

## View / Cancel

```sh
eas build:view <BUILD_ID> --json    # full build details
eas build:cancel <BUILD_ID> --non-interactive
```

Build JSON fields: `status`, `error` (when errored), `artifacts.buildUrl` (download URL), `logFiles` (array of log URLs), `metrics.buildDuration` / `metrics.buildQueueTime` / `metrics.buildWaitTime` (all in milliseconds).

## Inspect Build Stages Locally

Reproduce build stages locally to debug failures without waiting for EAS.

```sh
eas build:inspect -p ios -e production -s pre-build -o /tmp/debug --force
```

- `-s archive` to inspect what gets uploaded to EAS
- `-s pre-build` to inspect after prebuild/autolinking, before native compile
- `-s post-build` to inspect full native build output

## Submit to App Stores

```sh
eas submit -p ios --latest --non-interactive --wait
```

- `--id <BUILD_ID>` to submit a specific build
- `--path ./build.ipa` to submit a local file
- `--what-to-test "description"` to set TestFlight test notes (iOS only)
- `--groups "internal-testers"` to add to TestFlight groups (iOS only)
- `-p android` for Android submission

## Diagnosing Build Failures

```sh
# 1. Find failing builds
eas build:list -p ios --status errored --limit 5 --json --non-interactive

# 2. Get build details — check the `error` field for a summary
eas build:view <BUILD_ID> --json
```

The `build:view` JSON includes:

- `error.message` — short error summary (e.g. "Unknown error. See logs of the Bundle JavaScript build phase")
- `error.errorCode` — machine-readable code (e.g. `UNKNOWN_ERROR`, `BUILD_SCRIPT_ERROR`)
- `logFiles` — array of URLs to structured log files (most useful)
- `artifacts.xcodeBuildLogsUrl` — Xcode build logs URL (iOS only)

```sh
# 3. Fetch the build logs — they are JSONL (one JSON object per line)
# Each line has: phase, level, msg, source (stdout/stderr), time
# Level 50 = error, level 60 = fatal
# Use jq to extract readable messages:
curl -s "<LOG_FILE_URL>" | jq -r 'select(.source == "stderr" or .level >= 50) | "\(.phase): \(.msg)"'
```

To get the log URLs programmatically:

```sh
eas build:view <BUILD_ID> --json | jq -r '.logFiles[-1]'  # last log file usually has the failure
```

Common error phases and what to look for:

- `EAGER_BUNDLE` / `BUNDLE_JAVASCRIPT` — JS bundling errors (ReferenceError, SyntaxError, missing modules)
- `INSTALL_PODS` — CocoaPods failures (missing pods, version conflicts)
- `RUN_FASTLANE` — Xcode build errors (compile errors, signing issues)
- `INSTALL_DEPENDENCIES` — npm/yarn install failures

### Interpreting Bundling Errors

EAS builds bundle JS eagerly before the native compile. The `EAGER_BUNDLE` phase runs `expo export:embed --eager` which evaluates all reachable modules — optionally including API routes (`app/api+*`), and server components.

When you see a `ReferenceError` like `localStorage is not defined` or `document is not defined`:

- **Don't assume it's a client-side issue.** The bundler evaluates all entry points. The error may originate in a server-side route (API route) or a shared module imported by one.
- Check the **full stack trace** in the log `msg` field to find the originating file.
- Browser globals (`localStorage`, `sessionStorage`, `document`, `window`) are unavailable in both React Native and server/API route contexts — but the fix depends on which context the code runs in.
- Look for indications of what platform was bundled such as "Exporting server" or "λ Bundled" indicating a server bundle.
- If the erroring code is in a dependency, it may need to be lazy-imported or conditionally required so it isn't eagerly evaluated during the bundle phase.

### When `logFiles` Is Empty

EAS deletes build logs after **30 days**. Builds older than that will have an empty `logFiles` array. In this case:

- Parse the `error.message` — it names the failing phase (e.g. "See logs of the Read app config build phase"). Use this to infer the failure category:
  - "Read app config" — `app.config.js`/`app.json` threw during evaluation (bad import, syntax error, missing dependency)
  - "Install pods" — CocoaPods failure (missing pod, version conflict, incompatible native module)
  - "Run fastlane" — Xcode build or signing error
  - "Configure Xcode project" — prebuild/autolinking issue
  - "Bundle JavaScript" / "EAGER_BUNDLE" — JS bundling error
- Check `gitCommitMessage` to understand what changed in the failing commit.
- View the build on the web dashboard: `https://expo.dev/accounts/<ACCOUNT>/projects/<PROJECT>/builds/<BUILD_ID>`
- Use `build:inspect` locally against the same profile to reproduce the issue.

### General Tips

- The `error.message` from `build:view` is often generic (e.g. "Unknown error"). Always fetch the full logs when available.
- Filter logs to the failing phase: `jq -r 'select(.phase == "EAGER_BUNDLE") | .msg'`
- Look at `source: "stderr"` lines first — these contain the actual error output.
- The last few lines of the failing phase usually contain the root cause. Work backwards from `END_PHASE` with `result: "failed"`.

```sh
# 4. Inspect locally to reproduce the issue
eas build:inspect -p ios -e production -s pre-build -o /tmp/debug --force

# 5. Retry with verbose logs + cleared cache
eas build -p ios -e production --build-logger-level trace --clear-cache --non-interactive --json --wait
```

## Common Patterns

```sh
# Build, wait, then submit
BUILD_JSON=$(eas build -p ios -e production --non-interactive --json --wait)
BUILD_ID=$(echo "$BUILD_JSON" | jq -r '.[0].id')
eas submit -p ios --id "$BUILD_ID" --non-interactive --wait

# Find and retry a failed build
FAILED=$(eas build:list -p ios --status errored --limit 1 --json --non-interactive | jq -r '.[0].id')
eas build:view "$FAILED" --json
eas build -p ios -e production --clear-cache --non-interactive --json --wait
```

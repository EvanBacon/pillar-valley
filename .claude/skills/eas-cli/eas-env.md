# EAS Environment Variables

Manage server-side environment variables for EAS Build and EAS Update. Variables are scoped to an **environment** (`production`, `preview`, `development`) and a **scope** (`project` or `account`).

## List Variables

```sh
eas env:list --environment production --format long
```

- `--include-sensitive` to show secret values in output
- `--include-file-content` to display file variable contents
- `--scope account` to list account-level vars (default is `project`)
- `--environment production --environment preview` to list across multiple environments

## View a Single Variable

```sh
eas env:get --variable-name API_KEY --variable-environment production
```

- `--format long` for detailed output

## Create a Variable

```sh
eas env:create --name API_KEY --value "sk-123" --environment production --visibility plaintext --non-interactive
```

- `--visibility plaintext` — readable by anyone with project access
- `--visibility sensitive` — hidden in logs and UI, readable via CLI
- `--visibility secret` — write-only, never readable after creation
- `--type file` to store a file (e.g. `google-services.json`)
- `--scope account` to create at account level (shared across projects)
- `--force` to overwrite an existing variable with the same name
- `--environment production --environment preview` to add to multiple environments

## Update a Variable

```sh
eas env:update --variable-name API_KEY --variable-environment production --value "sk-456" --non-interactive
```

- `--name NEW_NAME` to rename
- `--visibility secret` to change visibility
- `--environment production --environment preview` to change which environments it belongs to

## Delete a Variable

```sh
eas env:delete --variable-name API_KEY --variable-environment production --non-interactive
```

## Sync with .env Files

```sh
eas env:pull --environment production                    # pull to .env.local (default)
eas env:pull --environment production --path .env        # pull to specific path
eas env:push --environment production                    # push from .env.local (default)
eas env:push --environment production --path .env        # push from specific path
eas env:push --environment production --force            # overwrite existing vars without confirmation
```

## Checking Env Vars Used in a Build

`build:view` does not include env var info. Extract it from the build logs:

```sh
curl -s "<LOG_FILE_URL>" | jq -r 'select(.msg | test("env|variable|export"; "i")) | "\(.phase): \(.msg)"'
```

- `SPIN_UP_BUILDER` phase — lists "Project environment variables" and "Environment secrets" set by EAS
- Each phase (e.g. `PREBUILD`, `EAGER_BUNDLE`) — shows which `.env` files were loaded and which vars were exported (e.g. `env: load .env.production .env` / `env: export VAR1 VAR2`)

## Docs

- [Environment variables in EAS](https://docs.expo.dev/eas/environment-variables/)

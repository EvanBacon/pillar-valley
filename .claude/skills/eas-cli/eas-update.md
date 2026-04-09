# EAS Update (OTA Updates)

## Publish an Update

```sh
eas update --branch production -m "Fix crash" --non-interactive --json
```

- `--channel production` to publish to a channel instead of a branch
- `--auto` to use current git branch name + commit message automatically
- `--rollout-percentage 10` to roll out to a subset of users
- `--environment production` to use server-side env vars for a specific environment
- `--skip-bundler --input-dir dist` to skip bundling and use pre-built output

## List / View Updates

```sh
eas update:list --all --json --non-interactive
```

- `--branch production` to filter by branch
- `-p ios` to filter by platform
- `--runtime-version 1.0.0` to filter by runtime version

```sh
eas update:view <GROUP_ID> --json
```

## Rollback

```sh
eas update:republish --branch production --group <GROUP_ID> --non-interactive --json  # republish an older update
eas update:roll-back-to-embedded --branch production -p all --non-interactive --json  # roll back to built-in update
```

## Delete an Update Group

```sh
eas update:delete <GROUP_ID> --non-interactive --json
```

## Branches & Channels

```sh
eas branch:list --json --non-interactive
eas branch:create <NAME> --json --non-interactive
eas branch:view <NAME> --json --non-interactive

eas channel:list --json --non-interactive
eas channel:create <NAME> --json --non-interactive
eas channel:view <NAME> --json --non-interactive
eas channel:edit <CHANNEL> --branch <BRANCH> --json --non-interactive  # point channel at a branch
eas channel:pause <CHANNEL> --non-interactive                          # stop sending updates
eas channel:resume <CHANNEL> --non-interactive                         # resume sending updates
```

## Fingerprints

Determine if a new build is needed or if an OTA update is sufficient.

```sh
eas fingerprint:generate -p ios --json    # generate fingerprint for current project
eas fingerprint:compare -p ios --json     # compare against builds/updates
```

## Gradual OTA Rollout

```sh
# Roll out to 5% first
eas update --branch production --rollout-percentage 5 -m "canary" --non-interactive --json

# After validation, increase to 100%
eas update --branch production --rollout-percentage 100 -m "full rollout" --non-interactive --json
```

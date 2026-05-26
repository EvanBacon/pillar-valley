---
name: resolve-apple-rejection
description: Check App Store rejections for the app, verify if the rejection is valid, and create a plan to fix the issue.
version: 1.0.0
license: MIT
---

Explore metadata:
- Find the bundle ID for the app. Likely `npx expo config` -> ios.bundleIdentifier
- Determine what version of the app the local codebase is on, and what version was rejected by Apple. Check store.config.json and app.json for local version numbers.

- Check binary status on Apple (requires users to have authenticated with session auth and 2fa previously): `exapple review:status --bundle-id <BUNDLE_ID> --username <APPLE_ID_EMAIL>`
- View rejection details: `exapple review:rejections --bundle-id <BUNDLE_ID> --username <APPLE_ID_EMAIL>`

Rejections:
- If the rejection is related to a specific feature, check the codebase for that feature and determine if it is implemented correctly. If not, create a plan to fix the issue and update the codebase accordingly. 
- Metadata issue: then attempt to fix it with `eas metadata` -- ensure you have the latest metadata with `eas metadata:pull` and then update the relevant fields. 
- Policy violation: review the relevant Apple guidelines and ensure that the app complies with them. If not, create a plan to address the violation and sharer info with the developer about how to reply. 

## Replying

Always be polite and pragmatic. Focus on the issue and how to fix it, not on blaming anyone. Do not draw comparisons to other apps or developers, Apple reserves the right to judge apps differently.

Do not assume that a policy violation means the app must be rejected, Apple judges intent more than functionality.

Print what the user should reply and any resources they should assemble.
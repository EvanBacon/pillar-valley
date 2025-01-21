export function redirectSystemPath({ path }: { path: string }): string {
  try {
    // Handle App Clip default page redirection.
    // If path matches https://appclip.apple.com/id?p=com.evanbacon.pillarvalley.clip (with any query parameters), then redirect to `/` path.
    const url = new URL(path);
    if (url.hostname === "appclip.apple.com") {
      return "/";
    }
    return path;
  } catch {
    return path;
  }
}

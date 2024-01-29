// Add global types for `expo?.modules?.ExpoAppIcon`
declare global {
  namespace Native {
    interface ExpoAppIcon {
      isSupported: boolean;
      /** Pass `null` to use the default icon. */
      setAlternateIcon: (iconName: string | null) => Promise<string | null>;
      /** @returns `null` if the default icon is being used. */
      getAlternateIcon: () => Promise<string | null>;
    }
  }

  interface NativeModules {
    ExpoAppIcon?: Native.ExpoAppIcon;
  }

  var expo:
    | {
        modules: NativeModules;
      }
    | undefined;
}

export default (expo?.modules?.ExpoAppIcon ?? {
  // If the native module is not available, return a mock that does nothing.
  isSupported: false,
  async setAlternateIcon() {
    return null;
  },
  async getAlternateIcon() {
    return null;
  },
}) satisfies Native.ExpoAppIcon;

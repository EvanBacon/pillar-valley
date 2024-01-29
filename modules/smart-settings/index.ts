declare global {
  namespace Native {
    interface SmartSettings {
      set(key: string, value: string | number, suite?: string): void;
    }
  }

  interface NativeModules {
    SmartSettings?: Native.SmartSettings;
  }
}

// TODO: Can we drop this?
export default (expo?.modules?.SmartSettings ?? {
  set() {},
}) satisfies Native.SmartSettings;

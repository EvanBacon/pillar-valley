// TODO: Can we drop this?
export default (expo?.modules?.SmartSettings ?? {
  set() {},
}) satisfies Native.SmartSettings;

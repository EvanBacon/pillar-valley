// import Slider from "@react-native-community/slider";
// import { Picker } from "@react-native-picker/picker";
import React from "react";
import { Settings, Switch, Text, TextInput } from "react-native";

export function useSetting<T = string>(key: string): [T, (value: T) => void] {
  const [value, setValue] = React.useState<T>(() => Settings.get(key));
  React.useEffect(() => {
    let isMounted = true;
    const callback = Settings.watchKeys(key, () => {
      if (isMounted) {
        setValue(Settings.get(key));
      }
    });
    return () => {
      Settings.clearWatch(callback);
      isMounted = false;
    };
  }, [key]);

  return [
    value,
    (value) => {
      Settings.set({ [key]: value });
      setValue(value);
    },
  ];
}

// export function SettingsSlider({
//   settingsKey,
//   ...props
// }: { settingsKey: string } & Omit<
//   React.ComponentProps<typeof Slider>,
//   "selectedValue" | "onValueChange"
// >) {
//   const [value, setValue] = useSetting<number>(settingsKey);
//   return <Slider {...props} value={value ?? 0} onValueChange={setValue} />;
// }

// export function SettingsRadioGroup({
//   settingsKey,
//   ...props
// }: { settingsKey: string } & Omit<
//   React.ComponentProps<typeof Picker>,
//   "selectedValue" | "onValueChange"
// >) {
//   const [value, setValue] = useSetting<string>(settingsKey);
//   return (
//     <Picker
//       {...props}
//       selectedValue={value ?? "option1"}
//       onValueChange={setValue}
//     />
//   );
// }

// SettingsRadioGroup.Item = Picker.Item;

export function SettingsSwitch({
  settingsKey,
  ...props
}: { settingsKey: string } & Omit<
  React.ComponentProps<typeof Switch>,
  "value" | "onValueChange"
>) {
  const [value, setValue] = useSetting<boolean>(settingsKey);
  return <Switch {...props} value={!!value} onValueChange={setValue} />;
}

export function SettingsTitle({
  settingsKey,
  ...props
}: { settingsKey: string } & Omit<
  React.ComponentProps<typeof Text>,
  "children"
>) {
  const [value] = useSetting<string>(settingsKey);
  return <Text {...props} children={value} />;
}

export function SettingsTextInput({
  settingsKey,
  ...props
}: { settingsKey: string } & Omit<
  React.ComponentProps<typeof TextInput>,
  "value" | "onChangeText"
>) {
  const [value, setValue] = useSetting<string>(settingsKey);
  return <TextInput {...props} value={value} onChangeText={setValue} />;
}

import * as Haptics from "expo-haptics";

import Icon from "./Icon";

import { useGlobalAudio } from "@/src/zustand/models";

function SoundButton() {
  const { enabled, toggleMuted } = useGlobalAudio();
  return (
    <Icon
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        toggleMuted();
      }}
      name={enabled ? "volume-up" : "volume-off"}
    />
  );
}

export default SoundButton;

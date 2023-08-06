import { useGlobalAudio } from "@/src/zustand/models";
import * as Haptics from "expo-haptics";

import Icon from "./Icon";

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

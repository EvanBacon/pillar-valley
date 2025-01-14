import * as Haptics from "@/lib/expo-haptics";

import Icon from "./Icon";

import { useGlobalAudio } from "@/zustand/models";

function SoundButton() {
  const { enabled, toggleMuted } = useGlobalAudio();
  return (
    <Icon
      onPress={() => {
        Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle.Light);
        toggleMuted();
      }}
      name={enabled ? "speaker.wave.3" : "speaker.slash"}
      fallback={enabled ? "volume-up" : "volume-off"}
    />
  );
}

export default SoundButton;

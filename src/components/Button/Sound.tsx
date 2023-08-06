import { useGlobalAudio } from "@/src/zustand/models";

import Icon from "./Icon";

function SoundButton() {
  const { enabled, toggleMuted } = useGlobalAudio();
  return (
    <Icon onPress={toggleMuted} name={enabled ? "volume-up" : "volume-off"} />
  );
}

export default SoundButton;

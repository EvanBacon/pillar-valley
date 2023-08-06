import { useGlobalAudio } from "@/src/rematch/models";

import Icon from "./Icon";

function SoundButton() {
  const { enabled, toggleMuted } = useGlobalAudio();
  return (
    <Icon onPress={toggleMuted} name={enabled ? "volume-up" : "volume-off"} />
  );
}

export default SoundButton;

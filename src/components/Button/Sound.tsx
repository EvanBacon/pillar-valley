import Icon from "./Icon";

import { useGlobalAudio } from "@/src/rematch/models";

function SoundButton() {
  const { muted, toggleMuted } = useGlobalAudio();

  return (
    <Icon onPress={toggleMuted} name={muted ? "volume-off" : "volume-up"} />
  );
}

export default SoundButton;

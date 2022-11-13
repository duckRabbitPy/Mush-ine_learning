const audioFiles = {
  click: "/click.mp3",
  correct: "/correct.mp3",
  incorrect: "/incorrect.mp3",
};

type SoundOptions = keyof typeof audioFiles;

export function useSound(sound: SoundOptions) {
  const audioElement =
    typeof Audio !== "undefined" ? new Audio(audioFiles[sound]) : undefined;
  return audioElement;
}

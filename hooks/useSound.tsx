const audioFiles = {
  clickSound: "/click.mp3",
  correctSound: "/correct.mp3",
  incorrectSound: "/incorrect.mp3",
  startSound: "/game-start.wav",
  saveSound: "/save.mp3",
};

export function useSound() {
  return Object.entries(audioFiles).reduce((acc, curr) => {
    acc[curr[0] as keyof typeof acc] = createSound(curr[1]);

    return acc;
  }, {} as Record<keyof typeof audioFiles, HTMLAudioElement | undefined>);
}

function createSound(path: string) {
  return typeof Audio !== "undefined" ? new Audio(path) : undefined;
}

export default useSound;

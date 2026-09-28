// Thin wrapper around expo-audio for the Sound tab. See data/sounds.ts for
// why SOUND_ASSETS is empty in this port — play() no-ops until real .wav
// files are bundled and registered there.
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { SOUND_ASSETS, SoundFile } from '../data/sounds';

export function useNowPlaying() {
  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);

  const play = (snd: SoundFile) => {
    const asset = SOUND_ASSETS[snd.id];
    if (!asset) return false;
    player.replace(asset);
    player.play();
    return true;
  };
  const toggle = () => (status.playing ? player.pause() : player.play());
  const stop = () => {
    player.pause();
    player.seekTo(0);
  };

  return {
    playing: status.playing,
    currentTime: status.currentTime ?? 0,
    duration: status.duration ?? 0,
    play,
    toggle,
    stop,
    hasAudio: (id: string) => !!SOUND_ASSETS[id],
  };
}

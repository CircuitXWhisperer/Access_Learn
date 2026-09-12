import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import type Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';

type VideoJsPlayerProps = {
  src: string;
  title: string;
  poster?: string;
  onReady?: (player: Player) => void;
};

export function VideoJsPlayer({ src, title, poster, onReady }: VideoJsPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    if (!containerRef.current || playerRef.current) return;

    const videoElement = document.createElement('video-js');
    videoElement.classList.add('video-js', 'vjs-big-play-centered');
    containerRef.current.appendChild(videoElement);

    const player = videojs(videoElement, {
      controls: true,
      responsive: true,
      fluid: true,
      autoplay: false,
      preload: 'metadata',
      poster,
      playbackRates: [0.75, 1, 1.25, 1.5, 2],
      controlBar: {
        volumePanel: { inline: false },
        children: [
          'playToggle',
          'progressControl',
          'currentTimeDisplay',
          'timeDivider',
          'durationDisplay',
          'volumePanel',
          'playbackRateMenuButton',
          'fullscreenToggle',
        ],
      },
      sources: [{ src, type: 'video/mp4' }],
    });

    playerRef.current = player;
    onReady?.(player);

    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) playerRef.current.dispose();
      playerRef.current = null;
    };
  }, [onReady, src]);

  return <div className="reference-video-player" data-vjs-player ref={containerRef} aria-label={title} />;
}

// Pemutar YouTube (IFrame API) yang disembunyikan; kontrolnya memakai tombol El Music.
let player = null;
let ready = false;
let initPromise = null;
let token = 0;

export const yt = { active: false };

function loadApi() {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) return resolve();
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prev) prev();
      resolve();
    };
    if (!document.getElementById('yt-api')) {
      const s = document.createElement('script');
      s.id = 'yt-api';
      s.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(s);
    }
  });
}

function init(handlers) {
  if (initPromise) return initPromise;
  initPromise = loadApi().then(
    () =>
      new Promise((resolve) => {
        player = new window.YT.Player('yt-holder', {
          width: '200',
          height: '200',
          playerVars: { playsinline: 1, controls: 0, disablekb: 1, fs: 0, rel: 0, origin: window.location.origin },
          events: {
            onReady: () => {
              ready = true;
              resolve();
            },
            onStateChange: (e) => handlers.state && handlers.state(e.data),
            onError: (e) => handlers.error && handlers.error(e.data),
          },
        });
      })
  );
  return initPromise;
}

export async function ytPlay(videoId, handlers) {
  const mine = ++token;
  yt.active = true;
  await init(handlers);
  if (mine !== token) return;
  player.loadVideoById(videoId);
}

export const ytPause = () => ready && player.pauseVideo();
export const ytResume = () => ready && player.playVideo();
export const ytStop = () => {
  token++;
  yt.active = false;
  if (ready) {
    try {
      player.stopVideo();
    } catch {}
  }
};
export const ytSeek = (t) => ready && player.seekTo(t, true);
export const ytVolume = (v, muted) => {
  if (!ready) return;
  player.setVolume(Math.round(v * 100));
  if (muted) player.mute();
  else player.unMute();
};
export const ytState = () => (ready ? player.getPlayerState() : -1);
export const ytTime = () =>
  ready
    ? { time: player.getCurrentTime() || 0, duration: player.getDuration() || 0 }
    : { time: 0, duration: 0 };

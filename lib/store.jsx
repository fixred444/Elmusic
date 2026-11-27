'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from './auth';
import { yt, ytWarm, ytPlay, ytPause, ytResume, ytStop, ytSeek, ytVolume, ytState, ytTime } from './yt';

const AppCtx = createContext(null);
const TimeCtx = createContext({ time: 0, duration: 0 });
export const useApp = () => useContext(AppCtx);
export const useTime = () => useContext(TimeCtx);

let _audio = null;
const getAudio = () => {
  if (typeof window === 'undefined') return null;
  if (!_audio) {
    _audio = new Audio();
    _audio.preload = 'auto';
  }
  return _audio;
};

const load = (k, d) => {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : d;
  } catch {
    return d;
  }
};
const save = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
};
const uid = () => Math.random().toString(36).slice(2, 9);
const noLocal = (list) => list.filter((t) => !t.local);

function TimeProvider({ children }) {
  const [s, setS] = useState({ time: 0, duration: 0 });
  useEffect(() => {
    const a = getAudio();
    const upd = () => {
      if (yt.active) return;
      setS({ time: a.currentTime || 0, duration: isFinite(a.duration) ? a.duration : 0 });
    };
    const evs = ['timeupdate', 'loadedmetadata', 'durationchange', 'emptied'];
    evs.forEach((e) => a.addEventListener(e, upd));
    const iv = setInterval(() => {
      if (!yt.active) return;
      const n = ytTime();
      setS((p) => (p.time === n.time && p.duration === n.duration ? p : n));
    }, 250);
    return () => {
      evs.forEach((e) => a.removeEventListener(e, upd));
      clearInterval(iv);
    };
  }, []);
  return <TimeCtx.Provider value={s}>{children}</TimeCtx.Provider>;
}

export function AppProvider({ children }) {
  const { uid } = useAuth();
  // tamu memakai kunci lama; tiap akun punya penyimpanan sendiri di perangkat ini
  const keyOf = (n) => (uid === 'guest' ? `elmusic:${n}` : `elmusic:u:${uid}:${n}`);
  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [error, setError] = useState('');
  const [volume, setVolumeState] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState('off');
  const [liked, setLiked] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [recent, setRecent] = useState([]);
  const [locals, setLocals] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [npTab, setNpTab] = useState('lirik');
  const [menu, setMenu] = useState(null);
  const [hydrated, setHydrated] = useState(null); // berisi uid yang datanya sudah dimuat

  const st = useRef({});
  st.current = { queue, index, repeat, shuffle, volume, muted };
  const nextRef = useRef(() => {});
  const wantRef = useRef(false); // true = pengguna memang ingin lagu berjalan
  const ytHandlers = useRef({
    state: (s) => {
      if (!yt.active) return;
      if (s === 1) {
        setPlaying(true);
        setBuffering(false);
      } else if (s === 2) {
        setPlaying(false);
        // saat aplikasi di latar, pemutar YouTube kadang menjeda sendiri: lanjutkan bila pengguna tidak menjeda
        if (document.hidden && wantRef.current) {
          setTimeout(() => {
            if (wantRef.current && yt.active) ytResume();
          }, 150);
        }
      }
      else if (s === 3) setBuffering(true);
      else if (s === 0) {
        setPlaying(false);
        nextRef.current(true);
      }
    },
    error: (code) => {
      if (!yt.active) return;
      setBuffering(false);
      setPlaying(false);
      setError(
        code === 101 || code === 150
          ? 'Pemilik video melarang diputar di luar YouTube. Coba lagu lain.'
          : code === 153
          ? 'YouTube menolak pemutar tertanam (kode 153).'
          : code === 100
          ? 'Video tidak ditemukan.'
          : `Video tidak bisa diputar (kode ${code}).`
      );
    },
  });

  const current = index >= 0 ? queue[index] : null;

  // ---- hydrate + persist
  useEffect(() => {
    // ganti akun: hentikan pemutaran dan muat data milik akun ini
    const a = getAudio();
    if (a) a.pause();
    ytStop();
    setQueue([]);
    setIndex(-1);
    setPlaying(false);
    setExpanded(false);
    setLiked(load(keyOf('liked'), []));
    setPlaylists(load(keyOf('playlists'), []));
    setRecent(load(keyOf('recent'), []));
    setVolumeState(load('elmusic:volume', 0.8));
    setHydrated(uid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);
  const ready = hydrated === uid;
  useEffect(() => { if (ready) save(keyOf('liked'), noLocal(liked)); }, [liked, ready]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (ready) save(keyOf('playlists'), playlists.map((p) => ({ ...p, tracks: noLocal(p.tracks) })));
  }, [playlists, ready]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (ready) save(keyOf('recent'), noLocal(recent)); }, [recent, ready]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (ready) save('elmusic:volume', volume); }, [volume, ready]);

  // ---- audio element
  useEffect(() => {
    const a = getAudio();
    const h = {
      play: () => setPlaying(true),
      pause: () => {
        setPlaying(false);
        if (document.hidden && wantRef.current && !yt.active && !a.ended) {
          setTimeout(() => {
            if (wantRef.current && !yt.active) a.play().catch(() => {});
          }, 150);
        }
      },
      waiting: () => setBuffering(true),
      playing: () => setBuffering(false),
      canplay: () => setBuffering(false),
      ended: () => nextRef.current(true),
      error: () => {
        const { queue, index } = st.current;
        const t = queue[index];
        if (t && t.fallback && !a.src.includes('/api/stream/')) {
          a.src = t.fallback;
          a.load();
          a.play().catch(() => {});
          return;
        }
        setBuffering(false);
        setPlaying(false);
        if (a.getAttribute('src')) setError('Lagu ini tidak bisa diputar');
      },
    };
    Object.entries(h).forEach(([e, f]) => a.addEventListener(e, f));
    return () => Object.entries(h).forEach(([e, f]) => a.removeEventListener(e, f));
  }, []);

  useEffect(() => {
    const a = getAudio();
    if (!a) return;
    a.volume = volume;
    a.muted = muted;
    ytVolume(volume, muted);
  }, [volume, muted]);

  const loadAt = useCallback((q, i) => {
    const a = getAudio();
    const t = q[i];
    if (!a || !t) return;
    wantRef.current = true;
    setQueue(q);
    setIndex(i);
    setError('');
    if (t.yt) {
      a.pause();
      setBuffering(true);
      ytPlay(t.yt, ytHandlers.current)
        .then(() => ytVolume(st.current.volume, st.current.muted))
        .catch(() => {
          setBuffering(false);
          setError('Gagal memuat pemutar YouTube');
        });
    } else {
      ytStop();
      a.src = t.preview;
      a.load();
      const p = a.play();
      if (p) p.catch(() => setPlaying(false));
    }
    setRecent((prev) => [t, ...prev.filter((x) => x.id !== t.id)].slice(0, 20));
  }, []);

  const play = useCallback(
    (track, list) => {
      const l = list && list.length ? list : [track];
      const i = Math.max(0, l.findIndex((t) => t.id === track.id));
      loadAt(l, i);
    },
    [loadAt]
  );

  const next = useCallback(
    (auto = false) => {
      const a = getAudio();
      const { queue, index, repeat, shuffle } = st.current;
      if (!a || !queue.length) return;
      if (auto && repeat === 'one') {
        if (yt.active) {
          ytSeek(0);
          ytResume();
        } else {
          a.currentTime = 0;
          a.play().catch(() => {});
        }
        return;
      }
      let i;
      if (shuffle && queue.length > 1) {
        do {
          i = Math.floor(Math.random() * queue.length);
        } while (i === index);
      } else {
        i = index + 1;
      }
      if (i >= queue.length) {
        if (repeat === 'all' || !auto) i = 0;
        else {
          wantRef.current = false;
          a.pause();
          a.currentTime = 0;
          ytStop();
          return;
        }
      }
      loadAt(queue, i);
    },
    [loadAt]
  );
  nextRef.current = next;

  const prev = useCallback(() => {
    const a = getAudio();
    const { queue, index } = st.current;
    if (!a || !queue.length) return;
    const cur = yt.active ? ytTime().time : a.currentTime;
    if (cur > 3) {
      if (yt.active) ytSeek(0);
      else a.currentTime = 0;
      return;
    }
    loadAt(queue, index <= 0 ? queue.length - 1 : index - 1);
  }, [loadAt]);

  const toggle = useCallback(() => {
    const a = getAudio();
    if (!a || !st.current.queue.length) return;
    if (yt.active) {
      if (ytState() === 1) {
        wantRef.current = false;
        ytPause();
      } else {
        wantRef.current = true;
        ytResume();
      }
      return;
    }
    if (a.paused) {
      wantRef.current = true;
      a.play().catch(() => {});
    } else {
      wantRef.current = false;
      a.pause();
    }
  }, []);

  const seek = useCallback((t) => {
    if (yt.active) {
      ytSeek(t);
      return;
    }
    const a = getAudio();
    if (a && isFinite(t)) a.currentTime = t;
  }, []);

  const warmYt = useCallback(() => {
    ytWarm(ytHandlers.current).catch(() => {});
  }, []);

  const jumpTo = useCallback((i) => loadAt(st.current.queue, i), [loadAt]);

  const playNext = useCallback(
    (t) => {
      const { queue, index } = st.current;
      if (index < 0) return loadAt([t], 0);
      const q = [...queue];
      q.splice(index + 1, 0, t);
      setQueue(q);
    },
    [loadAt]
  );
  const addToQueue = useCallback(
    (t) => {
      const { queue, index } = st.current;
      if (index < 0) return loadAt([t], 0);
      setQueue([...queue, t]);
    },
    [loadAt]
  );

  const setVolume = useCallback((v) => {
    setVolumeState(v);
    setMuted(false);
  }, []);
  const toggleShuffle = useCallback(() => setShuffle((s) => !s), []);
  const cycleRepeat = useCallback(
    () => setRepeat((r) => (r === 'off' ? 'all' : r === 'all' ? 'one' : 'off')),
    []
  );

  // ---- library
  const likedIds = useMemo(() => new Set(liked.map((t) => t.id)), [liked]);
  const toggleLike = useCallback((t) => {
    if (t.local) return;
    setLiked((l) => (l.some((x) => x.id === t.id) ? l.filter((x) => x.id !== t.id) : [t, ...l]));
  }, []);

  const createPlaylist = useCallback((name, track) => {
    const id = uid();
    setPlaylists((p) => [
      ...p,
      { id, name: name.trim() || 'Playlist baru', tracks: track && !track.local ? [track] : [] },
    ]);
    return id;
  }, []);
  const addToPlaylist = useCallback((pid, t) => {
    if (t.local) return;
    setPlaylists((p) =>
      p.map((x) => (x.id === pid && !x.tracks.some((y) => y.id === t.id) ? { ...x, tracks: [...x.tracks, t] } : x))
    );
  }, []);
  const removeFromPlaylist = useCallback((pid, tid) => {
    setPlaylists((p) => p.map((x) => (x.id === pid ? { ...x, tracks: x.tracks.filter((y) => y.id !== tid) } : x)));
  }, []);
  const renamePlaylist = useCallback((pid, name) => {
    setPlaylists((p) => p.map((x) => (x.id === pid ? { ...x, name: name.trim() || x.name } : x)));
  }, []);
  const deletePlaylist = useCallback((pid) => setPlaylists((p) => p.filter((x) => x.id !== pid)), []);

  const addFiles = useCallback(
    (fileList) => {
      const files = Array.from(fileList || []).filter(
        (f) => f.type.startsWith('audio/') || /\.(mp3|m4a|wav|ogg|flac|aac|opus)$/i.test(f.name)
      );
      if (!files.length) return;
      const tracks = files.map((f) => ({
        id: `local-${uid()}`,
        title: f.name.replace(/\.[^.]+$/, ''),
        artist: 'Dari perangkat',
        album: 'File lokal',
        art: null,
        preview: URL.createObjectURL(f),
        local: true,
      }));
      setLocals((l) => [...tracks, ...l]);
      loadAt(tracks, 0);
    },
    [loadAt]
  );

  const openMenu = useCallback((track, rect, extra = {}) => {
    setMenu({
      track,
      rect: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right },
      ...extra,
    });
  }, []);
  const closeMenu = useCallback(() => setMenu(null), []);

  // ---- media session
  useEffect(() => {
    if (!current || typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: current.title,
        artist: current.artist,
        album: current.album,
        artwork: current.art ? [{ src: current.art, sizes: '600x600', type: 'image/jpeg' }] : [],
      });
      navigator.mediaSession.setActionHandler('play', () => {
        wantRef.current = true;
        if (yt.active) ytResume();
        else getAudio().play().catch(() => {});
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        wantRef.current = false;
        if (yt.active) ytPause();
        else getAudio().pause();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => nextRef.current(false));
      navigator.mediaSession.setActionHandler('previoustrack', () => prev());
    } catch {}
  }, [current, prev]);

  // ---- keyboard
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return;
      if (e.code === 'Space' && tag !== 'BUTTON' && tag !== 'A') {
        e.preventDefault();
        toggle();
      } else if (e.shiftKey && e.key === 'ArrowRight') next(false);
      else if (e.shiftKey && e.key === 'ArrowLeft') prev();
      else if (e.key === 'Escape') {
        setExpanded(false);
        setMenu(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle, next, prev]);

  // ---- jembatan ke aplikasi Android (Flutter WebView)
  useEffect(() => {
    window.elmusic = {
      play: () => {
        if (!st.current.queue.length) return;
        wantRef.current = true;
        if (yt.active) ytResume();
        else getAudio().play().catch(() => {});
      },
      pause: () => {
        wantRef.current = false;
        if (yt.active) ytPause();
        else getAudio().pause();
      },
      next: () => nextRef.current(false),
      prev: () => prev(),
    };
  }, [prev]);
  useEffect(() => {
    if (!window.ElMusic || !window.ElMusic.postMessage) return;
    try {
      window.ElMusic.postMessage(
        JSON.stringify({ playing, title: current?.title || '', artist: current?.artist || '', art: current?.art || '' })
      );
    } catch {}
  }, [playing, current]);

  const value = {
    queue, index, current, playing, buffering, error,
    volume, muted, shuffle, repeat,
    liked, likedIds, playlists, recent, locals,
    expanded, menu, npTab, setNpTab,
    play, next, prev, toggle, seek, jumpTo, playNext, addToQueue,
    setVolume, setMuted, toggleShuffle, cycleRepeat,
    toggleLike, createPlaylist, addToPlaylist, removeFromPlaylist, renamePlaylist, deletePlaylist,
    addFiles, setExpanded, openMenu, closeMenu, warmYt,
  };

  return (
    <AppCtx.Provider value={value}>
      <TimeProvider>{children}</TimeProvider>
    </AppCtx.Provider>
  );
}

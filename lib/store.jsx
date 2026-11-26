'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

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
    const upd = () =>
      setS({ time: a.currentTime || 0, duration: isFinite(a.duration) ? a.duration : 0 });
    const evs = ['timeupdate', 'loadedmetadata', 'durationchange', 'emptied'];
    evs.forEach((e) => a.addEventListener(e, upd));
    return () => evs.forEach((e) => a.removeEventListener(e, upd));
  }, []);
  return <TimeCtx.Provider value={s}>{children}</TimeCtx.Provider>;
}

export function AppProvider({ children }) {
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
  const [menu, setMenu] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  const st = useRef({});
  st.current = { queue, index, repeat, shuffle };
  const nextRef = useRef(() => {});

  const current = index >= 0 ? queue[index] : null;

  // ---- hydrate + persist
  useEffect(() => {
    setLiked(load('elmusic:liked', []));
    setPlaylists(load('elmusic:playlists', []));
    setRecent(load('elmusic:recent', []));
    setVolumeState(load('elmusic:volume', 0.8));
    setHydrated(true);
  }, []);
  useEffect(() => { if (hydrated) save('elmusic:liked', noLocal(liked)); }, [liked, hydrated]);
  useEffect(() => {
    if (hydrated) save('elmusic:playlists', playlists.map((p) => ({ ...p, tracks: noLocal(p.tracks) })));
  }, [playlists, hydrated]);
  useEffect(() => { if (hydrated) save('elmusic:recent', noLocal(recent)); }, [recent, hydrated]);
  useEffect(() => { if (hydrated) save('elmusic:volume', volume); }, [volume, hydrated]);

  // ---- audio element
  useEffect(() => {
    const a = getAudio();
    const h = {
      play: () => setPlaying(true),
      pause: () => setPlaying(false),
      waiting: () => setBuffering(true),
      playing: () => setBuffering(false),
      canplay: () => setBuffering(false),
      ended: () => nextRef.current(true),
      error: () => {
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
  }, [volume, muted]);

  const loadAt = useCallback((q, i) => {
    const a = getAudio();
    const t = q[i];
    if (!a || !t) return;
    setQueue(q);
    setIndex(i);
    setError('');
    a.src = t.preview;
    a.load();
    const p = a.play();
    if (p) p.catch(() => setPlaying(false));
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
        a.currentTime = 0;
        a.play().catch(() => {});
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
          a.pause();
          a.currentTime = 0;
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
    if (a.currentTime > 3) {
      a.currentTime = 0;
      return;
    }
    loadAt(queue, index <= 0 ? queue.length - 1 : index - 1);
  }, [loadAt]);

  const toggle = useCallback(() => {
    const a = getAudio();
    if (!a || !st.current.queue.length) return;
    if (a.paused) a.play().catch(() => {});
    else a.pause();
  }, []);

  const seek = useCallback((t) => {
    const a = getAudio();
    if (a && isFinite(t)) a.currentTime = t;
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
      navigator.mediaSession.setActionHandler('play', () => getAudio().play().catch(() => {}));
      navigator.mediaSession.setActionHandler('pause', () => getAudio().pause());
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

  const value = {
    queue, index, current, playing, buffering, error,
    volume, muted, shuffle, repeat,
    liked, likedIds, playlists, recent, locals,
    expanded, menu,
    play, next, prev, toggle, seek, jumpTo, playNext, addToQueue,
    setVolume, setMuted, toggleShuffle, cycleRepeat,
    toggleLike, createPlaylist, addToPlaylist, removeFromPlaylist, renamePlaylist, deletePlaylist,
    addFiles, setExpanded, openMenu, closeMenu,
  };

  return (
    <AppCtx.Provider value={value}>
      <TimeProvider>{children}</TimeProvider>
    </AppCtx.Provider>
  );
}

'use client';

import TrackRow from './TrackRow';

export default function TrackList({ tracks, onRemove }) {
  return (
    <div className="tracklist">
      {tracks.map((t, i) => (
        <TrackRow key={`${t.id}-${i}`} track={t} list={tracks} index={i} onRemove={onRemove ? () => onRemove(t) : undefined} />
      ))}
    </div>
  );
}

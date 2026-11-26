import Art from './Art';

// Sampul playlist: 1 gambar, mosaik 2x2 bila ada >= 4 lagu berbeda, atau placeholder.
export default function Cover({ tracks = [], id = '', className = '' }) {
  const arts = [];
  const small = {};
  for (const t of tracks) if (t.art && !arts.includes(t.art)) { arts.push(t.art); small[t.art] = t.artSm || t.art; }
  if (arts.length >= 4) {
    return (
      <div className={`cover mosaic ${className}`}>
        {arts.slice(0, 4).map((a) => (
          <img key={a} src={small[a]} alt="" loading="lazy" />
        ))}
      </div>
    );
  }
  return (
    <div className={`cover ${className}`}>
      <Art src={arts[0]} id={id} />
    </div>
  );
}

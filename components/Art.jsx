import { hueOf } from '@/lib/util';
import { IconNote } from './Icons';

export default function Art({ src, id = '', className = '', alt = '' }) {
  if (src) {
    return <img className={`art ${className}`} src={src} alt={alt} loading="lazy" decoding="async" />;
  }
  const h = hueOf(id);
  return (
    <div
      className={`art ph ${className}`}
      style={{ background: `linear-gradient(145deg, hsl(${h} 42% 34%), hsl(${(h + 50) % 360} 46% 14%))` }}
    >
      <IconNote size={28} />
    </div>
  );
}

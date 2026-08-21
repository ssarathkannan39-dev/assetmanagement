export default function BrandMark({ compact = false }) {
  return <div className={`brand-mark ${compact ? 'brand-mark-compact' : ''}`} aria-label="PSG Asset">
    <span className="brand-mark-glyph">◆</span>
    <span className="brand-mark-copy"><strong>PSG <em>ASSET</em></strong><small>Inventory control</small></span>
  </div>;
}

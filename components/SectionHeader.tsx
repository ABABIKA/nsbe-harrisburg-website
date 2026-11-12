type SectionHeaderProps = { eyebrow: string; title: string; description?: string };

export function SectionHeader({ eyebrow, title, description }: SectionHeaderProps) {
  return <header className="section-heading"><p className="eyebrow">{eyebrow}</p><h2 className="section-title">{title}</h2>{description ? <p className="section-copy">{description}</p> : null}</header>;
}

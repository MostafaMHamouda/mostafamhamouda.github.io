type QuestHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
};

export const QuestHeader = ({ eyebrow, title, subtitle, align = 'left' }: QuestHeaderProps) => (
  <header className={align === 'center' ? 'text-center' : 'text-left'}>
    {eyebrow ? (
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-sky-200/80">{eyebrow}</p>
    ) : null}
    <h1 className="font-display text-4xl font-semibold leading-tight text-white">{title}</h1>
    {subtitle ? <p className="mt-3 text-base leading-7 text-slate-200/82">{subtitle}</p> : null}
  </header>
);

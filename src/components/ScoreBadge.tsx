type ScoreBadgeProps = {
  score: number;
};

export const ScoreBadge = ({ score }: ScoreBadgeProps) => (
  <div className="inline-flex items-center gap-2 rounded-full border border-sky-200/20 bg-sky-300/10 px-4 py-2 text-sm font-semibold text-sky-100 shadow-glow-blue">
    <span className="h-2 w-2 rounded-full bg-sky-300" />
    Score {score}
  </div>
);

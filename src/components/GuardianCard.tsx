type GuardianCardProps = {
  guardian: string;
  world: string;
  message?: string;
};

export const GuardianCard = ({ guardian, world, message }: GuardianCardProps) => (
  <div className="glass-panel rounded-3xl p-5">
    <p className="text-xs uppercase tracking-[0.3em] text-slate-300/70">{world}</p>
    <h3 className="mt-2 text-2xl font-semibold text-white">{guardian}</h3>
    {message ? <p className="mt-3 text-sm leading-6 text-slate-200/78">{message}</p> : null}
  </div>
);

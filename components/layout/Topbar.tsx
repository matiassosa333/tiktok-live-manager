type TopbarProps = {
  title: string;
  description: string;
};

export function Topbar({ title, description }: TopbarProps) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    </div>
  );
}
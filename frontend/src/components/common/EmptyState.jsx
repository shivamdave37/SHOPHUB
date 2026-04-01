export default function EmptyState({ title, description }) {
  return (
    <div className="card p-8 text-center">
      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-slate-600">{description}</p>
    </div>
  );
}

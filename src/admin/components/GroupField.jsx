export function GroupField({ name, legend, hint, error, children }) {
  return (
    <fieldset data-field={name} className="min-w-0">
      <legend className="mb-1.5 text-sm font-semibold text-ink-800">{legend}</legend>
      {hint ? <p className="mb-2 text-sm text-ink-600">{hint}</p> : null}
      {children}
      {error ? <p role="alert" className="mt-1.5 text-sm font-medium text-danger-600">{error}</p> : null}
    </fieldset>
  );
}

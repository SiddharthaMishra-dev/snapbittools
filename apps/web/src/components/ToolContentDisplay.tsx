interface ToolContentDisplayProps {
  title: string;
  intro: string;
  benefits: string[];
  useCases: string[];
}

export default function ToolContentDisplay({ title, intro, benefits, useCases }: ToolContentDisplayProps) {
  return (
    <div className="w-full max-w-7xl mx-auto mt-8 mb-12 space-y-8">
      <h2 className="text-xl md:text-xl font-bold text-theme-heading leading-tight">{title}</h2>

      <div className="prose max-w-none">
        <p className="text-sm text-theme-muted leading-relaxed whitespace-pre-wrap">{intro}</p>
      </div>

      {benefits && benefits.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-theme-muted">Key Benefits</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-center space-x-3">
                <span className="text-brand-primary font-bold text-sm pt-0.5">✓</span>
                <span className="text-theme-muted text-sm">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {useCases && useCases.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-theme-muted">Common Use Cases</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {useCases.map((useCase, index) => (
              <li key={index} className="flex items-center space-x-3">
                <span className="text-brand-primary font-bold text-lg pt-0.5">✓</span>
                <span className="text-theme-muted text-sm">{useCase}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

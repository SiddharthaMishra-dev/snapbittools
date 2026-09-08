import { IconLock } from "@tabler/icons-react";
import FAQ from "./FAQ";

interface Feature {
  title: string;
  description: string;
  icon: React.ElementType;
}

interface Step {
  title: string;
  description: string;
}

interface ToolInfoProps {
  title: string;
  description: string;
  features: Feature[];
  steps: Step[];
  privacyInfo?: string;
  faqs?: { question: string; answer: string }[];
}

export default function ToolInfo({ privacyInfo, faqs }: ToolInfoProps) {
  return (
    <div className="w-full max-w-7xl mx-auto mt-2 space-y-6 pb-6">
      {faqs && faqs.length > 0 && <FAQ faqs={faqs} />}

      <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-4 bg-brand-light/10 dark:bg-brand-dark/10 border border-brand-dark/10 rounded-lg">
        <div className="flex items-start space-x-4">
          <div className="mt-1">
            <IconLock className="text-brand-primary w-8 h-8" />
          </div>
          <div>
            <h3 className="text-md font-bold text-gray-700 mb-2">100% private | Nothing leaves your device</h3>
            <p className="text-gray-400 text-sm max-w-xl">
              {privacyInfo ||
                "Your data never leaves your browser. All processing is done locally on your machine, ensuring maximum security and speed. No server calls, no tracking, no risk."}
            </p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <div className="px-6 py-3 bg-linear-to-b from-brand-primary to-brand-hover ring-2 ring-brand-primary/80 shadow-lg text-white rounded-full text-sm font-semibold border border-brand-dark/10">
            Privacy Guaranteed
          </div>
        </div>
      </div>
    </div>
  );
}

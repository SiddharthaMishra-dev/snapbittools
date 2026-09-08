import { IconChevronDown } from "@tabler/icons-react";
import { useState } from "react";

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-[var(--theme-faq-border)] last:border-0 cursor-pointer">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left group transition-all"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-semibold text-theme-muted group-hover:text-brand-primary transition-colors">{question}</span>
        <IconChevronDown
          className={`w-5 h-5 text-theme-muted group-hover:text-brand-primary transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 pb-6" : "max-h-0"}`}>
        <p className="text-theme-body leading-relaxed text-sm">{answer}</p>
      </div>
    </div>
  );
}

interface FAQProps {
  faqs: { question: string; answer: string }[];
}

export default function FAQ({ faqs }: FAQProps) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <h2 className="text-xl font-bold text-theme-heading">Frequently Asked Questions</h2>
      </div>
      <div className="px-4">
        {faqs.map((faq, index) => (
          <FAQItem key={index} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </div>
  );
}

import { IconChevronDown } from "@tabler/icons-react";
import { useState } from "react";

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="border-b border-gray-700/50 last:border-0"
      itemScope
      itemProp="mainEntity"
      itemType="https://schema.org/Question"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left group transition-all"
        aria-expanded={isOpen}
      >
        <span
          className="text-lg font-semibold text-gray-100 group-hover:text-brand-primary transition-colors"
          itemProp="name"
        >
          {question}
        </span>
        <IconChevronDown
          className={`w-5 h-5 text-gray-400 group-hover:text-brand-primary transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 pb-6" : "max-h-0"
        }`}
        itemScope
        itemProp="acceptedAnswer"
        itemType="https://schema.org/Answer"
      >
        <p
          className="text-gray-400 leading-relaxed"
          itemProp="text"
        >
          {answer}
        </p>
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
    <div
      className="mt-16 space-y-8"
      itemScope
      itemType="https://schema.org/FAQPage"
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-brand-dark/20 rounded-full flex items-center justify-center text-brand-primary font-bold border border-brand-primary/20">
          ?
        </div>
        <h2 className="text-2xl font-bold text-gray-100">Frequently Asked Questions</h2>
      </div>
      <div className="bg-gray-800/20 border border-gray-700/50 rounded-2xl px-6 md:px-8">
        {faqs.map((faq, index) => (
          <FAQItem
            key={index}
            question={faq.question}
            answer={faq.answer}
          />
        ))}
      </div>
    </div>
  );
}

import { IconLock } from "@tabler/icons-react";
import { motion, easeInOut } from "motion/react";
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
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
        duration: 0.6,
        ease: easeInOut,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: easeInOut,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-7xl mx-auto mt-2 space-y-6 pb-6"
    >
      {/* FAQs */}
      {faqs && faqs.length > 0 && <FAQ faqs={faqs} />}

      {/* Privacy & Security */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col md:flex-row items-center justify-between gap-8 p-4 bg-brand-dark/10 border border-brand-dark/20 rounded-lg"
      >
        <div className="flex items-start space-x-4">
          <div className="mt-1">
            <IconLock className="text-brand-primary w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">100% Client-Side & Private</h3>
            <p className="text-gray-400 text-sm max-w-xl">
              {privacyInfo ||
                "Your data never leaves your browser. All processing is done locally on your machine, ensuring maximum security and speed. No server calls, no tracking, no risk."}
            </p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <div className="px-6 py-3 bg-brand-dark/20 text-brand-primary rounded-full text-sm font-semibold border border-brand-dark/30">
            Privacy Guaranteed
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

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

export default function ToolInfo({
  title,
  description,
  features,
  steps,
  privacyInfo,
  faqs,
}: ToolInfoProps) {
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

  const featureVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: easeInOut,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-5xl mx-auto mt-20 space-y-16 pb-16"
    >
      <motion.div
        variants={itemVariants}
        className="text-center space-y-4"
      >
        <h2 className="text-3xl font-bold text-gray-100">What is {title}?</h2>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">{description}</p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            variants={featureVariants}
            className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-brand-primary/50 transition-colors group"
          >
            <div className="w-12 h-12 bg-brand-dark/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-brand-dark/30 transition-colors">
              <feature.icon className="text-brand-primary w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-100 mb-2">{feature.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* How it Works */}
      <motion.div
        variants={itemVariants}
        className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-8 md:p-12"
      >
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center text-white font-bold">
            ?
          </div>
          <h2 className="text-2xl font-bold text-gray-100">How to use {title}</h2>
        </div>
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={featureVariants}
              className="relative"
            >
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-5 left-1/2 w-full h-[2px] bg-gray-700 -z-10" />
              )}
              <div className="space-y-4">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-gray-300 font-bold border-2 border-gray-600">
                  {index + 1}
                </div>
                <h4 className="text-lg font-semibold text-gray-100">{step.title}</h4>
                <p className="text-gray-400 text-sm">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* FAQs */}
      {faqs && faqs.length > 0 && <FAQ faqs={faqs} />}

      {/* Privacy & Security */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 bg-brand-dark/10 border border-brand-dark/20 rounded-2xl"
      >
        <div className="flex items-start space-x-4">
          <div className="mt-1">
            <IconLock className="text-brand-primary w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-100 mb-2">100% Client-Side & Private</h3>
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

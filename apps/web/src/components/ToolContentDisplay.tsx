import { motion, easeInOut } from "motion/react";

interface ToolContentDisplayProps {
  title: string;
  intro: string;
  benefits: string[];
  useCases: string[];
}

export default function ToolContentDisplay({
  title,
  intro,
  benefits,
  useCases,
}: ToolContentDisplayProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
        duration: 0.6,
        ease: easeInOut,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
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
      className="w-full max-w-7xl mx-auto mt-8 mb-12 space-y-8"
    >
      {/* H1 Title */}
      <motion.h1
        variants={itemVariants}
        className="text-4xl md:text-2xl font-bold text-gray-100 leading-tight"
      >
        {title}
      </motion.h1>

      <motion.div
        variants={itemVariants}
        className="prose prose-invert max-w-none"
      >
        <p className="text-md text-gray-400 leading-relaxed whitespace-pre-wrap">{intro}</p>
      </motion.div>

      {/* Key Benefits */}
      {benefits && benefits.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="space-y-4"
        >
          <h2 className="text-lg font-bold text-gray-100">Key Benefits</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {benefits.map((benefit, index) => (
              <li
                key={index}
                className="flex items-center space-x-3 p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
              >
                <span className="text-brand-primary font-bold text-sm pt-0.5">✓</span>
                <span className="text-gray-300 text-sm">{benefit}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Use Cases */}
      {useCases && useCases.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-gray-100">Common Use Cases</h2>
          <ul className="space-y-2">
            {useCases.map((useCase, index) => (
              <li
                key={index}
                className="flex items-start space-x-3 p-3 hover:bg-white/5 transition-colors rounded-lg"
              >
                <span className="text-brand-primary font-bold text-lg pt-0.5">→</span>
                <span className="text-gray-300">{useCase}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
}

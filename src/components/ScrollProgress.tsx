import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ScrollProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(scrollProgress);
    };

    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-muted z-[60]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="h-full bg-gradient-to-r from-forest to-forest-light"
        style={{ width: `${progress}%` }}
        transition={{ duration: 0.1 }}
      />
    </motion.div>
  );
};

export default ScrollProgress;

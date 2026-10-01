import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface TrueFocusProps {
  sentence: string;
  manualMode?: boolean;
  blurAmount?: number;
  borderColor?: string;
  animationDuration?: number;
  pauseBetweenAnimations?: number;
}

export const TrueFocus: React.FC<TrueFocusProps> = ({
  sentence,
  manualMode = false,
  blurAmount = 3,
  borderColor = '#2F6BFF',
  animationDuration = 0.7,
  pauseBetweenAnimations = 1.8
}) => {
  const words = sentence.split(' ');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [focusRect, setFocusRect] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (manualMode) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, (animationDuration + pauseBetweenAnimations) * 1000);

    return () => clearInterval(interval);
  }, [manualMode, words.length, animationDuration, pauseBetweenAnimations]);

  useEffect(() => {
    const updateFocusRect = () => {
      const activeElement = wordRefs.current[currentIndex];
      const container = containerRef.current;
      
      if (activeElement && container) {
        const containerRect = container.getBoundingClientRect();
        const activeRect = activeElement.getBoundingClientRect();
        
        setFocusRect({
          width: activeRect.width,
          height: activeRect.height,
          x: activeRect.left - containerRect.left,
          y: activeRect.top - containerRect.top
        });
      }
    };

    updateFocusRect();
    window.addEventListener('resize', updateFocusRect);
    return () => window.removeEventListener('resize', updateFocusRect);
  }, [currentIndex]);

  const handleWordClick = (index: number) => {
    if (manualMode) {
      setCurrentIndex(index);
    }
  };

  return (
    <div 
      ref={containerRef} 
      style={{ 
        position: 'relative', 
        display: 'inline-flex', 
        flexWrap: 'wrap', 
        gap: '8px', 
        justifyContent: 'center',
        padding: '12px'
      }}
    >
      <motion.div
        initial={false}
        animate={{
          width: focusRect.width + 16,
          height: focusRect.height + 12,
          x: focusRect.x - 8,
          y: focusRect.y - 6
        }}
        transition={{
          type: 'spring',
          stiffness: 150,
          damping: 20,
          mass: 0.8,
          duration: animationDuration
        }}
        style={{
          position: 'absolute',
          border: `2px solid ${borderColor}`,
          borderRadius: '8px',
          boxSizing: 'border-box',
          pointerEvents: 'none',
          top: 0,
          left: 0
        }}
      />
      
      {words.map((word, index) => {
        const isFocused = index === currentIndex;
        return (
          <motion.span
            key={index}
            ref={(el) => { wordRefs.current[index] = el; }}
            onClick={() => handleWordClick(index)}
            animate={{
              filter: isFocused ? 'blur(0px)' : `blur(${blurAmount}px)`,
              opacity: isFocused ? 1 : 0.6
            }}
            transition={{ duration: animationDuration }}
            style={{
              display: 'inline-block',
              cursor: manualMode ? 'pointer' : 'default',
              position: 'relative',
              zIndex: 1,
              transition: 'color 0.3s ease'
            }}
          >
            {word}
          </motion.span>
        );
      })}
    </div>
  );
};

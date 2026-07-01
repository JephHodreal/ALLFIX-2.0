import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileServiceCarouselProps {
  services: any[];
  activeIdx: number;
  setActiveIdx: (idx: number) => void;
  onServiceClick: (service: any) => void;
  renderCard: (service: any, isCenter: boolean) => React.ReactNode;
  navigationPills?: React.ReactNode;
}

export function MobileServiceCarousel({
  services,
  activeIdx,
  setActiveIdx,
  onServiceClick,
  renderCard,
  navigationPills
}: MobileServiceCarouselProps) {
  const [isDragging, setIsDragging] = useState(false);
  const N = services.length;

  if (N === 0) return null;

  const handleCardClick = (idx: number, diff: number) => {
    if (isDragging) return;
    if (diff === 0) {
      onServiceClick(services[idx]);
    } else if (diff === 1) {
      setActiveIdx((activeIdx + 1) % N);
    } else if (diff === -1) {
      setActiveIdx((activeIdx - 1 + N) % N);
    }
  };

  return (
    <div className="w-full flex flex-col items-center my-2 select-none overflow-hidden">
      {/* Clean Animated Top Swipe Indicator Bar */}
      <div className="flex items-center justify-center mb-3.5">
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-[11px] font-semibold text-slate-600 dark:text-slate-300 shadow-xs backdrop-blur-md">
          <motion.span
            animate={{ x: [-2, -6, -2] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="text-brand-green font-extrabold flex items-center"
          >
            ←
          </motion.span>
          
          <span className="tracking-tight">Swipe or tap side cards</span>
          
          <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-700 text-[10px] font-black text-brand-navy dark:text-blue-400 shadow-2xs border border-slate-200/50 dark:border-slate-600 min-w-[28px] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={activeIdx}
                initial={{ y: 6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -6, opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="inline-block"
              >
                {activeIdx + 1}
              </motion.span>
            </AnimatePresence>
            <span>/{N}</span>
          </span>

          <motion.span
            animate={{ x: [2, 6, 2] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="text-brand-green font-extrabold flex items-center"
          >
            →
          </motion.span>
        </div>
      </div>

      {/* 3D Coverflow Container */}
      <div 
        className="relative w-full h-[440px] flex items-center justify-center"
        style={{ perspective: '1000px' }}
      >
        {services.map((svc, idx) => {
          // Calculate circular difference for 360 degree loop
          let diff = (idx - activeIdx + N) % N;
          if (diff > N / 2) diff -= N;

          const isCenter = diff === 0;
          const isAdjacent = Math.abs(diff) === 1;

          return (
            <motion.div
              key={svc.brand || idx}
              className="absolute w-[86%] max-w-[340px] h-[430px] rounded-2xl shadow-xl cursor-pointer"
              style={{
                transformStyle: 'preserve-3d',
              }}
              initial={false}
              animate={{
                x: isCenter ? '0%' : diff === 1 ? '76%' : diff === -1 ? '-76%' : diff > 1 ? '150%' : '-150%',
                scale: isCenter ? 1 : isAdjacent ? 0.86 : 0.65,
                opacity: isCenter ? 1 : isAdjacent ? 0.6 : 0,
                zIndex: isCenter ? 30 : isAdjacent ? 20 : 10,
                rotateY: isCenter ? 0 : diff === 1 ? -14 : diff === -1 ? 14 : 0,
              }}
              transition={{
                type: 'spring',
                stiffness: 280,
                damping: 26,
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={(e, { offset, velocity }) => {
                setTimeout(() => setIsDragging(false), 100);
                const swipeThreshold = 35;
                if (offset.x < -swipeThreshold || velocity.x < -400) {
                  // Swiped left -> Next in loop
                  setActiveIdx((activeIdx + 1) % N);
                } else if (offset.x > swipeThreshold || velocity.x > 400) {
                  // Swiped right -> Previous in loop
                  setActiveIdx((activeIdx - 1 + N) % N);
                }
              }}
              onClick={() => handleCardClick(idx, diff)}
            >
              <div 
                className="w-full h-full pointer-events-none rounded-2xl overflow-hidden transition-shadow duration-300"
                style={{
                  boxShadow: isCenter 
                    ? '0 20px 40px -15px rgba(35, 64, 110, 0.35)' 
                    : '0 10px 20px -10px rgba(0, 0, 0, 0.2)'
                }}
              >
                {renderCard(svc, isCenter)}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Clean Animated Sliding Pagination Dots Track */}
      <div className="flex items-center justify-center mt-4 mb-2">
        <div className="inline-flex items-center gap-2 bg-slate-100/90 dark:bg-slate-800/80 px-3.5 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-700/60 shadow-inner backdrop-blur-md">
          {services.map((svc, idx) => {
            const isActive = idx === activeIdx;
            return (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className="relative flex items-center justify-center py-0.5 focus:outline-none"
                aria-label={`Go to ${svc.brand || 'Service'}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCarouselDot"
                    className="absolute inset-0 bg-gradient-to-r from-brand-navy to-brand-green dark:from-blue-500 dark:to-emerald-400 rounded-full shadow-xs"
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 30
                    }}
                  />
                )}
                <motion.div 
                  className={`rounded-full relative z-10 transition-colors duration-200 ${
                    isActive 
                      ? 'w-6 h-1.5 bg-transparent' 
                      : 'w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
                  }`}
                  animate={{
                    width: isActive ? 24 : 6,
                    height: 6
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 30
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Pills at Bottom */}
      {navigationPills && (
        <div className="w-full mt-2">
          {navigationPills}
        </div>
      )}
    </div>
  );
}

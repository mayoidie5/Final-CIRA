import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top',
  delay = 200
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const timeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        
        let top = 0;
        let left = 0;

        switch (position) {
          case 'top':
            top = rect.top - 8;
            left = rect.left + rect.width / 2;
            break;
          case 'bottom':
            top = rect.bottom + 8;
            left = rect.left + rect.width / 2;
            break;
          case 'left':
            top = rect.top + rect.height / 2;
            left = rect.left - 8;
            break;
          case 'right':
            top = rect.top + rect.height / 2;
            left = rect.right + 8;
            break;
        }

        setCoords({ top, left });
        setIsVisible(true);
      }
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return '-translate-x-1/2 -translate-y-full mb-2';
      case 'bottom':
        return '-translate-x-1/2 mt-2';
      case 'left':
        return '-translate-x-full -translate-y-1/2 mr-2';
      case 'right':
        return 'translate-x-0 -translate-y-1/2 ml-2';
      default:
        return '-translate-x-1/2 -translate-y-full mb-2';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'left-1/2 -translate-x-1/2 top-full border-l-transparent border-r-transparent border-b-transparent';
      case 'bottom':
        return 'left-1/2 -translate-x-1/2 bottom-full border-l-transparent border-r-transparent border-t-transparent';
      case 'left':
        return 'top-1/2 -translate-y-1/2 left-full border-t-transparent border-b-transparent border-r-transparent';
      case 'right':
        return 'top-1/2 -translate-y-1/2 right-full border-t-transparent border-b-transparent border-l-transparent';
      default:
        return 'left-1/2 -translate-x-1/2 top-full border-l-transparent border-r-transparent border-b-transparent';
    }
  };

  return (
    <>
      <div
        ref={containerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>

      {isVisible && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ top: coords.top, left: coords.left }}
        >
          <div className={`relative ${getPositionClasses()}`}>
            <div className="bg-gray-900 dark:bg-gray-700 text-white text-sm px-3 py-1.5 rounded shadow-lg whitespace-nowrap">
              {content}
              <div className={`absolute w-0 h-0 border-4 border-gray-900 dark:border-gray-700 ${getArrowClasses()}`} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

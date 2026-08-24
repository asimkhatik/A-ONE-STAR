import React, { useState, useEffect } from "react";

export const AnimatedNumber = ({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = ""
}) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let startTimestamp = null;
    const startValue = displayValue;
    const endValue = value;
    const duration = 600; // 600ms smooth animation

    if (startValue === endValue) return;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * easedProgress;

      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(endValue);
      }
    };

    const animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
  }, [value]);

  const formattedNumber = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(displayValue);

  return (
    <span className={`tabular-nums font-sans font-bold tracking-tight transition-all duration-300 ${className}`}>
      {prefix}{formattedNumber}{suffix}
    </span>
  );
};

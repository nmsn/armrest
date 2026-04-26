import { useState, useEffect, memo } from 'react';
import { useTheme } from '@/lib/theme';

const DIGIT_MAP = {
  '0': [0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0],
  '1': [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
  '2': [0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1],
  '3': [1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0],
  '4': [0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
  '5': [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0],
  '6': [0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0],
  '7': [1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
  '8': [0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0],
  '9': [0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0],
} as const;

const COLON_MAP = {
  ':': [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
} as const;

type DigitChar = keyof typeof DIGIT_MAP;
type DotSize = 'sm' | 'md' | 'lg';

const FALLBACK_DOTS = Array(35).fill(0) as readonly number[];

const SIZE_CONFIG = {
  sm: { dot: 'size-1', gap: 'gap-0.5', margin: 'mx-1' },
  md: { dot: 'size-2', gap: 'gap-1', margin: 'mx-2' },
  lg: { dot: 'size-3', gap: 'gap-2', margin: 'mx-3' },
} as const;

function useDotColors() {
  const { mode } = useTheme();
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (mode === 'system') {
        setIsDark(e.matches);
      }
    };

    const updateDarkStatus = () => {
      if (mode === 'system') {
        setIsDark(mediaQuery.matches);
      } else {
        setIsDark(mode === 'dark');
      }
    };

    updateDarkStatus();
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [mode]);

  useEffect(() => {
    setIsDark(mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches));
  }, [mode]);

  return isDark;
}

interface DotDigitProps {
  digit: string;
  size?: DotSize;
}

const DotDigit = memo(({ digit, size = 'md' }: DotDigitProps) => {
  const isDark = useDotColors();
  const dots = DIGIT_MAP[digit as DigitChar] ?? FALLBACK_DOTS;
  const sizeClass = SIZE_CONFIG[size];

  return (
    <div className={`grid grid-cols-5 ${sizeClass.gap} ${sizeClass.margin}`}>
      {dots.map((active, i) => (
        <div
          key={i}
          className={`${sizeClass.dot} rounded-full transition-colors duration-300 ${active
            ? isDark ? 'bg-white' : 'bg-neutral-900'
            : isDark ? 'bg-neutral-800' : 'bg-neutral-300'
            }`}
        />
      ))}
    </div>
  );
});

interface DotColonProps {
  colon: ':';
  size?: DotSize;
}

const DotColon = memo(({ colon, size = 'md' }: DotColonProps) => {
  const isDark = useDotColors();
  const dots = COLON_MAP[colon];
  const sizeClass = SIZE_CONFIG[size];

  return (
    <div className={`grid grid-cols-5 ${sizeClass.gap} ${sizeClass.margin}`}>
      {dots.map((active, i) => (
        <div
          key={i}
          className={`${sizeClass.dot} rounded-full transition-colors duration-300 ${active
            ? isDark ? 'bg-white' : 'bg-neutral-900'
            : isDark ? 'bg-neutral-800' : 'bg-neutral-300'
            }`}
        />
      ))}
    </div>
  );
});

interface BraunClockProps {
  size?: DotSize;
}

const BraunClock = ({ size = 'md' }: BraunClockProps) => {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const format = (num: number) => num.toString().padStart(2, '0');
  const hours = format(time.getHours());
  const minutes = format(time.getMinutes());

  return (
    <div className="flex items-center justify-center">
      <DotDigit digit={hours[0]} size={size} />
      <DotDigit digit={hours[1]} size={size} />
      <DotColon colon=":" size={size} />
      <DotDigit digit={minutes[0]} size={size} />
      <DotDigit digit={minutes[1]} size={size} />
    </div>
  );
};

const VerticalBraunClock = ({ size = 'md' }: BraunClockProps) => {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const format = (num: number) => num.toString().padStart(2, '0');
  const hours = format(time.getHours());
  const minutes = format(time.getMinutes());

  return (
    <div className="flex flex-col items-start justify-center">
      <div className="flex">
        <DotDigit digit={hours[0]} size={size} />
        <DotDigit digit={hours[1]} size={size} />
      </div>
      <div className="flex mt-2">
        <DotDigit digit={minutes[0]} size={size} />
        <DotDigit digit={minutes[1]} size={size} />
      </div>
    </div>
  );
};

export { BraunClock, VerticalBraunClock, DotDigit, DotColon };
export type { DotSize };

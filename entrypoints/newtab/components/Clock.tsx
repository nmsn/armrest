import { useState, useEffect } from 'react';

export default function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-5xl md:text-6xl font-bold tracking-tight text-primary">
      {time.toLocaleTimeString()}
    </div>
  );
}

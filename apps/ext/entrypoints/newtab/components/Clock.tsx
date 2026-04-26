import { useTime } from '../hooks/useTime';

interface ClockTimeProps {
  showSeconds?: boolean;
}

function ClockTime({ showSeconds = false }: ClockTimeProps) {
  const { hours, minutes, seconds } = useTime();

  return (
    <div className="flex flex-col items-baseline gap-1">
      <span className="text-4xl font-black tracking-tight text-primary font-['Figtree'] tabular-nums">
        {hours}
      </span>
      <span className="text-4xl font-black tracking-tight text-primary/30 font-['Figtree'] tabular-nums">
        {minutes}
      </span>
      {showSeconds && (
        <span className="text-lg font-black tracking-tight text-primary/20 font-['Figtree'] tabular-nums">
          {seconds}
        </span>
      )}
    </div>
  );
}

interface ClockCalendarProps {
  showLunar?: boolean;
}

function ClockCalendar({ showLunar = true }: ClockCalendarProps) {
  const { month, date, weekday, lunarDate } = useTime();

  return (
    <div className="flex flex-col gap-0.5">
      <div className="text-xs text-primary/70">
        {month}/{date} {weekday}
      </div>
      {showLunar && (
        <div className="text-xs text-muted-foreground">
          {lunarDate}
        </div>
      )}
    </div>
  );
}

export { ClockTime, ClockCalendar };

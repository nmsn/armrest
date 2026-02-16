import { useState, useEffect } from 'react';

const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const MONTHS = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '腊月'];
const DAYS = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十', '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

function getYearGanZhi(year: number): string {
  const gan = GAN[(year - 4) % 10];
  const zhi = ZHI[(year - 4) % 12];
  return `${gan}${zhi}年`;
}

function getSimpleLunarDate(date: Date): string {
  const baseDate = new Date(1900, 0, 31);
  const diff = date.getTime() - baseDate.getTime();
  let days = Math.floor(diff / (24 * 60 * 60 * 1000));

  let year = 1900;
  let month = 1;
  let day = 1;

  const lunarMonthDays = [29, 30];
  let lunarYearDays = 354;

  while (days > lunarYearDays && year < 2100) {
    days -= lunarYearDays;
    year++;

    const leap = (year - 1900) % 4;
    lunarYearDays = 354 + (leap === 0 ? 1 : 0);
  }

  let isLeap = false;
  while (days > (lunarMonthDays[month % 2]) && month <= 12) {
    days -= lunarMonthDays[month % 2];
    month++;
  }

  day = days + 1;

  const yearGanZhi = getYearGanZhi(year);
  const monthStr = isLeap ? `闰${MONTHS[month - 1]}` : MONTHS[month - 1];
  const dayStr = DAYS[day - 1];

  return `${yearGanZhi}${monthStr}${dayStr}`;
}

export default function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const year = time.getFullYear();
  const month = time.getMonth() + 1;
  const date = time.getDate();
  const weekday = WEEKDAYS[time.getDay()];
  const lunarDate = getSimpleLunarDate(time);

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className="text-5xl md:text-6xl font-bold tracking-tight text-primary">
        {time.toLocaleTimeString()}
      </div>
      <div className="flex flex-col items-center space-y-1.5">
        <div className="text-lg md:text-xl font-medium text-primary/80">
          {year}年{month}月{date}日 {weekday}
        </div>
        <div className="text-base md:text-lg text-primary/60">
          {lunarDate}
        </div>
      </div>
    </div>
  );
}

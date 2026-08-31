import React, { useState } from 'react';

interface LuxuryDatePickerModalProps {
  startDate: string;
  endDate: string;
  onSelectDates: (start: string, end: string) => void;
  onClose: () => void;
}

export const LuxuryDatePickerModal: React.FC<LuxuryDatePickerModalProps> = ({
  startDate,
  endDate,
  onSelectDates,
  onClose,
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const initialMonth = startDate ? new Date(startDate) : today;
  const [currentYear, setCurrentYear] = useState<number>(initialMonth.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(initialMonth.getMonth());

  const [tempStart, setTempStart] = useState<string>(startDate);
  const [tempEnd, setTempEnd] = useState<string>(endDate);
  const [selectingStep, setSelectingStep] = useState<'start' | 'end'>(startDate ? 'end' : 'start');

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const formatDateStr = (year: number, month: number, day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const handleDateClick = (dayStr: string) => {
    const clickedDate = new Date(dayStr);
    clickedDate.setHours(0, 0, 0, 0);

    if (clickedDate < today) return;

    if (selectingStep === 'start' || !tempStart || (tempStart && tempEnd && clickedDate < new Date(tempStart))) {
      setTempStart(dayStr);
      const nextDay = new Date(clickedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = formatDateStr(nextDay.getFullYear(), nextDay.getMonth(), nextDay.getDate());
      setTempEnd(nextDayStr);
      setSelectingStep('end');
    } else if (selectingStep === 'end') {
      if (clickedDate > new Date(tempStart)) {
        setTempEnd(dayStr);
        onSelectDates(tempStart, dayStr);
      } else {
        setTempStart(dayStr);
        const nextDay = new Date(clickedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayStr = formatDateStr(nextDay.getFullYear(), nextDay.getMonth(), nextDay.getDate());
        setTempEnd(nextDayStr);
      }
    }
  };

  const handleApply = () => {
    if (tempStart && tempEnd) {
      onSelectDates(tempStart, tempEnd);
      onClose();
    }
  };

  const handleQuickSelect = (daysAhead: number) => {
    const sDate = new Date(today);
    const eDate = new Date(today);
    eDate.setDate(sDate.getDate() + daysAhead);

    const sStr = formatDateStr(sDate.getFullYear(), sDate.getMonth(), sDate.getDate());
    const eStr = formatDateStr(eDate.getFullYear(), eDate.getMonth(), eDate.getDate());

    setTempStart(sStr);
    setTempEnd(eStr);
    onSelectDates(sStr, eStr);
    onClose();
  };

  return (
    <div 
      className="absolute left-0 top-full mt-12 bg-white rounded-24 shadow-2xl p-24 border-1 border-light-2 animate-fadeIn"
      style={{
        width: '360px',
        boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.25)',
        zIndex: 1000
      }}
    >
      {/* HEADER & QUICK PRESETS */}
      <div className="d-flex items-center justify-between pb-16 mb-16 border-bottom-light">
        <div>
          <span className="text-11 font-bold uppercase tracking-widest text-accent-1 d-block">Select Stay Dates</span>
          <span className="text-13 font-semibold text-dark-1">
            {tempStart ? new Date(tempStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Check-In'} 
            {' — '}
            {tempEnd ? new Date(tempEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Check-Out'}
          </span>
        </div>
        <button 
          onClick={onClose}
          className="size-32 rounded-full bg-light-1 hover:bg-light-2 flex-center text-dark-1 transition-colors"
        >
          <i className="icon-close text-12"></i>
        </button>
      </div>

      {/* QUICK PRESET BUTTONS */}
      <div className="d-flex gap-8 mb-16">
        <button
          onClick={() => handleQuickSelect(1)}
          className="px-12 py-6 rounded-200 bg-light-1 hover:bg-accent-1 hover:text-white text-11 font-bold uppercase tracking-wider text-dark-1 transition-all"
        >
          1 Night
        </button>
        <button
          onClick={() => handleQuickSelect(2)}
          className="px-12 py-6 rounded-200 bg-light-1 hover:bg-accent-1 hover:text-white text-11 font-bold uppercase tracking-wider text-dark-1 transition-all"
        >
          2 Nights
        </button>
        <button
          onClick={() => handleQuickSelect(3)}
          className="px-12 py-6 rounded-200 bg-light-1 hover:bg-accent-1 hover:text-white text-11 font-bold uppercase tracking-wider text-dark-1 transition-all"
        >
          3 Nights
        </button>
      </div>

      {/* MONTH NAVIGATION */}
      <div className="d-flex items-center justify-between mb-16 px-4">
        <button 
          onClick={prevMonth}
          className="size-32 rounded-full bg-light-1 hover:bg-accent-1 hover:text-white flex-center text-dark-1 transition-all"
        >
          <i className="icon-arrow-left text-12"></i>
        </button>
        <span className="text-14 font-bold text-dark-1 uppercase tracking-wider">
          {monthNames[currentMonth]} {currentYear}
        </span>
        <button 
          onClick={nextMonth}
          className="size-32 rounded-full bg-light-1 hover:bg-accent-1 hover:text-white flex-center text-dark-1 transition-all"
        >
          <i className="icon-arrow-right text-12"></i>
        </button>
      </div>

      {/* DAYS OF WEEK */}
      <div className="d-grid mb-8 text-center" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <span key={d} className="text-11 font-bold text-sec uppercase">
            {d}
          </span>
        ))}
      </div>

      {/* CALENDAR DAYS GRID */}
      <div className="d-grid gap-4 text-center" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {/* Empty slots before first day */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} style={{ height: '36px' }}></div>
        ))}

        {/* Days of month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dateStr = formatDateStr(currentYear, currentMonth, dayNum);
          const cellDate = new Date(dateStr);
          cellDate.setHours(0, 0, 0, 0);

          const isPast = cellDate < today;
          const isSelectedStart = tempStart === dateStr;
          const isSelectedEnd = tempEnd === dateStr;
          const isInRange = tempStart && tempEnd && cellDate > new Date(tempStart) && cellDate < new Date(tempEnd);
          const isToday = cellDate.getTime() === today.getTime();

          return (
            <button
              key={dayNum}
              onClick={() => handleDateClick(dateStr)}
              disabled={isPast}
              className={`rounded-full flex-center text-13 font-semibold transition-all relative ${
                isPast
                  ? 'text-light-3 cursor-not-allowed opacity-30'
                  : isSelectedStart || isSelectedEnd
                  ? 'bg-accent-1 text-white shadow-md font-bold scale-105 z-2'
                  : isInRange
                  ? 'bg-emerald-50 text-accent-1 font-bold rounded-none'
                  : isToday
                  ? 'border-1 border-accent-1 text-accent-1 font-bold hover:bg-light-1'
                  : 'hover:bg-light-1 text-dark-1'
              }`}
              style={{ height: '36px', width: '36px', margin: '0 auto' }}
            >
              {dayNum}
            </button>
          );
        })}
      </div>

      {/* APPLY ACTION */}
      <div className="mt-20 pt-14 border-top-light d-flex justify-between items-center">
        <button
          onClick={() => {
            setTempStart('');
            setTempEnd('');
          }}
          className="text-12 font-bold text-sec hover:text-dark-1 uppercase tracking-wider"
        >
          Clear
        </button>
        <button
          onClick={handleApply}
          disabled={!tempStart || !tempEnd}
          className="px-20 py-10 rounded-14 bg-accent-1 text-white text-12 font-bold uppercase tracking-wider hover:bg-dark-1 transition-all disabled:opacity-50"
        >
          Apply Dates
        </button>
      </div>
    </div>
  );
};

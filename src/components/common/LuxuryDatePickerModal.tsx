import React, { useState, useRef, useEffect } from 'react';

interface LuxuryDatePickerModalProps {
  mode: 'checkIn' | 'checkOut';
  startDate: string;
  endDate: string;
  onSelectDate: (mode: 'checkIn' | 'checkOut', selectedDate: string) => void;
  onClose: () => void;
}

export const LuxuryDatePickerModal: React.FC<LuxuryDatePickerModalProps> = ({
  mode,
  startDate,
  endDate,
  onSelectDate,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeDateStr = mode === 'checkIn' ? startDate : endDate;
  const initialMonth = activeDateStr ? new Date(activeDateStr) : (startDate ? new Date(startDate) : today);
  const [currentYear, setCurrentYear] = useState<number>(initialMonth.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(initialMonth.getMonth());

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

  const minAllowedDate = () => {
    if (mode === 'checkIn') return today;
    if (startDate) {
      const s = new Date(startDate);
      s.setHours(0, 0, 0, 0);
      s.setDate(s.getDate() + 1); // Checkout must be at least 1 day after checkin
      return s;
    }
    return today;
  };

  const handleDateClick = (dayStr: string) => {
    const clickedDate = new Date(dayStr);
    clickedDate.setHours(0, 0, 0, 0);

    const minDate = minAllowedDate();
    if (clickedDate < minDate) return;

    onSelectDate(mode, dayStr);
    onClose();
  };

  return (
    <div 
      ref={modalRef}
      className="absolute left-0 top-full mt-12 bg-white rounded-24 shadow-2xl p-24 border-1 border-light-2 animate-fadeIn"
      style={{
        width: '340px',
        boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.25)',
        zIndex: 1000
      }}
    >
      {/* HEADER */}
      <div className="d-flex items-center justify-between pb-16 mb-16 border-bottom-light">
        <div>
          <span className="text-11 font-bold uppercase tracking-widest text-accent-1 d-block">
            {mode === 'checkIn' ? 'Select Check-In Date' : 'Select Check-Out Date'}
          </span>
          <span className="text-13 font-semibold text-dark-1">
            {activeDateStr ? new Date(activeDateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Choose Date'}
          </span>
        </div>
        <button 
          onClick={onClose}
          className="size-32 rounded-full bg-light-1 hover:bg-light-2 flex-center text-dark-1 transition-colors"
        >
          <i className="icon-close text-12"></i>
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

          const minDate = minAllowedDate();
          const isDisabled = cellDate < minDate;
          const isSelected = activeDateStr === dateStr;
          const isToday = cellDate.getTime() === today.getTime();

          return (
            <button
              key={dayNum}
              onClick={() => handleDateClick(dateStr)}
              disabled={isDisabled}
              className={`rounded-full flex-center text-13 font-semibold transition-all relative ${
                isDisabled
                  ? 'text-light-3 cursor-not-allowed opacity-30'
                  : isSelected
                  ? 'bg-accent-1 text-white shadow-md font-bold scale-105 z-2'
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
    </div>
  );
};

import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays } from 'lucide-react';

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const HOURS = Array.from({ length: 24 }, (_, value) => value);
const MINUTES = Array.from({ length: 60 }, (_, value) => value);
const YEARS = [2022, 2023, 2024, 2025, 2026];
const MIN_DATE = new Date(2022, 0, 1, 0, 0);
const MAX_DATE = new Date(2026, 5, 30, 21, 12);

function pad(value) {
  return String(value).padStart(2, '0');
}

function parseValue(value) {
  if (!value) return null;
  const [datePart, timePart = '00:00'] = value.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  const date = new Date(year, month - 1, day, hour || 0, minute || 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatValue(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function clampDate(date, minimum = MIN_DATE, maximum = MAX_DATE) {
  if (date < minimum) return new Date(minimum);
  if (date > maximum) return new Date(maximum);
  return date;
}

function sameDay(first, second) {
  return first && second
    && first.getFullYear() === second.getFullYear()
    && first.getMonth() === second.getMonth()
    && first.getDate() === second.getDate();
}

function DateTimePicker({ id, label, value, disabled, min, max, onChange }) {
  const containerRef = useRef(null);
  const hourListRef = useRef(null);
  const minuteListRef = useRef(null);
  const selectedDate = parseValue(value);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState('calendar');
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(2026, 5, 1));
  const [draftDate, setDraftDate] = useState(selectedDate || new Date(2026, 5, 30, 21, 12));

  useEffect(() => {
    if (!open) return undefined;
    const handleOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const initializeList = (ref, values, selectedValue) => {
      if (!ref.current) return;
      const itemHeight = 32;
      const selectedOffset = values.indexOf(selectedValue) * itemHeight;
      ref.current.scrollTop = Math.max(0, selectedOffset - (ref.current.clientHeight - itemHeight) / 2);
    };
    initializeList(hourListRef, HOURS, draftDate.getHours());
    initializeList(minuteListRef, MINUTES, draftDate.getMinutes());
  }, [open]);

  const openPicker = () => {
    if (disabled) return;
    const nextDate = clampDate(selectedDate || new Date(2026, 5, 30, 21, 12), minimumDate, maximumDate);
    setDraftDate(nextDate);
    setVisibleMonth(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
    setView('calendar');
    setOpen(true);
  };

  const emitDate = (date) => onChange(formatValue(clampDate(date, minimumDate, maximumDate)));

  const selectDay = (day) => {
    const nextDate = clampDate(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day, 0, 0), minimumDate, maximumDate);
    setDraftDate(nextDate);
  };

  const selectTime = (part, number) => {
    const nextDate = new Date(draftDate);
    if (part === 'hour') nextDate.setHours(number);
    else nextDate.setMinutes(number);
    const clamped = clampDate(nextDate, minimumDate, maximumDate);
    setDraftDate(clamped);
  };

  const days = useMemo(() => {
    const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1).getDay();
    const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
    return Array.from({ length: 42 }, (_, index) => {
      const day = index - firstDay + 1;
      return day >= 1 && day <= daysInMonth ? day : null;
    });
  }, [visibleMonth]);

  const changeMonth = (amount) => {
    const next = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + amount, 1);
    const earliestDate = min ? parseValue(min) : MIN_DATE;
    const latestDate = max ? parseValue(max) : MAX_DATE;
    const earliest = new Date(earliestDate.getFullYear(), earliestDate.getMonth(), 1);
    const latest = new Date(latestDate.getFullYear(), latestDate.getMonth(), 1);
    if (next >= earliest && next <= latest) setVisibleMonth(next);
  };

  const handleTimeScroll = (event, values) => {
    const element = event.currentTarget;
    const listItems = [...element.querySelectorAll('button')];
    const center = element.getBoundingClientRect().top + element.clientHeight / 2;
    let closestItem = null;
    let closestDistance = Infinity;
    for (const item of listItems) {
      const rect = item.getBoundingClientRect();
      const distance = Math.abs(rect.top + rect.height / 2 - center);
      if (distance < closestDistance) {
        closestItem = item;
        closestDistance = distance;
      }
    }
    if (closestItem) {
      const selectedValue = Number(closestItem.textContent);
      const nextDate = new Date(draftDate);
      if (values === HOURS) nextDate.setHours(selectedValue);
      else nextDate.setMinutes(selectedValue);
      const bounded = clampDate(nextDate, minimumDate, maximumDate);
      setDraftDate((current) => current.getTime() === bounded.getTime() ? current : bounded);
    }
  };

  const minimumDate = min ? parseValue(min) : MIN_DATE;
  const maximumDate = max ? parseValue(max) : MAX_DATE;
  const visibleMonthStart = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  const minimumMonthStart = new Date(minimumDate.getFullYear(), minimumDate.getMonth(), 1);
  const maximumMonthStart = new Date(maximumDate.getFullYear(), maximumDate.getMonth(), 1);
  const canGoToPreviousMonth = visibleMonthStart > minimumMonthStart;
  const canGoToNextMonth = visibleMonthStart < maximumMonthStart;

  const visibleValue = value ? value.replace('T', ' ') : 'Selecionar data e hora';

  return (
    <div className="filter-field date-picker" ref={containerRef}>
      <label htmlFor={id}>{label}</label>
      <button type="button" id={id} className="date-picker-trigger" disabled={disabled} onClick={openPicker}>
        <span>{visibleValue}</span>
        <CalendarDays className="date-picker-icon" size={17} strokeWidth={2} aria-hidden="true" />
      </button>
      {open && (
        <div className="date-picker-popover">
          <div className="date-picker-main">
            <div className="date-picker-calendar">
              <button type="button" className="date-picker-month-title" onClick={() => setView(view === 'years' ? 'calendar' : 'years')}>
                {MONTHS[visibleMonth.getMonth()]} de {visibleMonth.getFullYear()}
              </button>
              {view === 'years' ? (
                <div className="date-picker-years">
                  {YEARS.map((year) => (
                    <div key={year} className="date-picker-year-row">
                      <button type="button" className="date-picker-year" aria-expanded={visibleMonth.getFullYear() === year} onClick={() => setVisibleMonth(new Date(year, visibleMonth.getMonth(), 1))}>{year}</button>
                      {visibleMonth.getFullYear() === year && (
                        <div className="date-picker-months">
                          {MONTHS.map((month, monthIndex) => {
                            const available = year > 2022 || monthIndex >= 0;
                            const latest = year < 2026 || monthIndex <= 5;
                            return <button key={month} type="button" disabled={!available || !latest} className={monthIndex === visibleMonth.getMonth() ? 'is-selected' : ''} onClick={() => { setVisibleMonth(new Date(year, monthIndex, 1)); setView('calendar'); }}>{month}</button>;
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="date-picker-navigation">
                    <button type="button" disabled={!canGoToPreviousMonth} onClick={() => changeMonth(-1)} aria-label="Mês anterior">‹</button>
                    <button type="button" disabled={!canGoToNextMonth} onClick={() => changeMonth(1)} aria-label="Próximo mês">›</button>
                  </div>
                  <div className="date-picker-weekdays">{WEEKDAYS.map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div>
                  <div className="date-picker-days">
                    {days.map((day, index) => {
                      const dayDate = day ? new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day, draftDate.getHours(), draftDate.getMinutes()) : null;
                      const dayStart = dayDate && new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 0, 0);
                      const dayEnd = dayDate && new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 23, 59);
                      const blocked = dayDate && (dayEnd < minimumDate || dayStart > maximumDate);
                      return <button key={index} type="button" disabled={!day || blocked} className={sameDay(dayDate, draftDate) ? 'is-selected' : ''} onClick={() => selectDay(day)}>{day || ''}</button>;
                    })}
                  </div>
                </>
              )}
              <button type="button" className="date-picker-clear" onClick={() => { onChange(''); setOpen(false); }}>Limpar</button>
            </div>
            <div className="date-picker-time">
              <div className="date-picker-time-list" ref={hourListRef} onScroll={(event) => handleTimeScroll(event, HOURS)}>
                {HOURS.map((hour) => <button key={`h-${hour}`} type="button" className={draftDate.getHours() === hour ? 'is-selected' : ''} onClick={() => selectTime('hour', hour)}>{pad(hour)}</button>)}
              </div>
              <div className="date-picker-time-list" ref={minuteListRef} onScroll={(event) => handleTimeScroll(event, MINUTES)}>
                {MINUTES.map((minute) => <button key={`m-${minute}`} type="button" className={draftDate.getMinutes() === minute ? 'is-selected' : ''} onClick={() => selectTime('minute', minute)}>{pad(minute)}</button>)}
              </div>
            </div>
          </div>
          <button type="button" className="date-picker-apply" onClick={() => { emitDate(draftDate); setOpen(false); }}>Aplicar</button>
        </div>
      )}
    </div>
  );
}

export default DateTimePicker;

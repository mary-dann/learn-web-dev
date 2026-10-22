import { buildCalendarGrid, MONTH_NAMES, compareDates } from '../utils/date';

const TODAY = new Date();

export default function Calendar({ currentYear, currentMonth, selectedDay, onDayClick, onPrevMonth, onNextMonth }) {
  const weeks = buildCalendarGrid(currentYear, currentMonth);

  const isDaySelectable = (day, otherMonth) => {
    if (otherMonth) return false;
    return compareDates(currentYear, currentMonth, day, TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate()) >= 0;
  };

  return (
    <section className="calendar">
      <div className="calendar-header">
        <span className="calendar-month">{MONTH_NAMES[currentMonth]} {currentYear}</span>
        <div className="calendar-nav">
          <button className="calendar-arrow" onClick={onPrevMonth}>‹</button>
          <button className="calendar-arrow" onClick={onNextMonth}>›</button>
        </div>
      </div>

      <div className="calendar-weekdays">
        <span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span>Сб</span><span>Вс</span>
      </div>

      <div className="calendar-grid">
        {weeks.map((week, weekIndex) => (
          week.map((cell, dayIndex) => {
            const isSelectable = isDaySelectable(cell.day, cell.otherMonth);
            const isSelected = !cell.otherMonth && cell.day === selectedDay;
            
            let classes = "day";
            if (cell.otherMonth) classes += " other-month";
            if (!isSelectable) classes += " disabled";
            if (isSelected) classes += " selected";

            return (
              <button
                key={`${weekIndex}-${dayIndex}`}
                type="button"
                className={classes}
                disabled={!isSelectable}
                onClick={() => isSelectable && onDayClick(cell.day)}
              >
                {cell.day}
              </button>
            );
          })
        ))}
      </div>
    </section>
  );
}
export default function TimeSlots({ slots, selectedTime, onSlotClick, loading, error }) {
  if (loading) {
    return (
      <section className="time-slots">
        <h2 className="slots-title">Доступное время</h2>
        <p className="status-message">Загрузка слотов...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="time-slots">
        <h2 className="slots-title">Доступное время</h2>
        <p className="status-message error">Ошибка: {error}</p>
      </section>
    );
  }

  return (
    <section className="time-slots">
      <h2 className="slots-title">Доступное время</h2>
      <div className="slots-grid">
        {slots.map((slot) => {
          let classes = "slot";
          if (!slot.available) classes += " busy";
          if (slot.time === selectedTime) classes += " selected";

          return (
            <button
              key={slot.time}
              type="button"
              className={classes}
              disabled={!slot.available}
              onClick={() => onSlotClick(slot.time)}
            >
              <span className="slot-time">{slot.time}</span>
              {!slot.available && <span className="slot-status">Занято</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}
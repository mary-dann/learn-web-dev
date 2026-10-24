export default function TimeSlots({ slots, selectedTime, onSlotClick }) {
  return (
    <section className="time-slots">
      <h2 className="slots-title">Доступное время</h2>
        {slots.length === 0 ? (
        <p style={{ color: '#6b2d5c', textAlign: 'center', marginTop: '20px' }}>Выберите дату в календаре</p>) : 
        (<div className="slots-grid">
        {slots.map((slot) => {
          let classes = "slot";
          if (!slot.available) classes += " busy";
          if (slot.time === selectedTime) classes += " selected";

          return (
            <button
              key={slot.time}
              type="button"
              className={classes}
              disabled={!slot.available || slots.length === 0}
              onClick={() => onSlotClick(slot.time)}
            >
              <span className="slot-time">{slot.time}</span>
              {!slot.available && <span className="slot-status">Занято</span>}
            </button>
          );
        })}
      </div>
    )}
    </section>
  );
}
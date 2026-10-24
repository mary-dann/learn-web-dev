import { useState } from 'react';
import Header from './components/Header';
import Calendar from './components/Calendar';
import TimeSlots from './components/TimeSlots';
import SummaryBar from './components/SummaryBar'; 
import { MONTH_NAMES, WEEKDAYS_FULL, compareDates } from './utils/date';

// Генерация слотов в зависимости от дня
const getSlotsForDay = (day) => {
  const baseSlots = [
    { time: "10:00", available: true },
    { time: "11:00", available: true },
    { time: "12:00", available: true },
    { time: "13:00", available: true },
    { time: "14:00", available: true },
    { time: "15:00", available: true },
    { time: "16:00", available: true },
    { time: "17:00", available: true }
  ];

  // Если день чётный — занято 11:00 и 13:00. Если нечётный — занято 14:00 и 16:00
  return baseSlots.map(slot => {
    let isBusy = false;
    if (day % 2 === 0) {
      isBusy = slot.time === "11:00" || slot.time === "13:00";
    } else {
      isBusy = slot.time === "14:00" || slot.time === "16:00";
    }
    return { ...slot, available: !isBusy };
  });
};

const TODAY = new Date();

function App() {
  const [currentYear, setCurrentYear] = useState(TODAY.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(TODAY.getMonth());
  const [selectedDay, setSelectedDay] = useState(TODAY.getDate());
  const [selectedTime, setSelectedTime] = useState(null);

  // Слоты зависят от selectedDay
  const currentSlots = selectedDay ? getSlotsForDay(selectedDay) : [];

  const handleDayClick = (day) => {
    setSelectedDay(day);
    setSelectedTime(null);
  };

  const handleSlotClick = (time) => {
    if (!selectedDay) return; // если дата не выбрана
    setSelectedTime(time);
  };

  const changeMonth = (direction) => {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);

    if (compareDates(newYear, newMonth, 1, TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate()) >= 0) {
      setSelectedDay(1);
    } else if (newYear === TODAY.getFullYear() && newMonth === TODAY.getMonth()) {
      setSelectedDay(TODAY.getDate());
    } else {
      setSelectedDay(null);
    }
    setSelectedTime(null);
  };

  const handleNextClick = () => {
    if (selectedDay && selectedTime) {
      const date = new Date(currentYear, currentMonth, selectedDay);
      const dateOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      let dateString = date.toLocaleDateString('ru-RU', dateOptions);
      dateString = dateString.charAt(0).toUpperCase() + dateString.slice(1);
      
      localStorage.setItem("bookingDate", `${dateString} • ${selectedTime}`);
      window.location.href = "/confirm.html"; 
    }
  };

  // подпись «Выберите время»
  let summaryText = "Выберите дату и время";
  if (selectedDay) {
    const date = new Date(currentYear, currentMonth, selectedDay);
    summaryText = `${WEEKDAYS_FULL[date.getDay()]}, ${selectedDay} ${MONTH_NAMES[currentMonth].toLowerCase()} ${currentYear}`;
    if (selectedTime) {
      summaryText += ` • ${selectedTime}`;
    } else {
      summaryText += ` • Выберите время`; 
    }
  }

  return (
    <div className="page">
      <Header />
      
      <section className="steps">
        {[1, 2, 3, 4, 5].map((step, index) => (
          <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
            <div className={`step-circle ${step === 3 ? 'active' : ''}`}>{step}</div>
            {index < 4 && <div className="step-line"></div>}
          </div>
        ))}
      </section>

      <main className="main">
        <h1 className="main-title">Выберете удобное время</h1>

        <div className="content-wrapper">
          <Calendar 
            currentYear={currentYear}
            currentMonth={currentMonth}
            selectedDay={selectedDay}
            onDayClick={handleDayClick}
            onPrevMonth={() => changeMonth(-1)}
            onNextMonth={() => changeMonth(1)}
          />

          <TimeSlots 
            slots={currentSlots}
            selectedTime={selectedTime}
            onSlotClick={handleSlotClick}
          />
        </div>

        <SummaryBar summaryText={summaryText} />

        <div className="actions">
          <button className="btn btn-back">Назад</button>
          <button 
            className="btn btn-next" 
            disabled={!selectedDay || !selectedTime}
            onClick={handleNextClick}
          >
            Далее
          </button>
        </div>
      </main>
      
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="logo-text">ОРХИДЕЯ</span>
            <p className="footer-desc">Стрижки · Окрашивание · Уход · Укладки<br />Всё для ваших волос — в одном месте</p>
          </div>
          <div className="footer-col">
            <span className="footer-title">КОНТАКТЫ</span>
            <p className="footer-text">ул. Садовая, 15, Москва</p>
            <p className="footer-text">+7 (495) 123-45-67</p>
          </div>
          <div className="footer-col">
            <span className="footer-title">РЕЖИМ РАБОТЫ</span>
            <p className="footer-text">Пн–Пт: 9:00 – 21:00</p>
            <p className="footer-text">Сб–Вс: 10:00 – 19:00</p>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="copyright">© 2026. Все права защищены.</span>
          <a href="#" className="footer-link">Политика конфиденциальности</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
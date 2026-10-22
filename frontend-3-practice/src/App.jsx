// App — корневой компонент приложения.
//
// ЗАДАНИЕ
// --------
// Перенесите свою страницу выбора даты и времени из нативного JS
// на React. У вас уже есть:
//   - готовая вёрстка (HTML);
//   - готовые стили (CSS);
//   - рабочий код на нативном JS (валидация дат, рендер календаря,
//     обработчики кликов, выбор слота).
//
// Теперь нужно то же самое сделать в React.
//
// ЧТО НУЖНО СДЕЛАТЬ
// ------------------
// 1. Разбить страницу на компоненты. Как именно — решайте сами.
//    Обычно выделяют: шапку, подвал, календарь, сетку слотов,
//    нижнюю панель.
//
// 2. Перенести вёрстку из HTML в JSX. Стили оставить как есть,
//    просто положить их в тот же проект (например, в src/styles/
//    или рядом с компонентами).
//
// 3. Заменить нативное состояние (переменные + прямые манипуляции
//    с DOM) на useState. Какие именно данные должны жить в состоянии —
//    подумайте сами. Скорее всего: текущий месяц, выбранный день,
//    выбранное время, массив слотов.
//
// 4. Рендер календаря и слотов делать через JSX и .map(),
//    без innerHTML и querySelector.
//
// 5. Обработчики кликов — через onClick прямо в JSX,
//    без addEventListener.
//
// 6. Функции для работы с датами, которые вы уже написали
//    на нативном JS (построение сетки календаря, сравнение дат,
//    проверка «не раньше сегодня»), можно переиспользовать.
//    Они чистые — не зависят от React. Создайте файл
//    src/utils/date.js и перенесите их туда.
//
//
// ПОДСКАЗКА
// ---------
// Если что-то не работает или непонятно, как перевести нативный
// код на React — вернитесь к лекции. Там разбирались все
// основные приёмы: состояние, пропсы, рендер списков, колбэки.
//
// Ниже — пустой каркас. Здесь можно начать писать.

import { useState } from 'react';
import Header from './components/Header';
import Calendar from './components/Calendar';
import TimeSlots from './components/TimeSlots';
import { MONTH_NAMES, WEEKDAYS_FULL, compareDates } from './utils/date';

const SLOTS_DATA = [ 
  { time: "10:00", available: true },
  { time: "11:00", available: false },
  { time: "12:00", available: true },
  { time: "13:00", available: false },
  { time: "14:00", available: true },
  { time: "15:00", available: true },
  { time: "16:00", available: true },
  { time: "17:00", available: true }
];

const TODAY = new Date();

function App() {
  const [currentYear, setCurrentYear] = useState(TODAY.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(TODAY.getMonth());
  const [selectedDay, setSelectedDay] = useState(TODAY.getDate());
  const [selectedTime, setSelectedTime] = useState(null);

  const handleDayClick = (day) => {
    setSelectedDay(day);
    setSelectedTime(null);
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

  let summaryText = "Выберите дату и время";
  if (selectedDay) {
    const date = new Date(currentYear, currentMonth, selectedDay);
    summaryText = `${WEEKDAYS_FULL[date.getDay()]}, ${selectedDay} ${MONTH_NAMES[currentMonth].toLowerCase()} ${currentYear}`;
    if (selectedTime) summaryText += ` • ${selectedTime}`;
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
            slots={SLOTS_DATA}
            selectedTime={selectedTime}
            onSlotClick={setSelectedTime}
          />
        </div>

        <div className="booking-summary">
          <div className="summary-text">{summaryText}</div>
        </div>

        <div className="actions">
          <button className="btn btn-back">Назад</button>
          <button 
            className="btn btn-next" 
            disabled={!selectedTime}
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

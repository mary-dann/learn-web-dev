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


import { useState, useEffect } from 'react';
import Header from './components/Header';
import Calendar from './components/Calendar';
import TimeSlots from './components/TimeSlots';
import SummaryBar from './components/SummaryBar';
import { fetchToday, fetchSlots } from './api';
import { MONTH_NAMES, WEEKDAYS_FULL, compareDates } from './utils/date';

function App() {
  // Состояния для "Сегодня"
  const [today, setToday] = useState(null);
  const [loadingToday, setLoadingToday] = useState(true);
  const [errorToday, setErrorToday] = useState(null);

  // Состояния календаря
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(null);

  // Состояния для слотов
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [errorSlots, setErrorSlots] = useState(null);
  
  const [selectedTime, setSelectedTime] = useState(null);

  // Загружаем "Сегодня" при монтировании
  useEffect(() => {
    async function loadToday() {
      try {
        setLoadingToday(true);
        const data = await fetchToday();
        setToday(data);
        
        // Инициализируем календарь на эту дату
        setCurrentYear(data.year);
        setCurrentMonth(data.month);
        setSelectedDay(data.day);
      } catch (err) {
        setErrorToday(err.message);
      } finally {
        setLoadingToday(false);
      }
    }
    loadToday();
  }, []);

  // Загружаем слоты при смене выбранного дня
  useEffect(() => {
    if (!selectedDay) return;

    async function loadSlots() {
      try {
        setLoadingSlots(true);
        setErrorSlots(null);
        const data = await fetchSlots({ day: selectedDay, month: currentMonth, year: currentYear });
        
        // если ответ пришел не для того дня, игнорируем его
        if (data.date.day !== selectedDay || data.date.month !== currentMonth || data.date.year !== currentYear) {
            return;
        }
        
        setSlots(data.slots);
      } catch (err) {
        setErrorSlots(err.message);
      } finally {
        setLoadingSlots(false);
      }
    }
    loadSlots();
  }, [selectedDay, currentMonth, currentYear]);

  // Смена месяца
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
    setSelectedTime(null);

    // Сброс дня при смене месяца
    if (compareDates(newYear, newMonth, 1, today.year, today.month, today.day) >= 0) {
      setSelectedDay(1);
    } else if (newYear === today.year && newMonth === today.month) {
      setSelectedDay(today.day);
    } else {
      setSelectedDay(null);
    }
  };

  const handleDayClick = (day) => {
    setSelectedDay(day);
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
    if (selectedTime) {
      summaryText += ` • ${selectedTime}`;
    } else {
      summaryText += ` • Выберите время`; 
    }
  }

  // Заглушка, пока грузится "Сегодня"
  if (loadingToday) {
    return <div className="page main"><h1 className="main-title">Загрузка...</h1></div>;
  }

  // Ошибка загрузки "Сегодня"
  if (errorToday) {
    return <div className="page main"><h1 className="main-title error">Ошибка: {errorToday}</h1></div>;
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
            today={today}
            onDayClick={handleDayClick}
            onPrevMonth={() => changeMonth(-1)}
            onNextMonth={() => changeMonth(1)}
          />

          <TimeSlots 
            slots={slots}
            selectedTime={selectedTime}
            onSlotClick={setSelectedTime}
            loading={loadingSlots}
            error={errorSlots}
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
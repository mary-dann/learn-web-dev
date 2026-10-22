// JavaScript для страницы выбора даты и времени.
//
// ЗАДАНИЕ
// ========
// Оживить свою свёрстанную страницу. Скорее всего на ней будет работать:
//   1. При открытии страницы выбрать день по умолчанию.
//   2. По клику на день — день становится выбранным,
//      слоты обновляются.
//   3. По клику на слот — время становится выбранным,
//      попадает в нижнюю панель.
//   4. Стрелки «‹» и «›» листают месяцы.
//   5. Дни раньше «сегодня» нельзя выбрать.
//   6. Нижняя панель обновляется при выборе дня и времени.
//
// ГДЕ ЖИВУТ ДАННЫЕ
// ----------------
// Слотов пока нет с сервера. Захардкодьте массив в этом файле.
// Формат слота: { time: "10:00", available: true }.
// «Сегодня» можно взять из new Date() или захардкодить —
// как удобнее для проверки.
//
// СТРУКТУРА КОДА
// --------------
// Разделите код на смысловые части комментариями:
//   1. Данные (слоты, «сегодня»).
//   2. Состояние (месяц, день, время, слоты).
//   3. Чистые функции (для работы с датами).
//   4. Отрисовка и обработчики.
//   5. Инициализация.
//
// ЧИСТЫЕ ФУНКЦИИ
// --------------
// Если понадобится строить сетку календаря — вот функция,
// которую можно использовать. Она не зависит от DOM,
// просто принимает год и месяц и возвращает массив недель.
//
// function buildCalendarGrid(year, month) {
//   const firstDay = new Date(year, month, 1);
//   const lastDay = new Date(year, month + 1, 0);
//   const daysInMonth = lastDay.getDate();
//   const startDayOfWeek = firstDay.getDay();
//   const offset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
//   const prevMonthLastDay = new Date(year, month, 0).getDate();
//
//   const cells = [];
//
//   for (let i = offset - 1; i >= 0; i--) {
//     cells.push({ day: prevMonthLastDay - i, otherMonth: true });
//   }
//   for (let d = 1; d <= daysInMonth; d++) {
//     cells.push({ day: d, otherMonth: false });
//   }
//   const totalCells = Math.ceil(cells.length / 7) * 7;
//   let nextDay = 1;
//   while (cells.length < totalCells) {
//     cells.push({ day: nextDay, otherMonth: true });
//     nextDay++;
//   }
//
//   const weeks = [];
//   for (let i = 0; i < cells.length; i += 7) {
//     weeks.push(cells.slice(i, i + 7));
//   }
//   return weeks;
// }

// Начните писать код здесь.


// 1. Данные
// слоты
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

// сегодня
const TODAY = new Date();

const MONTH_NAMES = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
];

const WEEKDAYS_FULL = [
  "Воскресенье", "Понедельник", "Вторник", "Среда", 
  "Четверг", "Пятница", "Суббота"
];

// 2. Состояние
const state = {
  currentYear: TODAY.getFullYear(),
  currentMonth: TODAY.getMonth(),
  selectedDay: TODAY.getDate(),
  selectedTime: null
};

// 3. Чистые функции
// построения сетки 
function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();
  const offset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const cells = [];

  for (let i = offset - 1; i >= 0; i--) {
    cells.push({ day: prevMonthLastDay - i, otherMonth: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, otherMonth: false });
  }
  const totalCells = Math.ceil(cells.length / 7) * 7;
  let nextDay = 1;
  while (cells.length < totalCells) {
    cells.push({ day: nextDay, otherMonth: true });
    nextDay++;
  }

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

// сравнение дат (по году, месяцу и дню)
function compareDates(y1, m1, d1, y2, m2, d2) {
  const date1 = new Date(y1, m1, d1);
  const date2 = new Date(y2, m2, d2);
  if (date1 < date2) return -1;
  if (date1 > date2) return 1;
  return 0;
}

// проверка, можно ли выбрать день
function isDaySelectable(year, month, day, otherMonth) {
  if (otherMonth) return false; // дни соседних месяцев нельзя
  const res = compareDates(year, month, day, TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());
  return res >= 0; // только сегодня и будущее
}

// 4. Отрисовка и обработчики
const gridContainer = document.getElementById("calendar-grid");
const monthLabel = document.getElementById("calendar-month");
const slotsContainer = document.getElementById("slots-grid");
const summaryText = document.getElementById("summary-text");

function renderCalendar() {
  // обновляем заголовок (месяц год)
  monthLabel.textContent = `${MONTH_NAMES[state.currentMonth]} ${state.currentYear}`;

  // получаем сетку
  const weeks = buildCalendarGrid(state.currentYear, state.currentMonth);
  let html = "";

  weeks.forEach(week => {
    week.forEach(cell => {
      const isSelectable = isDaySelectable(state.currentYear, state.currentMonth, cell.day, cell.otherMonth);
      const isSelected = !cell.otherMonth && cell.day === state.selectedDay;

      // формируем классы
      let classes = "day";
      if (cell.otherMonth) classes += " other-month";
      if (!isSelectable) classes += " disabled";
      if (isSelected) classes += " selected";

      // если день недоступен — disabled, иначе data-атрибуты для клика
      const disabledAttr = !isSelectable ? "disabled" : "";
      
      html += `<button type="button" class="${classes}" data-day="${cell.day}" ${disabledAttr}>${cell.day}</button>`;
    });
  });

  gridContainer.innerHTML = html;

  // вешаем обработчики на доступные дни
  const dayButtons = gridContainer.querySelectorAll(".day:not(.disabled)");
  dayButtons.forEach(btn => {
    btn.addEventListener("click", onDayClick);
  });
}

function renderSlots() {
  let html = "";

  SLOTS_DATA.forEach(slot => {
    let classes = "slot";
    if (!slot.available) classes += " busy";
    if (slot.time === state.selectedTime) classes += " selected";

    const disabledAttr = !slot.available ? "disabled" : "";

    html += `
      <button type="button" class="${classes}" data-time="${slot.time}" ${disabledAttr}>
        <span class="slot-time">${slot.time}</span>
        ${!slot.available ? '<span class="slot-status">Занято</span>' : ''}
      </button>
    `;
  });

  slotsContainer.innerHTML = html;

  // вешаем обработчики на доступные слоты
  const slotButtons = slotsContainer.querySelectorAll(".slot:not(.busy)");
  slotButtons.forEach(btn => {
    btn.addEventListener("click", onSlotClick);
  });
}

function renderSummary() {
  if (!state.selectedDay) {
    summaryText.textContent = "Выберите дату и время";
    return;
  }

  const date = new Date(state.currentYear, state.currentMonth, state.selectedDay);
  const dayOfWeek = WEEKDAYS_FULL[date.getDay()];
  const monthName = MONTH_NAMES[state.currentMonth].toLowerCase();

  let text = `${dayOfWeek}, ${state.selectedDay} ${monthName} ${state.currentYear}`;
  if (state.selectedTime) {
    text += ` • ${state.selectedTime}`;
  }

  summaryText.textContent = text;

  // если время не выбрано — кнопка неактивна (true), если выбрано — активна (false)
  const nextBtn = document.querySelector(".btn-next");
  if (nextBtn) {
    nextBtn.disabled = !state.selectedTime;
  }
}

function onDayClick(event) {
  const day = parseInt(event.currentTarget.dataset.day);
  
  state.selectedDay = day;
  state.selectedTime = null; // Сбрасываем время при смене дня

  renderCalendar();
  renderSlots();
  renderSummary();
}

function onSlotClick(event) {
  const time = event.currentTarget.dataset.time;
  state.selectedTime = time;

  renderSlots();
  renderSummary();
}

function changeMonth(direction) {
  state.currentMonth += direction;
  
  if (state.currentMonth < 0) {
    state.currentMonth = 11;
    state.currentYear--;
  } else if (state.currentMonth > 11) {
    state.currentMonth = 0;
    state.currentYear++;
  }

  // если переключили месяц, сбрасываем выбранный день и время
  state.selectedDay = null;
  state.selectedTime = null;

  // автовыбор: первый доступный день в новом месяце
  const firstDay = new Date(state.currentYear, state.currentMonth, 1);
  if (compareDates(state.currentYear, state.currentMonth, 1, TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate()) >= 0) {
    state.selectedDay = 1; // весь месяц в будущем — выбираем 1
  } else if (state.currentYear === TODAY.getFullYear() && state.currentMonth === TODAY.getMonth()) {
    state.selectedDay = TODAY.getDate(); // текущий месяц — выбираем сегодня
  }

  renderCalendar();
  renderSlots();
  renderSummary();
}

// 5. Инициализация
document.getElementById("prev-month").addEventListener("click", () => changeMonth(-1));
document.getElementById("next-month").addEventListener("click", () => changeMonth(1));

// первый запуск при загрузке
renderCalendar();
renderSlots();
renderSummary();

document.querySelector(".btn-next").addEventListener("click", () => {
  // проверяем, что дата и время точно выбраны
  if (state.selectedDay && state.selectedTime) {
    
    // форматируем красивую строку 
    const date = new Date(state.currentYear, state.currentMonth, state.selectedDay);
    const dateOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    let dateString = date.toLocaleDateString('ru-RU', dateOptions);
    dateString = dateString.charAt(0).toUpperCase() + dateString.slice(1);
    
    // сохраняем в память браузера (localStorage)
    localStorage.setItem("bookingDate", `${dateString} • ${state.selectedTime}`);
    
    // переходим на страницу подтверждения
    window.location.href = "confirm.html";
  }
});
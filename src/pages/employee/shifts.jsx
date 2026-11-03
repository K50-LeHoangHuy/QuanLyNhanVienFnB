
import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
} from "lucide-react";
import "./shifts.css";

function getStoredData(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function formatDate(date) {
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function EmployeeShifts({ currentUser }) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [selectedDate, setSelectedDate] = useState(
    () => getDateKey(new Date())
  );

const employee = useMemo(() => {
  const employees = getStoredData("employees", []);

  return employees.find(
    (item) =>
      String(item.id) === String(currentUser?.employeeCode) ||
      String(item.id) === String(currentUser?.employeeId)
  );
}, [currentUser]);

  const assignments = useMemo(() => {
    const storedAssignments = getStoredData(
      "shiftAssignments",
      []
    );

    if (!employee) return [];

    return storedAssignments
      .filter(
        (item) =>
          String(item.employeeId) === String(employee.id) &&
          item.status !== "DA_HUY"
      )
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        return dateCompare || a.startTime.localeCompare(b.startTime);
      });
  }, [employee]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Lịch bắt đầu từ thứ Hai
  const startingDay = (firstDay.getDay() + 6) % 7;

  const calendarDays = [];

  for (let i = 0; i < startingDay; i++) {
    calendarDays.push(null);
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    calendarDays.push(new Date(year, month, day));
  }

  const monthAssignments = assignments.filter((item) => {
    const [itemYear, itemMonth] = item.date.split("-").map(Number);

    return itemYear === year && itemMonth === month + 1;
  });

  const selectedAssignments = assignments.filter(
    (item) => item.date === selectedDate
  );

  const getAssignmentsByDate = (date) => {
    const dateKey = getDateKey(date);

    return monthAssignments.filter(
      (item) => item.date === dateKey
    );
  };

  const changeMonth = (amount) => {
    setCurrentMonth(
      (prev) =>
        new Date(
          prev.getFullYear(),
          prev.getMonth() + amount,
          1
        )
    );
  };

  const goToToday = () => {
    const today = new Date();

    setCurrentMonth(
      new Date(today.getFullYear(), today.getMonth(), 1)
    );

    setSelectedDate(getDateKey(today));
  };

  const getStatusLabel = (status) => {
    const labels = {
      DA_PHAN_CONG: "Đã phân công",
      HOAN_THANH: "Hoàn thành",
      VANG_MAT: "Vắng mặt",
    };

    return labels[status] || status;
  };

  const monthName = currentMonth.toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });

  const todayKey = getDateKey(new Date());

  return (
    <div className="employee-shifts-page">
      <div className="employee-shifts-header">
        <div>
          <h1>Lịch làm việc</h1>
          <p>
            Theo dõi các ca làm việc được quản lý phân công cho bạn.
          </p>
        </div>

        <div className="employee-shifts-date">
          <CalendarDays size={20} />
          <span>Hôm nay: {formatDate(new Date())}</span>
        </div>
      </div>

      <div className="employee-shifts-summary">
        <div className="employee-shifts-summary-card">
          <div className="employee-shifts-summary-icon blue">
            <CalendarDays size={22} />
          </div>
          <div>
            <span>Ca trong tháng</span>
            <strong>{monthAssignments.length}</strong>
          </div>
        </div>

        <div className="employee-shifts-summary-card">
          <div className="employee-shifts-summary-icon green">
            <Clock size={22} />
          </div>
          <div>
            <span>Ca hôm nay</span>
            <strong>
              {assignments.filter((item) => item.date === todayKey).length}
            </strong>
          </div>
        </div>

        <div className="employee-shifts-summary-card">
          <div className="employee-shifts-summary-icon orange">
            <Coffee size={22} />
          </div>
          <div>
            <span>Ca sắp tới</span>
            <strong>
              {assignments.filter((item) => item.date >= todayKey).length}
            </strong>
          </div>
        </div>
      </div>

      <div className="employee-shifts-content">
        <section className="employee-calendar-panel">
          <div className="employee-calendar-heading">
            <div>
              <h2>Lịch theo tháng</h2>
              <p>Chọn một ngày để xem chi tiết ca làm.</p>
            </div>

            <button
              className="employee-today-button"
              onClick={goToToday}
              type="button"
            >
              Hôm nay
            </button>
          </div>

          <div className="employee-calendar-navigation">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              aria-label="Tháng trước"
            >
              <ChevronLeft size={20} />
            </button>

            <h3>{monthName}</h3>

            <button
              type="button"
              onClick={() => changeMonth(1)}
              aria-label="Tháng sau"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="employee-calendar-grid">
            {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map(
              (day) => (
                <div className="employee-calendar-weekday" key={day}>
                  {day}
                </div>
              )
            )}

            {calendarDays.map((date, index) => {
              if (!date) {
                return (
                  <div
                    className="employee-calendar-empty"
                    key={`empty-${index}`}
                  />
                );
              }

              const dateKey = getDateKey(date);
              const dayAssignments = getAssignmentsByDate(date);
              const isSelected = dateKey === selectedDate;
              const isToday = dateKey === todayKey;

              return (
                <button
                  type="button"
                  key={dateKey}
                  className={`employee-calendar-day ${
                    isSelected ? "selected" : ""
                  } ${isToday ? "today" : ""}`}
                  onClick={() => setSelectedDate(dateKey)}
                >
                  <span>{date.getDate()}</span>

                  {dayAssignments.length > 0 && (
                    <div className="employee-calendar-dots">
                      {dayAssignments.slice(0, 3).map((item) => (
                        <span
                          key={item.id}
                          className="employee-calendar-dot"
                          title={item.shiftName}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="employee-calendar-legend">
            <span>
              <i className="legend-dot" />
              Có lịch làm việc
            </span>
            <span>
              <i className="legend-today" />
              Hôm nay
            </span>
          </div>
        </section>

        <section className="employee-selected-day-panel">
          <div className="employee-selected-day-heading">
            <div>
              <h2>Chi tiết ca làm</h2>
              <p>{formatDate(new Date(`${selectedDate}T00:00:00`))}</p>
            </div>
            <CalendarDays size={22} />
          </div>

          {selectedAssignments.length > 0 ? (
            <div className="employee-selected-shift-list">
              {selectedAssignments.map((item) => (
                <div
                  className="employee-selected-shift"
                  key={item.id}
                >
                  <div className="employee-selected-shift-icon">
                    <Coffee size={21} />
                  </div>

                  <div className="employee-selected-shift-info">
                    <h3>{item.shiftName}</h3>

                    <p>
                      <Clock size={15} />
                      {item.startTime} – {item.endTime}
                    </p>

                    <span className="employee-assignment-status">
                      {getStatusLabel(item.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="employee-shifts-empty">
              <CalendarDays size={36} />
              <h3>Không có ca làm</h3>
              <p>
                Bạn không được phân công làm việc vào ngày này.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default EmployeeShifts;

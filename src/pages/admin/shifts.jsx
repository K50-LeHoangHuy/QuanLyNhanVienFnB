
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  Users,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
} from "lucide-react";
import "./shifts.css";

const defaultShifts = [
  {
    id: "CA01",
    name: "Ca sáng",
    startTime: "07:00",
    endTime: "12:00",
    maxEmployees: 5,
  },
  {
    id: "CA02",
    name: "Ca chiều",
    startTime: "12:00",
    endTime: "17:00",
    maxEmployees: 5,
  },
];

const today = new Date().toLocaleDateString("en-CA");

function getStoredData(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function Shifts() {
  const [shifts, setShifts] = useState(() =>
    getStoredData("workShifts", defaultShifts)
  );

  const [employees] = useState(() =>
    getStoredData("employees", [])
  );

  const [assignments, setAssignments] = useState(() =>
    getStoredData("shiftAssignments", [])
  );

  const [selectedDate, setSelectedDate] = useState(today);
  const [editingShift, setEditingShift] = useState(null);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedShift, setSelectedShift] = useState("CA01");
  const [message, setMessage] = useState("");

  useEffect(() => {
    localStorage.setItem("workShifts", JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    localStorage.setItem(
      "shiftAssignments",
      JSON.stringify(assignments)
    );
  }, [assignments]);

  const activeEmployees = useMemo(
    () =>
      employees.filter(
        (employee) => employee.status === "Đang làm việc"
      ),
    [employees]
  );

  const dailyAssignments = assignments.filter(
    (item) =>
      item.date === selectedDate &&
      item.status !== "DA_HUY"
  );

  const getShiftAssignments = (shiftId) =>
    dailyAssignments.filter((item) => item.shiftId === shiftId);

  const handleUpdateShift = (event) => {
    event.preventDefault();

    const start = timeToMinutes(editingShift.startTime);
    const end = timeToMinutes(editingShift.endTime);

    if (end <= start) {
      setMessage("Giờ kết thúc phải sau giờ bắt đầu.");
      return;
    }

    if (Number(editingShift.maxEmployees) < 1) {
      setMessage("Số nhân viên tối đa phải lớn hơn 0.");
      return;
    }

    const currentCount = assignments.filter(
      (item) =>
        item.shiftId === editingShift.id &&
        item.status !== "DA_HUY" &&
        item.date >= today
    ).length;

    if (Number(editingShift.maxEmployees) < currentCount) {
      setMessage(
        "Số lượng tối đa không thể nhỏ hơn số nhân viên đã được phân trong các lịch từ hôm nay trở đi."
      );
      return;
    }

    setShifts((prev) =>
      prev.map((shift) =>
        shift.id === editingShift.id
          ? {
              ...shift,
              startTime: editingShift.startTime,
              endTime: editingShift.endTime,
              maxEmployees: Number(editingShift.maxEmployees),
            }
          : shift
      )
    );

    setEditingShift(null);
    setMessage("Cập nhật cấu hình ca làm thành công.");
  };

  const handleAddAssignment = (event) => {
    event.preventDefault();

    const employee = employees.find(
      (item) => item.id === selectedEmployee
    );

    const shift = shifts.find(
      (item) => item.id === selectedShift
    );

    if (!employee || !shift) {
      setMessage("Vui lòng chọn nhân viên và ca làm.");
      return;
    }

    if (employee.status !== "Đang làm việc") {
      setMessage("Chỉ nhân viên đang làm việc mới được phân ca.");
      return;
    }

    const currentShiftAssignments = getShiftAssignments(shift.id);

    if (currentShiftAssignments.length >= shift.maxEmployees) {
      setMessage("Ca làm đã đạt số lượng nhân viên tối đa.");
      return;
    }

    const newStart = timeToMinutes(shift.startTime);
    const newEnd = timeToMinutes(shift.endTime);

    const hasOverlap = dailyAssignments.some((item) => {
      if (item.employeeId !== employee.id) return false;

      const oldStart = timeToMinutes(item.startTime);
      const oldEnd = timeToMinutes(item.endTime);

      return newStart < oldEnd && newEnd > oldStart;
    });

    if (hasOverlap) {
      setMessage("Nhân viên này đã có ca làm bị trùng thời gian.");
      return;
    }

    const newAssignment = {
      id: `PC${Date.now()}`,
      date: selectedDate,
      employeeId: employee.id,
      employeeName: employee.name,
      shiftId: shift.id,
      shiftName: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      status: "DA_PHAN_CONG",
    };

    setAssignments((prev) => [...prev, newAssignment]);
    setShowAssignmentForm(false);
    setSelectedEmployee("");
    setMessage("Phân ca thành công.");
  };

  const handleCancelAssignment = (id) => {
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn hủy phân ca này?"
    );

    if (!confirmed) return;

    setAssignments((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: "DA_HUY" }
          : item
      )
    );

    setMessage("Đã hủy phân ca.");
  };

  const getStatusLabel = (status) => {
    const labels = {
      DA_PHAN_CONG: "Đã phân công",
      DA_HUY: "Đã hủy",
      HOAN_THANH: "Hoàn thành",
      VANG_MAT: "Vắng mặt",
    };

    return labels[status] || status;
  };

  const totalAssigned = dailyAssignments.length;

  return (
    <div className="shifts-page">
      <div className="shifts-header">
        <div>
          <h1>Quản lý ca làm</h1>
          <p>Thiết lập ca làm và phân công nhân viên theo ngày.</p>
        </div>

        <button
          className="shift-primary-btn"
          onClick={() => setShowAssignmentForm(true)}
        >
          <Plus size={18} />
          Phân ca mới
        </button>
      </div>

      {message && (
        <div className="shift-message">
          <span>{message}</span>
          <button onClick={() => setMessage("")}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className="shift-summary">
        <div className="shift-summary-card">
          <div className="shift-summary-icon">
            <Clock size={22} />
          </div>
          <div>
            <span>Ca làm cố định</span>
            <strong>{shifts.length}</strong>
          </div>
        </div>

        <div className="shift-summary-card">
          <div className="shift-summary-icon">
            <Users size={22} />
          </div>
          <div>
            <span>Nhân viên đã phân ca</span>
            <strong>{totalAssigned}</strong>
          </div>
        </div>

        <div className="shift-summary-card">
          <div className="shift-summary-icon">
            <CalendarDays size={22} />
          </div>
          <div>
            <span>Ngày đang xem</span>
            <strong>
              {new Date(
                `${selectedDate}T00:00:00`
              ).toLocaleDateString("vi-VN")}
            </strong>
          </div>
        </div>
      </div>

      <section className="shift-section">
        <div className="shift-section-heading">
          <div>
            <h2>Cấu hình ca làm</h2>
            <p>Quản lý thời gian và số lượng nhân viên của từng ca.</p>
          </div>
        </div>

        <div className="shift-config-grid">
          {shifts.map((shift) => (
            <div className="shift-config-card" key={shift.id}>
              <div className="shift-config-top">
                <div>
                  <span className="shift-code">{shift.id}</span>
                  <h3>{shift.name}</h3>
                </div>

                <button
                  className="shift-icon-btn"
                  title="Chỉnh sửa ca"
                  onClick={() => {
                    setMessage("");
                    setEditingShift({ ...shift });
                  }}
                >
                  <Pencil size={17} />
                </button>
              </div>

              <div className="shift-time">
                <Clock size={18} />
                <strong>
                  {shift.startTime} – {shift.endTime}
                </strong>
              </div>

              <div className="shift-capacity">
                <Users size={18} />
                <span>
                  Tối đa {shift.maxEmployees} nhân viên
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="shift-section">
        <div className="shift-section-heading schedule-heading">
          <div>
            <h2>Lịch phân ca</h2>
            <p>Danh sách nhân viên được phân công trong ngày.</p>
          </div>

          <div className="shift-date-picker">
            <CalendarDays size={18} />
            <input
              type="date"
              value={selectedDate}
              onChange={(event) =>
                setSelectedDate(event.target.value)
              }
            />
          </div>
        </div>

        <div className="daily-shifts">
          {shifts.map((shift) => {
            const shiftAssignments = getShiftAssignments(shift.id);

            return (
              <div className="daily-shift-card" key={shift.id}>
                <div className="daily-shift-header">
                  <div>
                    <h3>{shift.name}</h3>
                    <span>
                      {shift.startTime} – {shift.endTime}
                    </span>
                  </div>

                  <span className="shift-count">
                    {shiftAssignments.length}/{shift.maxEmployees} nhân viên
                  </span>
                </div>

                {shiftAssignments.length === 0 ? (
                  <div className="shift-empty">
                    Chưa có nhân viên được phân vào ca này.
                  </div>
                ) : (
                  <div className="shift-assignment-list">
                    {shiftAssignments.map((item) => (
                      <div
                        className="shift-assignment-item"
                        key={item.id}
                      >
                        <div className="assignment-avatar">
                          {item.employeeName?.charAt(0) || "N"}
                        </div>

                        <div className="assignment-info">
                          <strong>{item.employeeName}</strong>
                          <span>
                            {item.employeeId} · {item.startTime} – {item.endTime}
                          </span>
                        </div>

                        <span
                          className={`assignment-status ${item.status.toLowerCase()}`}
                        >
                          {getStatusLabel(item.status)}
                        </span>

                        {item.status === "DA_PHAN_CONG" && (
                          <button
                            className="shift-delete-btn"
                            title="Hủy phân ca"
                            onClick={() =>
                              handleCancelAssignment(item.id)
                            }
                          >
                            <Trash2 size={17} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {editingShift && (
        <div className="shift-modal-overlay">
          <form
            className="shift-modal"
            onSubmit={handleUpdateShift}
          >
            <div className="shift-modal-header">
              <div>
                <h2>Chỉnh sửa ca làm</h2>
                <p>{editingShift.name}</p>
              </div>

              <button
                type="button"
                className="shift-icon-btn"
                onClick={() => setEditingShift(null)}
              >
                <X size={20} />
              </button>
            </div>

            <label>
              Giờ bắt đầu
              <input
                type="time"
                value={editingShift.startTime}
                onChange={(event) =>
                  setEditingShift({
                    ...editingShift,
                    startTime: event.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              Giờ kết thúc
              <input
                type="time"
                value={editingShift.endTime}
                onChange={(event) =>
                  setEditingShift({
                    ...editingShift,
                    endTime: event.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              Số nhân viên tối đa
              <input
                type="number"
                min="1"
                value={editingShift.maxEmployees}
                onChange={(event) =>
                  setEditingShift({
                    ...editingShift,
                    maxEmployees: event.target.value,
                  })
                }
                required
              />
            </label>

            <div className="shift-modal-actions">
              <button
                type="button"
                className="shift-cancel-btn"
                onClick={() => setEditingShift(null)}
              >
                Hủy
              </button>

              <button type="submit" className="shift-primary-btn">
                <Save size={17} />
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      )}

      {showAssignmentForm && (
        <div className="shift-modal-overlay">
          <form
            className="shift-modal"
            onSubmit={handleAddAssignment}
          >
            <div className="shift-modal-header">
              <div>
                <h2>Phân ca mới</h2>
                <p>
                  Ngày {new Date(
                    `${selectedDate}T00:00:00`
                  ).toLocaleDateString("vi-VN")}
                </p>
              </div>

              <button
                type="button"
                className="shift-icon-btn"
                onClick={() => setShowAssignmentForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            <label>
              Chọn nhân viên
              <select
                value={selectedEmployee}
                onChange={(event) =>
                  setSelectedEmployee(event.target.value)
                }
                required
              >
                <option value="">-- Chọn nhân viên --</option>
                {activeEmployees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.id} - {employee.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Chọn ca làm
              <select
                value={selectedShift}
                onChange={(event) =>
                  setSelectedShift(event.target.value)
                }
              >
                {shifts.map((shift) => (
                  <option key={shift.id} value={shift.id}>
                    {shift.name} ({shift.startTime} – {shift.endTime})
                  </option>
                ))}
              </select>
            </label>

            {activeEmployees.length === 0 && (
              <p className="shift-form-note">
                Chưa có nhân viên đang làm việc. Hãy thêm nhân viên ở trang Nhân viên trước.
              </p>
            )}

            <div className="shift-modal-actions">
              <button
                type="button"
                className="shift-cancel-btn"
                onClick={() => setShowAssignmentForm(false)}
              >
                Hủy
              </button>

              <button
                type="submit"
                className="shift-primary-btn"
                disabled={activeEmployees.length === 0}
              >
                <Plus size={17} />
                Xác nhận phân ca
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Shifts;


import { useEffect, useMemo, useState } from "react";
import {
  Clock,
  CalendarDays,
  LogIn,
  LogOut,
  History,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import "./attendance.css";

function getStoredData(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCurrentTime() {
  return new Date().toTimeString().slice(0, 5);
}

function formatDate(value) {
  if (!value) return "--";

  return new Date(`${value}T00:00:00`).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getStatusLabel(status) {
  const labels = {
    CHO_DUYET: "Chờ quản lý duyệt",
    DA_DUYET: "Đã được duyệt",
    TU_CHOI: "Bị từ chối",
  };

  return labels[status] || "Chưa thực hiện";
}

function EmployeeAttendance({ currentUser }) {
  const today = getTodayDate();

  const employeeCode =
    currentUser?.employeeCode || currentUser?.employeeId;

  const [assignments] = useState(() =>
    getStoredData("shiftAssignments", [])
  );

  const [records, setRecords] = useState(() =>
    getStoredData("attendanceRecords", [])
  );

  const [message, setMessage] = useState("");

  // Lưu hồ sơ chấm công vào localStorage
  useEffect(() => {
    localStorage.setItem(
      "attendanceRecords",
      JSON.stringify(records)
    );
  }, [records]);

  // Lấy các ca làm của nhân viên trong ngày hôm nay
  const todayAssignments = useMemo(() => {
    return assignments
      .filter(
        (item) =>
          String(item.employeeId) === String(employeeCode) &&
          item.date === today &&
          item.status !== "DA_HUY"
      )
      .sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      );
  }, [assignments, employeeCode, today]);

  // Lấy lịch sử chấm công của nhân viên
  const historyRecords = useMemo(() => {
    return records
      .filter(
        (item) =>
          String(item.employeeId) === String(employeeCode)
      )
      .sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date);
        return (
          dateCompare ||
          b.shiftStartTime.localeCompare(a.shiftStartTime)
        );
      });
  }, [records, employeeCode]);

  // Tìm hồ sơ chấm công của một ca
  const getRecord = (assignmentId) => {
    return records.find(
      (item) => item.assignmentId === assignmentId
    );
  };

  // Nhân viên Check-in
  const handleCheckIn = (assignment) => {
    const currentTime = getCurrentTime();

    setRecords((prev) => {
      const existingRecord = prev.find(
        (item) => item.assignmentId === assignment.id
      );

      // Nếu đã có hồ sơ thì cập nhật hồ sơ đó
      if (existingRecord) {
        if (
          existingRecord.checkInStatus !== "TU_CHOI" &&
          existingRecord.checkInTime
        ) {
          return prev;
        }

        return prev.map((item) =>
          item.id === existingRecord.id
            ? {
                ...item,
                checkInTime: currentTime,
                checkInStatus: "CHO_DUYET",
              }
            : item
        );
      }

      // Nếu chưa có hồ sơ thì tạo mới
      const newRecord = {
        id: `CC${Date.now()}`,
        assignmentId: assignment.id,
        employeeId: assignment.employeeId,
        employeeName: assignment.employeeName,
        date: assignment.date,
        shiftId: assignment.shiftId,
        shiftName: assignment.shiftName,
        shiftStartTime: assignment.startTime,
        shiftEndTime: assignment.endTime,
        checkInTime: currentTime,
        checkInStatus: "CHO_DUYET",
        checkOutTime: null,
        checkOutStatus: null,
        supplementReason: "",
        supplementedBy: "",
        supplementedAt: null,
      };

      return [...prev, newRecord];
    });

    setMessage("Đã gửi yêu cầu Check-in. Vui lòng chờ quản lý duyệt.");
  };

  // Nhân viên Check-out
  const handleCheckOut = (assignment) => {
    const currentTime = getCurrentTime();

    setRecords((prev) =>
      prev.map((item) =>
        item.assignmentId === assignment.id
          ? {
              ...item,
              checkOutTime: currentTime,
              checkOutStatus: "CHO_DUYET",
            }
          : item
      )
    );

    setMessage("Đã gửi yêu cầu Check-out. Vui lòng chờ quản lý duyệt.");
  };

  const renderStatus = (status) => {
    if (!status) {
      return (
        <span className="employee-attendance-status neutral">
          Chưa thực hiện
        </span>
      );
    }

    return (
      <span
        className={`employee-attendance-status ${status.toLowerCase()}`}
      >
        {getStatusLabel(status)}
      </span>
    );
  };

  return (
    <div className="employee-attendance-page">
      <div className="employee-attendance-header">
        <div>
          <h1>Chấm công</h1>
          <p>Theo dõi thời gian làm việc và thực hiện chấm công.</p>
        </div>
      </div>

      {message && (
        <div className="employee-attendance-message">
          <CheckCircle2 size={18} />
          <span>{message}</span>

          <button onClick={() => setMessage("")}>
            ×
          </button>
        </div>
      )}

      <section className="employee-attendance-section">
        <div className="employee-attendance-section-header">
          <div>
            <h2>
              <CalendarDays size={20} />
              Ca làm hôm nay
            </h2>
            <p>{formatDate(today)}</p>
          </div>
        </div>

        {todayAssignments.length > 0 ? (
          <div className="employee-attendance-list">
            {todayAssignments.map((assignment) => {
              const record = getRecord(assignment.id);

              const canCheckIn =
                !record?.checkInTime ||
                record?.checkInStatus === "TU_CHOI";

              const canCheckOut =
                record?.checkInStatus === "DA_DUYET" &&
                (
                  !record?.checkOutTime ||
                  record?.checkOutStatus === "TU_CHOI"
                );

              return (
                <div
                  className="employee-attendance-card"
                  key={assignment.id}
                >
                  <div className="employee-attendance-card-top">
                    <div>
                      <h3>{assignment.shiftName}</h3>
                      <p>
                        <Clock size={15} />
                        {assignment.startTime} – {assignment.endTime}
                      </p>
                    </div>

                    <span className="employee-attendance-shift-code">
                      {assignment.id}
                    </span>
                  </div>

                  <div className="employee-attendance-times">
                    <div>
                      <span>Check-in</span>
                      <strong>
                        {record?.checkInTime || "--:--"}
                      </strong>
                      {renderStatus(record?.checkInStatus)}
                    </div>

                    <div>
                      <span>Check-out</span>
                      <strong>
                        {record?.checkOutTime || "--:--"}
                      </strong>
                      {renderStatus(record?.checkOutStatus)}
                    </div>
                  </div>

                  {record?.checkInStatus === "TU_CHOI" && (
                    <div className="employee-attendance-warning">
                      <AlertCircle size={16} />
                      Check-in đã bị từ chối. Bạn có thể gửi lại yêu cầu.
                    </div>
                  )}

                  {record?.checkOutStatus === "TU_CHOI" && (
                    <div className="employee-attendance-warning">
                      <AlertCircle size={16} />
                      Check-out đã bị từ chối. Bạn có thể gửi lại yêu cầu.
                    </div>
                  )}

                  <div className="employee-attendance-actions">
                    <button
                      className="employee-checkin-btn"
                      disabled={!canCheckIn}
                      onClick={() => handleCheckIn(assignment)}
                    >
                      <LogIn size={17} />
                      {record?.checkInStatus === "TU_CHOI"
                        ? "Gửi lại Check-in"
                        : "Check-in"}
                    </button>

                    <button
                      className="employee-checkout-btn"
                      disabled={!canCheckOut}
                      onClick={() => handleCheckOut(assignment)}
                    >
                      <LogOut size={17} />
                      {record?.checkOutStatus === "TU_CHOI"
                        ? "Gửi lại Check-out"
                        : "Check-out"}
                    </button>
                  </div>

                  {record?.checkInStatus === "CHO_DUYET" && (
                    <p className="employee-attendance-note">
                      Check-in đang chờ quản lý duyệt.
                    </p>
                  )}

                  {record?.checkOutStatus === "CHO_DUYET" && (
                    <p className="employee-attendance-note">
                      Check-out đang chờ quản lý duyệt.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="employee-attendance-empty">
            <CalendarDays size={34} />
            <strong>Hôm nay bạn chưa có ca làm</strong>
            <p>Các ca được phân công sẽ hiển thị tại đây.</p>
          </div>
        )}
      </section>

      <section className="employee-attendance-section">
        <div className="employee-attendance-section-header">
          <div>
            <h2>
              <History size={20} />
              Lịch sử chấm công
            </h2>
            <p>Theo dõi các lần Check-in và Check-out trước đây.</p>
          </div>
        </div>

        <div className="employee-attendance-history-wrapper">
          <table className="employee-attendance-history">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Ca làm</th>
                <th>Check-in</th>
                <th>Trạng thái</th>
                <th>Check-out</th>
                <th>Trạng thái</th>
              </tr>
            </thead>

            <tbody>
              {historyRecords.map((record) => (
                <tr key={record.id}>
                  <td>{formatDate(record.date)}</td>

                  <td>
                    <strong>{record.shiftName}</strong>
                    <span className="employee-history-time">
                      {record.shiftStartTime} – {record.shiftEndTime}
                    </span>
                  </td>

                  <td>{record.checkInTime || "--:--"}</td>

                  <td>{renderStatus(record.checkInStatus)}</td>

                  <td>{record.checkOutTime || "--:--"}</td>

                  <td>{renderStatus(record.checkOutStatus)}</td>
                </tr>
              ))}

              {historyRecords.length === 0 && (
                <tr>
                  <td colSpan="6" className="employee-attendance-history-empty">
                    Chưa có lịch sử chấm công.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default EmployeeAttendance;

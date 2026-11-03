
import { useEffect, useMemo, useState } from "react";
import {
  Clock,
  CalendarDays,
  Users,
  Check,
  X,
  Plus,
  Search,
  AlertCircle,
} from "lucide-react";
import "./attendance.css";

const today = new Date().toLocaleDateString("en-CA");

function getStoredData(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function formatTime(value) {
  if (!value) return "--:--";

  return value;
}

function isShiftEnded(date, endTime) {
  const end = new Date(`${date}T${endTime}:00`);
  return new Date() > end;
}

function getAttendanceStatus(status) {
  const labels = {
    CHO_DUYET: "Chờ duyệt",
    DA_DUYET: "Đã duyệt",
    TU_CHOI: "Từ chối",
  };

  return labels[status] || "Chưa chấm công";
}

function Attendance() {
  const [employees] = useState(() =>
    getStoredData("employees", [])
  );

  const [assignments] = useState(() =>
    getStoredData("shiftAssignments", [])
  );

  const [records, setRecords] = useState(() =>
    getStoredData("attendanceRecords", [])
  );

  const [selectedDate, setSelectedDate] = useState(today);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [supplementRecord, setSupplementRecord] = useState(null);
  const [supplementTime, setSupplementTime] = useState("");
  const [supplementReason, setSupplementReason] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    localStorage.setItem(
      "attendanceRecords",
      JSON.stringify(records)
    );
  }, [records]);

  const dailyAssignments = useMemo(() => {
    return assignments.filter(
      (item) =>
        item.date === selectedDate &&
        item.status !== "DA_HUY"
    );
  }, [assignments, selectedDate]);

  const attendanceRows = useMemo(() => {
    return dailyAssignments.map((assignment) => {
      const record = records.find(
        (item) => item.assignmentId === assignment.id
      );

      const employee = employees.find(
        (item) => item.id === assignment.employeeId
      );

      return {
        ...assignment,
        employeeName:
          employee?.name || assignment.employeeName,
        record,
      };
    });
  }, [dailyAssignments, records, employees]);

  const filteredRows = attendanceRows.filter((item) => {
    const keyword = searchTerm.toLowerCase();

    const matchesSearch =
      item.employeeName?.toLowerCase().includes(keyword) ||
      item.employeeId?.toLowerCase().includes(keyword);

    const record = item.record;

    let matchesStatus = true;

    if (filterStatus === "PENDING") {
      matchesStatus =
        record?.checkInStatus === "CHO_DUYET" ||
        record?.checkOutStatus === "CHO_DUYET";
    }

    if (filterStatus === "MISSING") {
      matchesStatus =
        !!record?.checkInTime &&
        !record?.checkOutTime &&
        isShiftEnded(selectedDate, item.endTime);
    }

    if (filterStatus === "APPROVED") {
      matchesStatus =
        record?.checkInStatus === "DA_DUYET" &&
        (!record?.checkOutTime ||
          record?.checkOutStatus === "DA_DUYET");
    }

    return matchesSearch && matchesStatus;
  });

  const pendingCount = attendanceRows.filter(
    (item) =>
      item.record?.checkInStatus === "CHO_DUYET" ||
      item.record?.checkOutStatus === "CHO_DUYET"
  ).length;

  const missingCount = attendanceRows.filter(
    (item) =>
      item.record?.checkInTime &&
      !item.record?.checkOutTime &&
      isShiftEnded(selectedDate, item.endTime)
  ).length;

  const handleCreateRecord = (assignment) => {
    const existed = records.some(
      (item) => item.assignmentId === assignment.id
    );

    if (existed) return;

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
      checkInTime: null,
      checkInStatus: null,
      checkOutTime: null,
      checkOutStatus: null,
      supplementReason: "",
      supplementedBy: "",
      supplementedAt: null,
    };

    setRecords((prev) => [...prev, newRecord]);
    setMessage("Đã tạo hồ sơ chấm công.");
  };

  const handleApproval = (recordId, field, status) => {
    setRecords((prev) =>
      prev.map((record) =>
        record.id === recordId
          ? { ...record, [field]: status }
          : record
      )
    );

    setMessage(
      status === "DA_DUYET"
        ? "Đã duyệt chấm công."
        : "Đã từ chối chấm công."
    );
  };

  const handleSupplement = (event) => {
    event.preventDefault();

    if (!supplementTime || !supplementReason.trim()) {
      setMessage("Vui lòng nhập giờ Check-out và lý do bổ sung.");
      return;
    }

    const record = supplementRecord;
    const shiftEnd = record.shiftEndTime;

    const shiftStartMinutes =
      Number(record.shiftStartTime.split(":")[0]) * 60 +
      Number(record.shiftStartTime.split(":")[1]);

    const checkoutMinutes =
      Number(supplementTime.split(":")[0]) * 60 +
      Number(supplementTime.split(":")[1]);

    if (checkoutMinutes <= shiftStartMinutes) {
      setMessage("Giờ Check-out phải sau giờ bắt đầu ca.");
      return;
    }

    setRecords((prev) =>
      prev.map((item) =>
        item.id === record.id
          ? {
              ...item,
              checkOutTime: supplementTime,
              checkOutStatus: "CHO_DUYET",
              supplementReason: supplementReason.trim(),
              supplementedBy: "Quản lý",
              supplementedAt: new Date().toISOString(),
            }
          : item
      )
    );

    setSupplementRecord(null);
    setSupplementTime("");
    setSupplementReason("");
    setMessage(
      `Đã bổ sung Check-out. Lượt chấm công đang chờ duyệt.`
    );
  };

  const getLateMinutes = (record) => {
    if (!record?.checkInTime) return 0;

    const actual =
      Number(record.checkInTime.split(":")[0]) * 60 +
      Number(record.checkInTime.split(":")[1]);

    const expected =
      Number(record.shiftStartTime.split(":")[0]) * 60 +
      Number(record.shiftStartTime.split(":")[1]);

    return Math.max(0, actual - expected);
  };

  const getEarlyMinutes = (record) => {
    if (!record?.checkOutTime) return 0;

    const actual =
      Number(record.checkOutTime.split(":")[0]) * 60 +
      Number(record.checkOutTime.split(":")[1]);

    const expected =
      Number(record.shiftEndTime.split(":")[0]) * 60 +
      Number(record.shiftEndTime.split(":")[1]);

    return Math.max(0, expected - actual);
  };

  return (
    <div className="attendance-page">
      <div className="attendance-header">
        <div>
          <h1>Quản lý chấm công</h1>
          <p>Theo dõi và duyệt thời gian làm việc của nhân viên.</p>
        </div>
      </div>

      {message && (
        <div className="attendance-message">
          <span>{message}</span>
          <button onClick={() => setMessage("")}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className="attendance-summary">
        <div className="attendance-summary-card">
          <div className="attendance-summary-icon">
            <Users size={22} />
          </div>
          <div>
            <span>Nhân viên được phân ca</span>
            <strong>{dailyAssignments.length}</strong>
          </div>
        </div>

        <div className="attendance-summary-card">
          <div className="attendance-summary-icon pending-icon">
            <Clock size={22} />
          </div>
          <div>
            <span>Hồ sơ chờ duyệt</span>
            <strong>{pendingCount}</strong>
          </div>
        </div>

        <div className="attendance-summary-card">
          <div className="attendance-summary-icon missing-icon">
            <AlertCircle size={22} />
          </div>
          <div>
            <span>Thiếu Check-out</span>
            <strong>{missingCount}</strong>
          </div>
        </div>
      </div>

      <section className="attendance-section">
        <div className="attendance-toolbar">
          <div>
            <h2>Danh sách chấm công</h2>
            <p>Danh sách được lấy từ lịch phân ca đã tạo.</p>
          </div>

          <div className="attendance-filters">
            <div className="attendance-search">
              <Search size={17} />
              <input
                type="text"
                placeholder="Tìm nhân viên..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />
            </div>

            <div className="attendance-date">
              <CalendarDays size={17} />
              <input
                type="date"
                value={selectedDate}
                onChange={(event) =>
                  setSelectedDate(event.target.value)
                }
              />
            </div>

            <select
              value={filterStatus}
              onChange={(event) =>
                setFilterStatus(event.target.value)
              }
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="MISSING">Thiếu Check-out</option>
            </select>
          </div>
        </div>

        <div className="attendance-table-wrapper">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Nhân viên</th>
                <th>Ca làm</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.map((item) => {
                const record = item.record;
                const lateMinutes = getLateMinutes(record);
                const earlyMinutes = getEarlyMinutes(record);
                const missingCheckout =
                  record?.checkInTime &&
                  !record?.checkOutTime &&
                  isShiftEnded(selectedDate, item.endTime);

                return (
                  <tr key={item.id}>
                    <td>
                      <div className="attendance-employee">
                        <strong>{item.employeeName}</strong>
                        <span>{item.employeeId}</span>
                      </div>
                    </td>

                    <td>
                      <div className="attendance-shift">
                        <strong>{item.shiftName}</strong>
                        <span>
                          {item.startTime} – {item.endTime}
                        </span>
                      </div>
                    </td>

                    <td>
                      {record?.checkInTime ? (
                        <div className="attendance-time">
                          <strong>{formatTime(record.checkInTime)}</strong>
                          {lateMinutes > 0 && (
                            <span className="attendance-warning">
                              Trễ {lateMinutes} phút
                            </span>
                          )}
                          <span className={`attendance-status ${record.checkInStatus?.toLowerCase()}`}>
                            {getAttendanceStatus(record.checkInStatus)}
                          </span>
                        </div>
                      ) : (
                        <span className="attendance-muted">Chưa Check-in</span>
                      )}
                    </td>

                    <td>
                      {record?.checkOutTime ? (
                        <div className="attendance-time">
                          <strong>{formatTime(record.checkOutTime)}</strong>
                          {earlyMinutes > 0 && (
                            <span className="attendance-warning">
                              Sớm {earlyMinutes} phút
                            </span>
                          )}
                          <span className={`attendance-status ${record.checkOutStatus?.toLowerCase()}`}>
                            {getAttendanceStatus(record.checkOutStatus)}
                          </span>
                          {record.supplementReason && (
                            <span className="attendance-supplement-note">
                              Đã bổ sung: {record.supplementReason}
                            </span>
                          )}
                        </div>
                      ) : missingCheckout ? (
                        <span className="attendance-status tu_thieu">
                          Thiếu Check-out
                        </span>
                      ) : (
                        <span className="attendance-muted">Chưa Check-out</span>
                      )}
                    </td>

                    <td>
                      {!record ? (
                        <span className="attendance-status chua_co">
                          Chưa có dữ liệu
                        </span>
                      ) : (
                        <span className="attendance-status">
                          {record.checkInStatus === "DA_DUYET" &&
                          (!record.checkOutTime ||
                            record.checkOutStatus === "DA_DUYET")
                            ? "Đã duyệt"
                            : "Đang xử lý"}
                        </span>
                      )}
                    </td>

                    <td>
                      <div className="attendance-actions">
                        {!record ? (
                          <button
                            className="attendance-action-btn create-btn"
                            onClick={() => handleCreateRecord(item)}
                          >
                            <Plus size={15} />
                            Tạo hồ sơ
                          </button>
                        ) : (
                          <>
                            {record.checkInStatus === "CHO_DUYET" && (
                              <>
                                <button
                                  className="attendance-action-btn approve-btn"
                                  onClick={() =>
                                    handleApproval(
                                      record.id,
                                      "checkInStatus",
                                      "DA_DUYET"
                                    )
                                  }
                                  title="Duyệt Check-in"
                                >
                                  <Check size={16} />
                                </button>

                                <button
                                  className="attendance-action-btn reject-btn"
                                  onClick={() =>
                                    handleApproval(
                                      record.id,
                                      "checkInStatus",
                                      "TU_CHOI"
                                    )
                                  }
                                  title="Từ chối Check-in"
                                >
                                  <X size={16} />
                                </button>
                              </>
                            )}

                            {record.checkOutStatus === "CHO_DUYET" && (
                              <>
                                <button
                                  className="attendance-action-btn approve-btn"
                                  onClick={() =>
                                    handleApproval(
                                      record.id,
                                      "checkOutStatus",
                                      "DA_DUYET"
                                    )
                                  }
                                  title="Duyệt Check-out"
                                >
                                  <Check size={16} />
                                </button>

                                <button
                                  className="attendance-action-btn reject-btn"
                                  onClick={() =>
                                    handleApproval(
                                      record.id,
                                      "checkOutStatus",
                                      "TU_CHOI"
                                    )
                                  }
                                  title="Từ chối Check-out"
                                >
                                  <X size={16} />
                                </button>
                              </>
                            )}

                            {record.checkInTime &&
                              !record.checkOutTime &&
                              missingCheckout && (
                                <button
                                  className="attendance-action-btn supplement-btn"
                                  onClick={() => {
                                    setSupplementRecord(record);
                                    setSupplementTime("");
                                    setSupplementReason("");
                                  }}
                                >
                                  Bổ sung
                                </button>
                              )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan="6" className="attendance-empty">
                    Không có dữ liệu phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {supplementRecord && (
        <div className="attendance-modal-overlay">
          <form
            className="attendance-modal"
            onSubmit={handleSupplement}
          >
            <div className="attendance-modal-header">
              <div>
                <h2>Bổ sung Check-out</h2>
                <p>
                  {supplementRecord.employeeName} ·{" "}
                  {supplementRecord.date}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSupplementRecord(null)}
              >
                <X size={20} />
              </button>
            </div>

            <label>
              Giờ Check-out thực tế
              <input
                type="time"
                value={supplementTime}
                onChange={(event) =>
                  setSupplementTime(event.target.value)
                }
                required
              />
            </label>

            <label>
              Lý do bổ sung
              <textarea
                value={supplementReason}
                onChange={(event) =>
                  setSupplementReason(event.target.value)
                }
                placeholder="Nhập lý do bổ sung giờ Check-out..."
                rows="3"
                required
              />
            </label>

            <p className="attendance-modal-note">
              Sau khi bổ sung, Check-out vẫn phải được quản lý duyệt.
            </p>

            <div className="attendance-modal-actions">
              <button
                type="button"
                className="attendance-cancel-btn"
                onClick={() => setSupplementRecord(null)}
              >
                Hủy
              </button>

              <button
                type="submit"
                className="attendance-submit-btn"
              >
                Xác nhận bổ sung
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Attendance;

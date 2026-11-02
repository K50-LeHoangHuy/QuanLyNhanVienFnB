
import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Users,
  Filter,
  MoreHorizontal,
  X,
  Pencil,
  Trash2,
  UserPlus,
  UserCheck,
} from "lucide-react";
import "./employees.css";
import { getUsers, saveUsers } from "../../data/users";

function Employees() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  // Danh sách tài khoản
  const [users, setUsers] = useState(() => getUsers());
  // Trạng thái tạo tài khoản
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [accountPassword, setAccountPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  
  const [employees, setEmployees] = useState(() => {
  const savedEmployees = localStorage.getItem("employees");

  return savedEmployees
    ? JSON.parse(savedEmployees)
    : [
        {
            id: "NV001",
            name: "Nguyễn Văn An",
            position: "Quản lý",
            phone: "0901234567",
            email: "an@gmail.com",
            status: "Đang làm việc",
        },
        {
            id: "NV002",
            name: "Trần Thị Mai",
            position: "Thu ngân",
            phone: "0912345678",
            email: "mai@gmail.com",
            status: "Đang làm việc",
        },
        {
            id: "NV003",
            name: "Lê Hoàng Nam",
            position: "Pha chế",
            phone: "0923456789",
            email: "nam@gmail.com",
            status: "Nghỉ phép",
        },
        {
            id: "NV004",
            name: "Phạm Thị Lan",
            position: "Phục vụ",
            phone: "0934567890",
            email: "lan@gmail.com",
            status: "Đang làm việc",
        },
        {
            id: "NV005",
            name: "Hoàng Minh Đức",
            position: "Pha chế",
            phone: "0945678901",
            email: "duc@gmail.com",
            status: "Đã nghỉ việc",
        },
      ];
});

    // Lưu danh sách nhân viên vào localStorage khi thay đổi
    useEffect(() => {
        localStorage.setItem("employees", JSON.stringify(employees));
    }, [employees]);

    useEffect(() => {
        saveUsers(users);
    }, [users]);

  const [formData, setFormData] = useState({
    name: "",
    position: "Phục vụ",
    phone: "",
    email: "",
    status: "Đang làm việc",
  });

  // Nhập dữ liệu vào biểu mẫu
  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Mở biểu mẫu thêm nhân viên
  const handleOpenAddForm = () => {
    setEditingId(null);

    setFormData({
      name: "",
      position: "Phục vụ",
      phone: "",
      email: "",
      status: "Đang làm việc",
    });

    setShowForm(true);
  };

  // Mở biểu mẫu chỉnh sửa nhân viên
  const handleEditEmployee = (employee) => {
    setEditingId(employee.id);

    setFormData({
      name: employee.name,
      position: employee.position,
      phone: employee.phone,
      email: employee.email,
      status: employee.status,
    });

    setActiveMenu(null);
    setShowForm(true);
  };

  // Lưu nhân viên mới hoặc cập nhật nhân viên
  const handleSubmit = (event) => {
    event.preventDefault();

    if (editingId) {
      // Cập nhật nhân viên hiện tại
      setEmployees(
        employees.map((employee) =>
          employee.id === editingId
            ? { ...employee, ...formData }
            : employee
        )
      );
    } else {
  // Tìm mã nhân viên chưa được sử dụng
  let nextId = 1;
  let newEmployeeId = "";

  do {
    newEmployeeId = `NV${String(nextId).padStart(3, "0")}`;
    nextId++;
  } while (
    employees.some((employee) => employee.id === newEmployeeId) ||
    users.some((user) => user.employeeCode === newEmployeeId)
  );

  // Tạo nhân viên mới
  const newEmployee = {
    id: newEmployeeId,
    ...formData,
  };

  setEmployees([...employees, newEmployee]);
}

    setShowForm(false);
    setEditingId(null);
  };

// Xóa nhân viên và tài khoản đăng nhập liên quan
const handleDeleteEmployee = (employee) => {
  const confirmed = window.confirm(
    `Bạn có chắc chắn muốn xóa nhân viên ${employee.name} (${employee.id}) không?`
  );

  if (confirmed) {
    // Xóa nhân viên khỏi danh sách
    setEmployees(
      employees.filter(
        (item) => item.id !== employee.id
      )
    );

    // Xóa tài khoản có mã nhân viên tương ứng
    const updatedUsers = users.filter(
      (user) => user.employeeCode !== employee.id
    );

    setUsers(updatedUsers);
  }

  setActiveMenu(null);
};

  // Mở biểu mẫu tạo tài khoản
const handleOpenAccountForm = (employee) => {
  const existingAccount = users.find(
    (user) => user.employeeCode === employee.id
  );

  if (existingAccount) {
    alert("Nhân viên này đã có tài khoản!");
    return;
  }

  if (employee.status === "Đã nghỉ việc") {
    alert("Không thể tạo tài khoản cho nhân viên đã nghỉ việc!");
    return;
  }

  setSelectedEmployee(employee);
  setAccountPassword("");
  setConfirmPassword("");
  setActiveMenu(null);
  setShowAccountForm(true);
};

// Tạo tài khoản nhân viên
const handleCreateAccount = (event) => {
  event.preventDefault();

  if (accountPassword.length < 6) {
    alert("Mật khẩu phải có ít nhất 6 ký tự!");
    return;
  }

  if (accountPassword !== confirmPassword) {
    alert("Mật khẩu xác nhận không khớp!");
    return;
  }

  const emailExists = users.some(
    (user) =>
      user.email.toLowerCase() ===
      selectedEmployee.email.toLowerCase()
  );

  if (emailExists) {
    alert("Email này đã được sử dụng!");
    return;
  }

  const nextId =
    Math.max(0, ...users.map((user) => user.id)) + 1;

  const newUser = {
    id: nextId,
    name: selectedEmployee.name,
    email: selectedEmployee.email,
    employeeCode: selectedEmployee.id,
    password: accountPassword,
    role: "employee",
  };

  setUsers([...users, newUser]);

  setShowAccountForm(false);
  setSelectedEmployee(null);

  alert("Tạo tài khoản thành công!");
};

  // Tìm kiếm và lọc nhân viên
  const filteredEmployees = employees.filter((employee) => {
    const keyword = searchTerm.toLowerCase();

    const matchesSearch =
      employee.name.toLowerCase().includes(keyword) ||
      employee.id.toLowerCase().includes(keyword) ||
      employee.phone.includes(keyword);

    const matchesStatus =
      statusFilter === "all" ||
      employee.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="employees-page">
      {/* Tiêu đề */}
      <div className="employees-heading">
        <div>
          <h1>Quản lý nhân viên</h1>
          <p>Quản lý thông tin và danh sách nhân viên cửa hàng.</p>
        </div>

        <button
          className="add-employee-button"
          type="button"
          onClick={handleOpenAddForm}
        >
          <Plus size={18} />
          Thêm nhân viên
        </button>
      </div>

      {/* Thống kê */}
      <div className="employee-summary">
        <div className="employee-summary-card">
          <div className="summary-icon">
            <Users size={22} />
          </div>
          <div>
            <p>Tổng nhân viên</p>
            <h2>{employees.length}</h2>
          </div>
        </div>

        <div className="employee-summary-card">
          <div className="summary-icon">
            <Users size={22} />
          </div>
          <div>
            <p>Đang làm việc</p>
            <h2>
              {employees.filter(
                (item) => item.status === "Đang làm việc"
              ).length}
            </h2>
          </div>
        </div>

        <div className="employee-summary-card">
          <div className="summary-icon">
            <Users size={22} />
          </div>
          <div>
            <p>Nghỉ phép</p>
            <h2>
              {employees.filter(
                (item) => item.status === "Nghỉ phép"
              ).length}
            </h2>
          </div>
        </div>
      </div>

      {/* Danh sách nhân viên */}
      <div className="employees-list-panel">
        <div className="employees-list-heading">
          <div>
            <h3>Danh sách nhân viên</h3>
            <p>Thông tin nhân viên đang được quản lý trong hệ thống.</p>
          </div>

          <span className="employee-count">
            {filteredEmployees.length} nhân viên
          </span>
        </div>

        {/* Tìm kiếm và lọc */}
        <div className="employee-toolbar">
          <div className="employee-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Tìm theo tên, mã hoặc số điện thoại..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="employee-filter">
            <Filter size={17} />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Đang làm việc">Đang làm việc</option>
              <option value="Nghỉ phép">Nghỉ phép</option>
              <option value="Đã nghỉ việc">Đã nghỉ việc</option>
            </select>
          </div>
        </div>

        {/* Bảng nhân viên */}
        <div className="employee-table-wrapper">
          <table className="employee-table">
            <thead>
              <tr>
                <th>Mã nhân viên</th>
                <th>Họ và tên</th>
                <th>Vị trí</th>
                <th>Số điện thoại</th>
                <th>Email</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="employee-id">{employee.id}</td>
                    <td className="employee-name">{employee.name}</td>
                    <td>{employee.position}</td>
                    <td>{employee.phone}</td>
                    <td>{employee.email}</td>

                    <td>
                      <span
                        className={`employee-status ${
                          employee.status === "Đang làm việc"
                            ? "working"
                            : employee.status === "Nghỉ phép"
                              ? "leave"
                              : "inactive"
                        }`}
                      >
                        {employee.status}
                      </span>
                    </td>

                    <td className="employee-action-cell">
                      <button
                        className="employee-more-button"
                        type="button"
                        title="Thao tác"
                        onClick={() =>
                          setActiveMenu(
                            activeMenu === employee.id
                              ? null
                              : employee.id
                          )
                        }
                      >
                        <MoreHorizontal size={20} />
                      </button>

                      {activeMenu === employee.id && (
                        <div className="employee-action-menu">
                        {!users.some(
                            (user) => user.employeeCode === employee.id
                            ) ? (
                            <button
                                type="button"
                                onClick={() => handleOpenAccountForm(employee)}
                            >
                                <UserPlus size={16} />
                                Tạo tài khoản
                            </button>
                            ) : (
                            <button type="button" disabled>
                                <UserCheck size={16} />
                                Đã có tài khoản
                            </button>
                        )}
                          <button
                            type="button"
                            onClick={() =>
                              handleEditEmployee(employee)
                            }
                          >
                            <Pencil size={16} />
                            Chỉnh sửa
                          </button>

                          <button
                            type="button"
                            className="delete-action"
                            onClick={() =>
                              handleDeleteEmployee(employee)
                            }
                          >
                            <Trash2 size={16} />
                            Xóa nhân viên
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="employee-empty">
                    Không tìm thấy nhân viên phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Biểu mẫu thêm và chỉnh sửa */}
      {showForm && (
        <div className="employee-modal-overlay">
          <div className="employee-modal">
            <div className="employee-modal-heading">
              <div>
                <h2>
                  {editingId
                    ? "Chỉnh sửa nhân viên"
                    : "Thêm nhân viên mới"}
                </h2>
                <p>
                  {editingId
                    ? "Cập nhật thông tin nhân viên."
                    : "Nhập thông tin nhân viên vào hệ thống."}
                </p>
              </div>

              <button
                type="button"
                className="employee-modal-close"
                onClick={() => setShowForm(false)}
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="employee-form-group">
                <label>Họ và tên</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Nhập họ và tên"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="employee-form-group">
                <label>Vị trí công việc</label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                >
                  <option value="Quản lý">Quản lý</option>
                  <option value="Thu ngân">Thu ngân</option>
                  <option value="Pha chế">Pha chế</option>
                  <option value="Phục vụ">Phục vụ</option>
                </select>
              </div>

              <div className="employee-form-group">
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Nhập số điện thoại"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="employee-form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Nhập địa chỉ email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {editingId && (
                <div className="employee-form-group">
                  <label>Trạng thái</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="Đang làm việc">Đang làm việc</option>
                    <option value="Nghỉ phép">Nghỉ phép</option>
                    <option value="Đã nghỉ việc">Đã nghỉ việc</option>
                  </select>
                </div>
              )}

              <div className="employee-modal-actions">
                <button
                  type="button"
                  className="employee-cancel-button"
                  onClick={() => setShowForm(false)}
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="employee-save-button"
                >
                  {editingId ? "Lưu thay đổi" : "Lưu nhân viên"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Biểu mẫu tạo tài khoản */}
{showAccountForm && selectedEmployee && (
  <div className="employee-modal-overlay">
    <div className="employee-modal">

      <div className="employee-modal-heading">
        <div>
          <h2>Tạo tài khoản nhân viên</h2>
          <p>
            Cấp tài khoản đăng nhập cho nhân viên.
          </p>
        </div>

        <button
          type="button"
          className="employee-modal-close"
          onClick={() => setShowAccountForm(false)}
        >
          <X size={21} />
        </button>
      </div>

      <form onSubmit={handleCreateAccount}>

        <div className="employee-form-group">
          <label>Mã nhân viên</label>
          <input
            type="text"
            value={selectedEmployee.id}
            disabled
          />
        </div>

        <div className="employee-form-group">
          <label>Họ và tên</label>
          <input
            type="text"
            value={selectedEmployee.name}
            disabled
          />
        </div>

        <div className="employee-form-group">
          <label>Email đăng nhập</label>
          <input
            type="email"
            value={selectedEmployee.email}
            disabled
          />
        </div>

        <div className="employee-form-group">
          <label>Mật khẩu ban đầu</label>
          <input
            type="password"
            placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
            value={accountPassword}
            onChange={(event) =>
              setAccountPassword(event.target.value)
            }
            required
          />
        </div>

        <div className="employee-form-group">
          <label>Xác nhận mật khẩu</label>
          <input
            type="password"
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(event.target.value)
            }
            required
          />
        </div>

        <div className="employee-modal-actions">
          <button
            type="button"
            className="employee-cancel-button"
            onClick={() => setShowAccountForm(false)}
          >
            Hủy
          </button>

          <button
            type="submit"
            className="employee-save-button"
          >
            Tạo tài khoản
          </button>
        </div>

      </form>
    </div>
  </div>
)}  
    </div>
  );
}

export default Employees;

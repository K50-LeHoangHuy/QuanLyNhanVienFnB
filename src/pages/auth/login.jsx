import { users } from "../../data/users";
import { useState } from "react";
import "./Login.css";

function Login({ onLogin }) {
  const [role, setRole] = useState("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

const handleLogin = (e) => {
  e.preventDefault();

  if (!username.trim() || !password.trim()) {
    alert("Vui lòng nhập đầy đủ tài khoản và mật khẩu!");
    return;
  }

  const user = users.find((u) => {
    const account = username.trim().toLowerCase();

    const accountMatches =
      u.email.toLowerCase() === account ||
      (u.employeeCode &&
        u.employeeCode.toLowerCase() === account);

    return (
      accountMatches &&
      u.password === password &&
      u.role === role
    );
  });

  if (!user) {
    alert("Tài khoản, mật khẩu hoặc loại tài khoản không chính xác!");
    return;
  }

  const { password: hiddenPassword, ...safeUser } = user;

  onLogin(safeUser);
};

  return (
    <div className="login-container">

      {/* Phần giới thiệu bên trái */}
      <div className="login-left">
        <div className="brand">
          <div className="brand-icon">☕</div>
          <span>F&B People</span>
        </div>

        <div className="intro">
          <p className="eyebrow">
            MỖI CA LÀM, MỘT NHỊP CHUNG.
          </p>

          <h1>
            Gắn kết đội ngũ.
            <br />
            Trọn vẹn từng
            <br />
            ca làm.
          </h1>

          <p className="intro-description">
            Từ lịch làm đến bảng lương, mọi việc của
            đội ngũ được sắp xếp gọn trong một nơi.
          </p>
        </div>

        <div className="coffee-illustration">
          ☕
          <span>✓</span>
        </div>

        <div className="left-footer">
          ✓ Cùng nhau làm nên một ngày tốt hơn.
        </div>
      </div>

      {/* Phần đăng nhập bên phải */}
      <div className="login-right">

        <div className="language">
          Tiếng Việt⌄
        </div>

        <div className="login-form-wrapper">

          <p className="form-eyebrow">
            CHÀO MỪNG TRỞ LẠI
          </p>

          <h2>Đăng nhập</h2>

          <p className="form-description">
            Truy cập không gian làm việc của bạn.
          </p>

          {/* Chọn vai trò */}
          <div className="role-selection">

            <button
              type="button"
              className={`role-button ${
                role === "admin" ? "active" : ""
              }`}
              onClick={() => setRole("admin")}
            >
              <span>♙</span>
              <div>
                <strong>Admin</strong>
                <small>Quản lý cửa hàng</small>
              </div>
            </button>

            <button
              type="button"
              className={`role-button ${
                role === "employee" ? "active" : ""
              }`}
              onClick={() => setRole("employee")}
            >
              <span>♧</span>
              <div>
                <strong>Nhân viên</strong>
                <small>Nhân viên cửa hàng</small>
              </div>
            </button>

          </div>

          <form onSubmit={handleLogin}>

            <label>Tài khoản</label>

            <input
              type="text"
              placeholder={
                role === "admin"
                  ? "Nhập email Admin"
                  : "Nhập email hoặc mã nhân viên"
              }
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <label>Mật khẩu</label>

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                className="show-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Ẩn" : "Hiện"}
              </button>
            </div>

            <div className="form-options">
              <label className="remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Ghi nhớ đăng nhập
              </label>

              <button
                type="button"
                className="forgot-password"
                onClick={() =>
                  alert("Vui lòng liên hệ Admin cửa hàng.")
                }
              >
                Quên mật khẩu?
              </button>
            </div>

            <button type="submit" className="login-button">
              Đăng nhập
            </button>

          </form>

          <div className="security-note">
            ♙ Chỉ dành cho tài khoản nhân sự cửa hàng
          </div>

          <div className="contact">
            Chưa có tài khoản hoặc cần hỗ trợ?
            <br />
            <strong>Liên hệ quản lý cửa hàng</strong>
          </div>

        </div>

        <div className="right-footer">
          <span>© 2026 F&B People</span>
          <span>Quản lý nhân viên F&B</span>
        </div>

      </div>
    </div>
  );
}

export default Login;


const initialUsers = [
  {
    id: 1,
    name: "Quản trị viên",
    email: "admin@fbpeople.com",
    password: "admin123",
    role: "admin",
    accountStatus: "active",
  },
  {
    id: 2,
    name: "Nguyễn Văn An",
    email: "an@fbpeople.com",
    employeeCode: "NV001",
    password: "123456",
    role: "employee",
    accountStatus: "active",
  },
  {
    id: 3,
    name: "Trần Thị Bình",
    email: "binh@fbpeople.com",
    employeeCode: "NV002",
    password: "123456",
    role: "employee",
    accountStatus: "active",
  },
];

// Lấy danh sách tài khoản
export const getUsers = () => {
  const savedUsers = localStorage.getItem("users");

  if (savedUsers) {
    const users = JSON.parse(savedUsers);

    // Bổ sung trạng thái cho tài khoản cũ chưa có trường này
    const updatedUsers = users.map((user) => ({
      ...user,
      accountStatus: user.accountStatus || "active",
    }));

    localStorage.setItem("users", JSON.stringify(updatedUsers));

    return updatedUsers;
  }

  // Nếu chưa có dữ liệu thì sử dụng tài khoản mẫu
  localStorage.setItem("users", JSON.stringify(initialUsers));

  return initialUsers;
};

// Lưu danh sách tài khoản
export const saveUsers = (users) => {
  localStorage.setItem("users", JSON.stringify(users));
};

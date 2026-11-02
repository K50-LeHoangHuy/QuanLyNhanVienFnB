
const initialUsers = [
  {
    id: 1,
    name: "Quản trị viên",
    email: "admin@fbpeople.com",
    password: "admin123",
    role: "admin",
  },
  {
    id: 2,
    name: "Nguyễn Văn An",
    email: "an@fbpeople.com",
    employeeCode: "NV001",
    password: "123456",
    role: "employee",
  },
  {
    id: 3,
    name: "Trần Thị Bình",
    email: "binh@fbpeople.com",
    employeeCode: "NV002",
    password: "123456",
    role: "employee",
  },
];

// Lấy danh sách tài khoản
export const getUsers = () => {
  const savedUsers = localStorage.getItem("users");

  if (savedUsers) {
    return JSON.parse(savedUsers);
  }

  // Nếu chưa có dữ liệu thì sử dụng tài khoản mẫu
  localStorage.setItem("users", JSON.stringify(initialUsers));

  return initialUsers;
};

// Lưu danh sách tài khoản
export const saveUsers = (users) => {
  localStorage.setItem("users", JSON.stringify(users));
};

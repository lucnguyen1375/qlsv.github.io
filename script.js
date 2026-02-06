// Lớp Student - Đối tượng sinh viên
class Student {
    constructor(studentId, fullName, birthDate, className, gpa) {
        this.studentId = studentId;
        this.fullName = fullName;
        this.birthDate = birthDate;
        this.className = className;
        this.gpa = parseFloat(gpa);
    }

    // Phương thức cập nhật thông tin sinh viên
    updateInfo(studentId, fullName, birthDate, className, gpa) {
        this.studentId = studentId;
        this.fullName = fullName;
        this.birthDate = birthDate;
        this.className = className;
        this.gpa = parseFloat(gpa);
    }

    // Phương thức lấy thông tin sinh viên dưới dạng chuỗi
    getInfo() {
        return `Mã SV: ${this.studentId}, Họ tên: ${this.fullName}, Ngày sinh: ${this.formatDate()}, Lớp: ${this.className}, GPA: ${this.gpa}`;
    }

    // Phương thức định dạng ngày sinh
    formatDate() {
        const date = new Date(this.birthDate);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    // Phương thức kiểm tra GPA có hợp lệ không
    isValidGPA() {
        return this.gpa >= 0 && this.gpa <= 4;
    }
}

// Lớp StudentManager - Quản lý danh sách sinh viên
class StudentManager {
    constructor() {
        this.students = [];
        this.editingIndex = -1; // Index của sinh viên đang được chỉnh sửa
        this.loadFromLocalStorage();
    }

    // Thêm sinh viên mới
    addStudent(student) {
        if (this.isDuplicateId(student.studentId)) {
            alert('Mã sinh viên đã tồn tại! Vui lòng nhập mã khác.');
            return false;
        }
        this.students.push(student);
        this.saveToLocalStorage();
        return true;
    }

    // Cập nhật thông tin sinh viên
    updateStudent(index, student) {
        // Kiểm tra trùng mã sinh viên (trừ chính sinh viên đang sửa)
        const isDuplicate = this.students.some((s, i) => 
            i !== index && s.studentId === student.studentId
        );
        
        if (isDuplicate) {
            alert('Mã sinh viên đã tồn tại! Vui lòng nhập mã khác.');
            return false;
        }
        
        this.students[index] = student;
        this.saveToLocalStorage();
        return true;
    }

    // Xóa sinh viên
    deleteStudent(index) {
        if (confirm('Bạn có chắc chắn muốn xóa sinh viên này?')) {
            this.students.splice(index, 1);
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }

    // Lấy sinh viên theo index
    getStudent(index) {
        return this.students[index];
    }

    // Lấy tất cả sinh viên
    getAllStudents() {
        return this.students;
    }

    // Kiểm tra mã sinh viên trùng
    isDuplicateId(studentId) {
        return this.students.some(student => student.studentId === studentId);
    }

    // Lưu vào localStorage
    saveToLocalStorage() {
        localStorage.setItem('students', JSON.stringify(this.students));
    }

    // Tải từ localStorage
    loadFromLocalStorage() {
        const data = localStorage.getItem('students');
        if (data) {
            const parsedData = JSON.parse(data);
            this.students = parsedData.map(s => 
                new Student(s.studentId, s.fullName, s.birthDate, s.className, s.gpa)
            );
        }
    }
}

// Khởi tạo StudentManager
const studentManager = new StudentManager();

// Các phần tử DOM
const studentForm = document.getElementById('studentForm');
const studentIdInput = document.getElementById('studentId');
const fullNameInput = document.getElementById('fullName');
const birthDateInput = document.getElementById('birthDate');
const classNameInput = document.getElementById('className');
const gpaInput = document.getElementById('gpa');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const studentTableBody = document.getElementById('studentTableBody');
const studentTable = document.getElementById('studentTable');
const emptyMessage = document.getElementById('emptyMessage');

// Hàm hiển thị danh sách sinh viên
function displayStudents() {
    const students = studentManager.getAllStudents();
    studentTableBody.innerHTML = '';
    
    if (students.length === 0) {
        studentTable.classList.add('hidden');
        emptyMessage.classList.add('show');
        return;
    }
    
    studentTable.classList.remove('hidden');
    emptyMessage.classList.remove('show');
    
    students.forEach((student, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${student.studentId}</td>
            <td>${student.fullName}</td>
            <td>${student.formatDate()}</td>
            <td>${student.className}</td>
            <td>${student.gpa.toFixed(2)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editStudent(${index})">Sửa</button>
                    <button class="btn-delete" onclick="deleteStudent(${index})">Xóa</button>
                </div>
            </td>
        `;
        studentTableBody.appendChild(row);
    });
}

// Hàm xử lý submit form
studentForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const studentId = studentIdInput.value.trim();
    const fullName = fullNameInput.value.trim();
    const birthDate = birthDateInput.value;
    const className = classNameInput.value.trim();
    const gpa = parseFloat(gpaInput.value);
    
    // Validate
    if (!studentId || !fullName || !birthDate || !className || isNaN(gpa)) {
        alert('Vui lòng điền đầy đủ thông tin!');
        return;
    }
    
    if (gpa < 0 || gpa > 4) {
        alert('Điểm GPA phải nằm trong khoảng 0 - 4!');
        return;
    }
    
    const student = new Student(studentId, fullName, birthDate, className, gpa);
    
    // Kiểm tra xem đang thêm mới hay cập nhật
    if (studentManager.editingIndex === -1) {
        // Thêm mới
        if (studentManager.addStudent(student)) {
            alert('Thêm sinh viên thành công!');
            resetForm();
            displayStudents();
        }
    } else {
        // Cập nhật
        if (studentManager.updateStudent(studentManager.editingIndex, student)) {
            alert('Cập nhật thông tin sinh viên thành công!');
            resetForm();
            displayStudents();
        }
    }
});

// Hàm reset form
function resetForm() {
    studentForm.reset();
    studentManager.editingIndex = -1;
    submitBtn.textContent = 'Thêm sinh viên';
    cancelBtn.style.display = 'none';
}

// Hàm sửa sinh viên
function editStudent(index) {
    const student = studentManager.getStudent(index);
    
    studentIdInput.value = student.studentId;
    fullNameInput.value = student.fullName;
    birthDateInput.value = student.birthDate;
    classNameInput.value = student.className;
    gpaInput.value = student.gpa;
    
    studentManager.editingIndex = index;
    submitBtn.textContent = 'Cập nhật sinh viên';
    cancelBtn.style.display = 'block';
    
    // Scroll lên form
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Hàm xóa sinh viên
function deleteStudent(index) {
    if (studentManager.deleteStudent(index)) {
        displayStudents();
    }
}

// Xử lý nút Hủy
cancelBtn.addEventListener('click', function() {
    resetForm();
});

// Hiển thị danh sách sinh viên khi tải trang
displayStudents();

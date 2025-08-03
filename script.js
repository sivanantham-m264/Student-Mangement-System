// Main Application
class StudentManagementSystem {
    constructor() {
        // DOM Elements
        this.elements = {
            // Login Section
            loginForm: document.getElementById('loginForm'),
            loginEmail: document.getElementById('loginEmail'),
            loginPassword: document.getElementById('loginPassword'),
            loginBtn: document.getElementById('loginBtn'),
            mainContent: document.getElementById('mainContent'),
            welcomeMessage: document.getElementById('welcomeMessage'),
            logoutBtn: document.getElementById('logoutBtn'),
            
            // Student Form
            studentForm: document.getElementById('studentForm'),
            studentId: document.getElementById('studentId'),
            studentName: document.getElementById('studentName'),
            studentAge: document.getElementById('studentAge'),
            studentGrade: document.getElementById('studentGrade'),
            studentEmail: document.getElementById('studentEmail'),
            addBtn: document.getElementById('addBtn'),
            updateBtn: document.getElementById('updateBtn'),
            cancelBtn: document.getElementById('cancelBtn'),
            
            // Search and Table
            searchInput: document.getElementById('searchInput'),
            searchBtn: document.getElementById('searchBtn'),
            exportBtn: document.getElementById('exportBtn'),
            studentTableBody: document.getElementById('studentTableBody'),
            
            // Other
            darkModeToggle: document.getElementById('darkModeToggle')
        };

        // Application State
        this.state = {
            students: JSON.parse(localStorage.getItem('students')) || [],
            currentStudentId: null,
            currentPage: 1,
            recordsPerPage: 5,
            currentUser: null,
            gradeChart: null
        };

        // Initialize
        this.init();
    }

    init() {
        // Initialize event listeners
        this.initEventListeners();
        
        // Check authentication status
        this.checkAuthStatus();
        
        // Initialize chart
        this.initChart();
        
        // Load students
        this.displayStudents();
    }

    initEventListeners() {
        // Login/Logout
        this.elements.loginBtn.addEventListener('click', () => this.handleLogin());
        this.elements.logoutBtn.addEventListener('click', () => this.handleLogout());
        
        // Student Form
        this.elements.studentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addStudent();
        });
        this.elements.updateBtn.addEventListener('click', () => this.updateStudent());
        this.elements.cancelBtn.addEventListener('click', () => this.cancelEdit());
        
        // Search and Export
        this.elements.searchBtn.addEventListener('click', () => this.searchStudents());
        this.elements.searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') this.searchStudents();
        });
        this.elements.exportBtn.addEventListener('click', () => this.exportToCSV());
        
        // Dark Mode
        this.elements.darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
    }

    // Authentication Methods
    handleLogin() {
        const email = this.elements.loginEmail.value.trim();
        
        if (!email) {
            alert("Please enter an email address");
            return;
        }

        this.state.currentUser = {
            email: email,
            name: email.split('@')[0],
            role: email.includes('admin') ? 'admin' : 'user'
        };

        sessionStorage.setItem('currentUser', JSON.stringify(this.state.currentUser));
        
        this.elements.loginForm.style.display = 'none';
        this.elements.mainContent.style.display = 'block';
        this.elements.welcomeMessage.textContent = `Welcome, ${this.state.currentUser.name}!`;
        
        if (this.state.currentUser.role === 'user') {
            this.elements.exportBtn.style.display = 'none';
        }
    }

    handleLogout() {
        sessionStorage.removeItem('currentUser');
        location.reload();
    }

    checkAuthStatus() {
        const userData = sessionStorage.getItem('currentUser');
        if (userData) {
            this.state.currentUser = JSON.parse(userData);
            this.elements.loginForm.style.display = 'none';
            this.elements.mainContent.style.display = 'block';
            this.elements.welcomeMessage.textContent = `Welcome back, ${this.state.currentUser.name}!`;
            
            if (this.state.currentUser.role === 'user') {
                this.elements.exportBtn.style.display = 'none';
            }
        }
    }

    // Student Management Methods
    addStudent() {
        const student = {
            id: this.elements.studentId.value,
            name: this.elements.studentName.value,
            age: this.elements.studentAge.value,
            grade: this.elements.studentGrade.value,
            email: this.elements.studentEmail.value
        };

        if (!this.validateStudentData(student)) return;

        if (this.state.students.some(s => s.id === student.id)) {
            alert('Student ID already exists!');
            return;
        }

        this.state.students.push(student);
        this.saveToLocalStorage();
        this.elements.studentForm.reset();
        this.state.currentPage = Math.ceil(this.state.students.length / this.state.recordsPerPage);
        this.displayStudents();
    }

    validateStudentData(student) {
        if (!student.id.match(/^ST-\d{3}$/)) {
            alert('ID must be in format ST-001 (e.g., ST-001)');
            return false;
        }
        if (student.name.length < 2) {
            alert('Name must be at least 2 characters');
            return false;
        }
        if (student.age < 5 || student.age > 25) {
            alert('Age must be between 5 and 25');
            return false;
        }
        if (!student.email.includes('@') || !student.email.includes('.')) {
            alert('Invalid email format');
            return false;
        }
        return true;
    }

    displayStudents(studentsToDisplay = this.state.students) {
        this.elements.studentTableBody.innerHTML = '';
        
        const startIndex = (this.state.currentPage - 1) * this.state.recordsPerPage;
        const endIndex = startIndex + this.state.recordsPerPage;
        const paginatedStudents = studentsToDisplay.slice(startIndex, endIndex);
        
        if (paginatedStudents.length === 0) {
            this.elements.studentTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No students found</td></tr>';
            this.renderPagination(studentsToDisplay.length);
            this.renderGradeChart();
            return;
        }
        
        paginatedStudents.forEach(student => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>${student.age}</td>
                <td>${student.grade}</td>
                <td>${student.email}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${student.id}">Edit</button>
                    <button class="action-btn delete-btn" data-id="${student.id}">Delete</button>
                </td>
            `;
            
            this.elements.studentTableBody.appendChild(row);
        });
        
        // Add event listeners to edit and delete buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleEdit(e));
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleDelete(e));
        });
        
        this.renderPagination(studentsToDisplay.length);
        this.renderGradeChart();
    }

    handleEdit(e) {
        const id = e.target.getAttribute('data-id');
        const student = this.state.students.find(s => s.id === id);
        
        if (student) {
            this.state.currentStudentId = student.id;
            this.elements.studentId.value = student.id;
            this.elements.studentName.value = student.name;
            this.elements.studentAge.value = student.age;
            this.elements.studentGrade.value = student.grade;
            this.elements.studentEmail.value = student.email;
            
            this.elements.addBtn.style.display = 'none';
            this.elements.updateBtn.style.display = 'inline-block';
            this.elements.cancelBtn.style.display = 'inline-block';
        }
    }

    updateStudent() {
        const student = {
            id: this.state.currentStudentId,
            name: this.elements.studentName.value,
            age: this.elements.studentAge.value,
            grade: this.elements.studentGrade.value,
            email: this.elements.studentEmail.value
        };

        if (!this.validateStudentData(student)) return;

        const index = this.state.students.findIndex(s => s.id === this.state.currentStudentId);
        
        if (index !== -1) {
            this.state.students[index] = student;
            this.saveToLocalStorage();
            this.elements.studentForm.reset();
            this.displayStudents();
            this.cancelEdit();
        }
    }

    handleDelete(e) {
        if (confirm('Are you sure you want to delete this student?')) {
            const id = e.target.getAttribute('data-id');
            this.state.students = this.state.students.filter(student => student.id !== id);
            this.saveToLocalStorage();
            
            const totalPages = Math.ceil(this.state.students.length / this.state.recordsPerPage);
            if (this.state.currentPage > totalPages && totalPages > 0) {
                this.state.currentPage = totalPages;
            } else if (totalPages === 0) {
                this.state.currentPage = 1;
            }
            
            this.displayStudents();
            
            if (this.state.currentStudentId === id) {
                this.cancelEdit();
            }
        }
    }

    cancelEdit() {
        this.elements.studentForm.reset();
        this.state.currentStudentId = null;
        this.elements.addBtn.style.display = 'inline-block';
        this.elements.updateBtn.style.display = 'none';
        this.elements.cancelBtn.style.display = 'none';
    }

    searchStudents() {
        const searchTerm = this.elements.searchInput.value.toLowerCase();
        
        if (searchTerm.trim() === '') {
            this.state.currentPage = 1;
            this.displayStudents();
            return;
        }
        
        const filteredStudents = this.state.students.filter(student => 
            student.id.toLowerCase().includes(searchTerm) ||
            student.name.toLowerCase().includes(searchTerm) ||
            student.grade.toLowerCase().includes(searchTerm) ||
            student.email.toLowerCase().includes(searchTerm) ||
            student.age.toString().includes(searchTerm)
        );
        
        this.state.currentPage = 1;
        this.displayStudents(filteredStudents);
    }

    sortStudents(column, direction = 'asc') {
        this.state.students.sort((a, b) => {
            if (column === 'age') {
                return direction === 'asc' ? a.age - b.age : b.age - a.age;
            }
            return direction === 'asc' 
                ? a[column].localeCompare(b[column])
                : b[column].localeCompare(a[column]);
        });
        this.displayStudents();
    }

    renderPagination(totalRecords) {
        const totalPages = Math.ceil(totalRecords / this.state.recordsPerPage);
        const paginationDiv = document.createElement('div');
        paginationDiv.className = 'pagination';
        
        paginationDiv.innerHTML = `
            <button ${this.state.currentPage === 1 ? 'disabled' : ''} 
                onclick="sms.changePage(${this.state.currentPage - 1})">Previous</button>
            <span>Page ${this.state.currentPage} of ${totalPages}</span>
            <button ${this.state.currentPage === totalPages ? 'disabled' : ''} 
                onclick="sms.changePage(${this.state.currentPage + 1})">Next</button>
        `;
        
        const existingPagination = document.querySelector('.pagination');
        if (existingPagination) existingPagination.remove();
        
        document.querySelector('.table-container').appendChild(paginationDiv);
    }

    changePage(page) {
        this.state.currentPage = page;
        this.displayStudents();
    }

    exportToCSV() {
        let csv = 'ID,Name,Age,Grade,Email\n';
        
        this.state.students.forEach(student => {
            csv += `"${student.id}","${student.name}",${student.age},"${student.grade}","${student.email}"\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'students.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    // Chart Methods
    initChart() {
        this.state.gradeChart = new Chart(
            document.getElementById('gradeChart').getContext('2d'),
            {
                type: 'bar',
                data: { labels: [], datasets: [] },
                options: {
                    responsive: true,
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                }
            }
        );
    }

    renderGradeChart() {
        const gradeCounts = {};
        this.state.students.forEach(student => {
            gradeCounts[student.grade] = (gradeCounts[student.grade] || 0) + 1;
        });
        
        this.state.gradeChart.data.labels = Object.keys(gradeCounts);
        this.state.gradeChart.data.datasets = [{
            label: 'Number of Students',
            data: Object.values(gradeCounts),
            backgroundColor: [
                'rgba(255, 99, 132, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 206, 86, 0.7)',
                'rgba(75, 192, 192, 0.7)',
                'rgba(153, 102, 255, 0.7)',
                'rgba(255, 159, 64, 0.7)'
            ],
            borderWidth: 1
        }];
        
        this.state.gradeChart.update();
    }

    // Utility Methods
    saveToLocalStorage() {
        localStorage.setItem('students', JSON.stringify(this.state.students));
    }

    togglePassword() {
        const passwordField = this.elements.loginPassword;
        const toggleBtn = document.querySelector('.toggle-password');
        
        if (passwordField.type === 'password') {
            passwordField.type = 'text';
            toggleBtn.textContent = '🙈';
        } else {
            passwordField.type = 'password';
            toggleBtn.textContent = '👁️';
        }
    }

    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        document.querySelector('.container').classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize dark mode if previously set
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        document.querySelector('.container').classList.add('dark-mode');
    }

    // Create and expose the application instance
    window.sms = new StudentManagementSystem();
    
    // Make helper functions available globally
    window.togglePassword = () => sms.togglePassword();
    window.sortStudents = (column) => sms.sortStudents(column);
    window.changePage = (page) => sms.changePage(page);
});
// Основные переменные
let classChart = null;
let studentChart = null;
let currentStudents = [];

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    setupNavigation();
    setupFileUpload();
    setupDownloadButton();
    showSection('upload');
    currentStudents = [];
    updateDisplays();
});

// Настройка навигации
function setupNavigation() {
    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);
        });
    });
}

// Показать секцию
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    
    document.getElementById(sectionId).style.display = 'block';
    
    if (sectionId === 'table-stats' || sectionId === 'graph-stats') {
        updateStatistics();
    }
    
    if (sectionId === 'edit-section') {
        updateEditTable();
    }
}

// Загрузка файлов
function setupFileUpload() {
    const fileInput = document.getElementById('file-input');
    const uploadButton = document.getElementById('upload-button');
    
    uploadButton.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', function() {
        if (this.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                processCSVData(e.target.result);
            };
            reader.readAsText(this.files[0]);
        }
    });
}

// Обработка CSV данных
function processCSVData(csvData) {
    const rows = csvData.split('\n').filter(row => row.trim() !== '');
    
    currentStudents = [];
    
    for (let i = 1; i < rows.length; i++) {
        const columns = rows[i].split(';');
        if (columns.length >= 7) {
            const student = {
                name: columns[0].trim(),
                className: columns[1].trim(),
                grades: {
                    informatics: parseGrade(columns[2]),
                    physics: parseGrade(columns[3]),
                    math: parseGrade(columns[4]),
                    literature: parseGrade(columns[5]),
                    music: parseGrade(columns[6])
                }
            };
            
            currentStudents.push(student);
        }
    }
    
    updateDisplays();
    saveToLocalStorage();
}

// Проверка валидности оценки
function isValidGrade(gradeValue) {
    if (gradeValue === '') return true;
    
    const grade = parseInt(gradeValue);
    return !isNaN(grade) && grade >= 2 && grade <= 5;
}

// Функция для корректного парсинга оценок
function parseGrade(gradeValue) {
    if (!gradeValue || gradeValue.trim() === '') return '';
    const parsed = parseInt(gradeValue.trim());
    return (isNaN(parsed) || parsed < 2 || parsed > 5) ? '' : parsed;
}

// Обновление всех отображений
function updateDisplays() {
    displayPreview();
    updateEditTable();
    updateStatistics();
}

// Показ превью загруженных данных
function displayPreview() {
    const dataPreview = document.getElementById('data-preview');
    
    if (currentStudents.length === 0) {
        dataPreview.innerHTML = '<p style="text-align: center; color: #888; font-size: 1.2rem;">Нет загруженных данных</p>';
        return;
    }
    
    const classes = groupStudentsByClass(currentStudents);
    let html = '';
    
    Object.keys(classes).forEach(className => {
        html += `<div class="class-section">
            <div class="class-header">Класс: ${className}</div>
            <table>
                <thead><tr>
                    <th>ФИО</th><th>Класс</th><th>Информатика</th><th>Физика</th>
                    <th>Математика</th><th>Литература</th><th>Музыка</th>
                </tr></thead><tbody>`;
        
        classes[className].forEach(student => {
            html += `<tr>
                <td>${student.name}</td>
                <td>${student.className}</td>
                <td class="grade-${student.grades.informatics}">${student.grades.informatics}</td>
                <td class="grade-${student.grades.physics}">${student.grades.physics}</td>
                <td class="grade-${student.grades.math}">${student.grades.math}</td>
                <td class="grade-${student.grades.literature}">${student.grades.literature}</td>
                <td class="grade-${student.grades.music}">${student.grades.music}</td>
            </tr>`;
        });
        
        html += '</tbody></table></div>';
    });
    
    dataPreview.innerHTML = html;
}

// Группировка студентов по классам
function groupStudentsByClass(students) {
    const classes = {};
    students.forEach(student => {
        if (!classes[student.className]) {
            classes[student.className] = [];
        }
        classes[student.className].push(student);
    });
    return classes;
}

// Обновление таблицы редактирования
function updateEditTable() {
    const editPreview = document.getElementById('edit-data-preview');
    
    if (currentStudents.length === 0) {
        editPreview.innerHTML = '<p style="text-align: center; color: #888; font-size: 1.2rem;">Нет данных для редактирования</p>';
        return;
    }
    
    const classes = groupStudentsByClass(currentStudents);
    let html = '';
    
    Object.keys(classes).forEach(className => {
        html += `<div class="class-section">
            <div class="class-header">Класс: ${className}</div>
            <table>
                <thead><tr>
                    <th>ФИО</th><th>Класс</th><th>Информатика</th><th>Физика</th>
                    <th>Математика</th><th>Литература</th><th>Музыка</th><th>Действия</th>
                </tr></thead><tbody>`;
        
        classes[className].forEach((student, index) => {
            const globalIndex = currentStudents.findIndex(s => 
                s.name === student.name && s.className === student.className
            );
            
            html += `<tr>
                <td>${student.name}</td>
                <td>${student.className}</td>
                <td class="grade-${student.grades.informatics}">${student.grades.informatics}</td>
                <td class="grade-${student.grades.physics}">${student.grades.physics}</td>
                <td class="grade-${student.grades.math}">${student.grades.math}</td>
                <td class="grade-${student.grades.literature}">${student.grades.literature}</td>
                <td class="grade-${student.grades.music}">${student.grades.music}</td>
                <td>
                    <button class="action-button edit-btn" onclick="editStudent(${globalIndex})">✏️</button>
                    <button class="action-button delete-btn" onclick="deleteStudent(${globalIndex})">🗑️</button>
                </td>
            </tr>`;
        });
        
        html += '</tbody></table></div>';
    });
    
    editPreview.innerHTML = html;
}

// Добавление/обновление ученика
function addOrUpdateStudent() {
    const name = document.getElementById('student-name').value.trim();
    const className = document.getElementById('student-class').value.trim();
    
    if (!name || !className) {
        alert('Заполните ФИО и класс ученика');
        return;
    }
    
    const informatics = document.getElementById('grade-informatics').value;
    const physics = document.getElementById('grade-physics').value;
    const math = document.getElementById('grade-math').value;
    const literature = document.getElementById('grade-literature').value;
    const music = document.getElementById('grade-music').value;
    
    const gradeInputs = [
        { value: informatics, subject: 'Информатика', element: document.getElementById('grade-informatics') },
        { value: physics, subject: 'Физика', element: document.getElementById('grade-physics') },
        { value: math, subject: 'Математика', element: document.getElementById('grade-math') },
        { value: literature, subject: 'Литература', element: document.getElementById('grade-literature') },
        { value: music, subject: 'Музыка', element: document.getElementById('grade-music') }
    ];
    
    let invalidGradeFound = false;
    let invalidSubject = '';
    
    for (let input of gradeInputs) {
        if (input.value && !isValidGrade(input.value)) {
            invalidGradeFound = true;
            invalidSubject = input.subject;
            input.element.focus();
            break;
        }
    }
    
    if (invalidGradeFound) {
        alert(`Оценка по предмету "${invalidSubject}" должна быть от 2 до 5!`);
        return;
    }
    
    const grades = {
        informatics: parseGrade(informatics),
        physics: parseGrade(physics),
        math: parseGrade(math),
        literature: parseGrade(literature),
        music: parseGrade(music)
    };
    
    const student = { name, className, grades };
    const existingIndex = currentStudents.findIndex(s => 
        s.name === name && s.className === className
    );
    
    if (existingIndex !== -1) {
        currentStudents[existingIndex] = student;
    } else {
        currentStudents.push(student);
    }
    
    document.getElementById('student-form').reset();
    updateDisplays();
    saveToLocalStorage();
}

// Редактирование ученика
function editStudent(index) {
    const student = currentStudents[index];
    document.getElementById('student-name').value = student.name;
    document.getElementById('student-class').value = student.className;
    document.getElementById('grade-informatics').value = student.grades.informatics || '';
    document.getElementById('grade-physics').value = student.grades.physics || '';
    document.getElementById('grade-math').value = student.grades.math || '';
    document.getElementById('grade-literature').value = student.grades.literature || '';
    document.getElementById('grade-music').value = student.grades.music || '';
}

// Удаление ученика
function deleteStudent(index) {
    if (confirm('Удалить этого ученика?')) {
        currentStudents.splice(index, 1);
        updateDisplays();
        saveToLocalStorage();
    }
}

// Обновление статистики
function updateStatistics() {
    updateTableStatistics();
    updateChartStatistics();
}

// Статистика в таблицах
function updateTableStatistics() {
    const statsContainer = document.getElementById('stats-container');
    
    if (currentStudents.length === 0) {
        statsContainer.innerHTML = '<p style="text-align: center; color: #888; font-size: 1.2rem;">Нет данных для статистики</p>';
        return;
    }
    
    const overallStats = calculateOverallStatistics();
    const classStats = calculateClassStatistics();
    let html = '';
    
    html += `<div class="overall-stats-section">
        <div class="overall-stats-header">Общая статистика по всем классам</div>
        <div class="table-wrapper">
            <table class="overall-stats-table">
                <thead><tr>
                    <th>Предмет</th><th>Средний балл</th><th>Медиана</th>
                    <th>5</th><th>4</th><th>3</th><th>2</th>
                    <th>%5</th><th>%4</th><th>%3</th><th>%2</th>
                </tr></thead><tbody>`;
    
    const subjects = ['Информатика', 'Физика', 'Математика', 'Литература', 'Музыка'];
    const subjectKeys = ['informatics', 'physics', 'math', 'literature', 'music'];
    
    subjectKeys.forEach((subjectKey, index) => {
        const stats = overallStats[subjectKey];
        if (stats.grades.length > 0) {
            const total = stats.grades.length;
            html += `<tr>
                <td><strong>${subjects[index]}</strong></td>
                <td>${stats.average.toFixed(2)}</td><td>${stats.median.toFixed(2)}</td>
                <td>${stats.counts[5] || 0}</td><td>${stats.counts[4] || 0}</td>
                <td>${stats.counts[3] || 0}</td><td>${stats.counts[2] || 0}</td>
                <td>${((stats.counts[5] / total) * 100).toFixed(1)}%</td>
                <td>${((stats.counts[4] / total) * 100).toFixed(1)}%</td>
                <td>${((stats.counts[3] / total) * 100).toFixed(1)}%</td>
                <td>${((stats.counts[2] / total) * 100).toFixed(1)}%</td>
            </tr>`;
        }
    });
    
    html += '</tbody></table></div></div>';
    
    html += `<h3 style="color: var(--primary-dark); margin: 3rem 0 1rem 0; text-align: center;">Детальная статистика по классам</h3>`;
    
    Object.keys(classStats).forEach(className => {
        html += `<div class="class-stats-section">
            <div class="class-stats-header">Класс: ${className}</div>
            <div class="table-wrapper">
                <table class="stats-table">
                    <thead><tr>
                        <th>Предмет</th><th>Средний балл</th><th>Медиана</th>
                        <th>5</th><th>4</th><th>3</th><th>2</th>
                        <th>%5</th><th>%4</th><th>%3</th><th>%2</th>
                    </tr></thead><tbody>`;
        
        subjectKeys.forEach((subjectKey, index) => {
            const stats = classStats[className][subjectKey];
            if (stats.grades.length > 0) {
                const total = stats.grades.length;
                html += `<tr>
                    <td>${subjects[index]}</td>
                    <td>${stats.average.toFixed(2)}</td><td>${stats.median.toFixed(2)}</td>
                    <td>${stats.counts[5] || 0}</td><td>${stats.counts[4] || 0}</td>
                    <td>${stats.counts[3] || 0}</td><td>${stats.counts[2] || 0}</td>
                    <td>${((stats.counts[5] / total) * 100).toFixed(1)}%</td>
                    <td>${((stats.counts[4] / total) * 100).toFixed(1)}%</td>
                    <td>${((stats.counts[3] / total) * 100).toFixed(1)}%</td>
                    <td>${((stats.counts[2] / total) * 100).toFixed(1)}%</td>
                </tr>`;
            }
        });
        
        html += '</tbody></table></div></div>';
    });
    
    statsContainer.innerHTML = html;
}

// Расчет ОБЩЕЙ статистики (по всем классам вместе)
function calculateOverallStatistics() {
    const overallStats = {
        informatics: { grades: [] },
        physics: { grades: [] },
        math: { grades: [] },
        literature: { grades: [] },
        music: { grades: [] }
    };
    
    currentStudents.forEach(student => {
        if (student.grades.informatics && !isNaN(student.grades.informatics)) overallStats.informatics.grades.push(student.grades.informatics);
        if (student.grades.physics && !isNaN(student.grades.physics)) overallStats.physics.grades.push(student.grades.physics);
        if (student.grades.math && !isNaN(student.grades.math)) overallStats.math.grades.push(student.grades.math);
        if (student.grades.literature && !isNaN(student.grades.literature)) overallStats.literature.grades.push(student.grades.literature);
        if (student.grades.music && !isNaN(student.grades.music)) overallStats.music.grades.push(student.grades.music);
    });
    
    ['informatics', 'physics', 'math', 'literature', 'music'].forEach(subject => {
        const grades = overallStats[subject].grades;
        if (grades.length > 0) {
            overallStats[subject].average = grades.reduce((a, b) => a + b, 0) / grades.length;
            overallStats[subject].median = calculateMedian(grades);
            overallStats[subject].counts = countGrades(grades);
        } else {
            overallStats[subject].average = 0;
            overallStats[subject].median = 0;
            overallStats[subject].counts = { 2: 0, 3: 0, 4: 0, 5: 0 };
        }
    });
    
    return overallStats;
}

// Расчет статистики по классам (отдельно для каждого класса)
function calculateClassStatistics() {
    const classStats = {};
    const classes = groupStudentsByClass(currentStudents);
    
    Object.keys(classes).forEach(className => {
        if (!classStats[className]) {
            classStats[className] = {
                informatics: { grades: [] },
                physics: { grades: [] },
                math: { grades: [] },
                literature: { grades: [] },
                music: { grades: [] }
            };
        }
        
        classes[className].forEach(student => {
            if (student.grades.informatics && !isNaN(student.grades.informatics)) classStats[className].informatics.grades.push(student.grades.informatics);
            if (student.grades.physics && !isNaN(student.grades.physics)) classStats[className].physics.grades.push(student.grades.physics);
            if (student.grades.math && !isNaN(student.grades.math)) classStats[className].math.grades.push(student.grades.math);
            if (student.grades.literature && !isNaN(student.grades.literature)) classStats[className].literature.grades.push(student.grades.literature);
            if (student.grades.music && !isNaN(student.grades.music)) classStats[className].music.grades.push(student.grades.music);
        });
        
        ['informatics', 'physics', 'math', 'literature', 'music'].forEach(subject => {
            const grades = classStats[className][subject].grades;
            if (grades.length > 0) {
                classStats[className][subject].average = grades.reduce((a, b) => a + b, 0) / grades.length;
                classStats[className][subject].median = calculateMedian(grades);
                classStats[className][subject].counts = countGrades(grades);
            } else {
                classStats[className][subject].average = 0;
                classStats[className][subject].median = 0;
                classStats[className][subject].counts = { 2: 0, 3: 0, 4: 0, 5: 0 };
            }
        });
    });
    
    return classStats;
}

// Вспомогательные функции
function calculateMedian(grades) {
    const sorted = [...grades].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function countGrades(grades) {
    const counts = { 2: 0, 3: 0, 4: 0, 5: 0 };
    grades.forEach(grade => {
        if (grade >= 2 && grade <= 5) {
            counts[grade]++;
        }
    });
    return counts;
}

// Графики
function updateChartStatistics() {
    if (currentStudents.length === 0) {
        if (classChart) classChart.destroy();
        if (studentChart) studentChart.destroy();
        return;
    }
    
    const classStats = calculateClassStatistics();
    const overallStats = calculateOverallStatistics();
    
    createClassChart(overallStats);
    createStudentChart(classStats);
}

function createClassChart(overallStats) {
    const ctx = document.getElementById('class-chart').getContext('2d');
    if (classChart) classChart.destroy();
    
    const subjects = ['Информатика', 'Физика', 'Математика', 'Литература', 'Музыка'];
    const subjectKeys = ['informatics', 'physics', 'math', 'literature', 'music'];
    const averages = subjectKeys.map(key => 
        overallStats[key].grades.length > 0 ? 
        parseFloat(overallStats[key].average.toFixed(2)) : 0
    );
    
    classChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: subjects,
            datasets: [{
                label: 'Средний балл',
                data: averages,
                backgroundColor: '#A8E6CF',
                borderColor: '#88D4B5',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            animation: false, // УБРАНА АНИМАЦИЯ
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5,
                    title: {
                        display: true,
                        text: 'Средний балл'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Общая успеваемость по предметам'
                }
            }
        }
    });
}

function createStudentChart(classStats) {
    const ctx = document.getElementById('student-chart').getContext('2d');
    if (studentChart) studentChart.destroy();
    
    const subjects = ['Информатика', 'Физика', 'Математика', 'Литература', 'Музыка'];
    const subjectKeys = ['informatics', 'physics', 'math', 'literature', 'music'];
    const colors = ['#A8E6CF', '#FFD3B6', '#FFAAA5', '#DCEDC8', '#FF8B94'];
    
    const datasets = subjectKeys.map((subjectKey, index) => ({
        label: subjects[index],
        data: Object.keys(classStats).map(className => 
            classStats[className][subjectKey].grades.length > 0 ?
            parseFloat(classStats[className][subjectKey].average.toFixed(2)) : 0
        ),
        backgroundColor: colors[index],
        borderColor: colors[index],
        borderWidth: 2
    }));
    
    studentChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(classStats),
            datasets: datasets
        },
        options: {
            responsive: true,
            animation: false, // УБРАНА АНИМАЦИЯ
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5,
                    title: {
                        display: true,
                        text: 'Средний балл'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Сравнение успеваемости по классам'
                }
            }
        }
    });
}

// Локальное хранилище
function saveToLocalStorage() {
    localStorage.setItem('electronicDiaryData', JSON.stringify(currentStudents));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('electronicDiaryData');
    if (saved) {
        currentStudents = JSON.parse(saved);
        updateDisplays();
    }
}

// Скачивание данных
function setupDownloadButton() {
    document.getElementById('download-data-button').addEventListener('click', function() {
        if (currentStudents.length === 0) {
            alert('Нет данных для скачивания');
            return;
        }
        
        let csvData = 'ФИО;Класс;Информатика;Физика;Математика;Литература;Музыка\n';
        
        currentStudents.forEach(student => {
            csvData += `${student.name};${student.className};${student.grades.informatics};${student.grades.physics};${student.grades.math};${student.grades.literature};${student.grades.music}\n`;
        });
        
        downloadFile('оценки.csv', csvData, 'text/csv;charset=utf-8');
    });
}

function downloadFile(filename, content, mimeType) {
    const blob = new Blob(["\uFEFF" + content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
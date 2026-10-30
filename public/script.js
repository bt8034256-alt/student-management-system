
const form = document.getElementById("studentForm");
const studentList = document.getElementById("studentList");
const message = document.getElementById("message");

const API = "/api/students";

// Fetch and display students
async function loadStudents() {
    const response = await fetch(API);
    const students = await response.json();

    studentList.innerHTML = "";

    students.forEach(student => {
        const row = document.createElement("tr");

        [student.id, student.name, student.email, student.course]
            .forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

        const actions = document.createElement("td");

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.className = "edit";
        editBtn.onclick = () => editStudent(student);

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "delete";
        deleteBtn.onclick = () => deleteStudent(student.id);

        actions.append(editBtn, deleteBtn);
        row.appendChild(actions);
        studentList.appendChild(row);
    });
}

// Add or update student
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("studentId").value;
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const course = document.getElementById("course").value.trim();

    if (!name || !email || !course) {
        message.textContent = "All fields are required!";
        return;
    }

    const method = id ? "PUT" : "POST";
    const url = id ? `${API}/${id}` : API;

    try {
        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, course })
        });

        const result = await response.json();

        if (!response.ok) {
            message.textContent = result.error;
            return;
        }

        message.textContent = id
            ? "Student updated successfully!"
            : "Student added successfully!";

        form.reset();
        document.getElementById("studentId").value = "";
        loadStudents();

    } catch (error) {
        message.textContent = "Server connection failed!";
    }
});

// Edit student
function editStudent(student) {
    document.getElementById("studentId").value = student.id;
    document.getElementById("name").value = student.name;
    document.getElementById("email").value = student.email;
    document.getElementById("course").value = student.course;
    window.scrollTo(0, 0);
}

// Delete student
async function deleteStudent(id) {
    if (!confirm("Are you sure you want to delete this student?")) return;

    const response = await fetch(`${API}/${id}`, {
        method: "DELETE"
    });

    const result = await response.json();

    message.textContent = result.message || result.error;
    loadStudents();
}

// Initial load
loadStudents();

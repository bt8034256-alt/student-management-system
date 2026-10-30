
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

const db = new sqlite3.Database("./students.db");

db.run(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    course TEXT NOT NULL
  )
`);

// GET all students
app.get("/api/students", (req, res) => {
  db.all("SELECT * FROM students", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST new student
app.post("/api/students", (req, res) => {
  const { name, email, course } = req.body;

  if (!name?.trim() || !email?.trim() || !course?.trim())
    return res.status(400).json({ error: "All fields are required" });

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: "Invalid email" });

  db.run(
    "INSERT INTO students (name, email, course) VALUES (?, ?, ?)",
    [name.trim(), email.trim(), course.trim()],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.status(201).json({ id: this.lastID, name, email, course });
    }
  );
});

// PUT update student
app.put("/api/students/:id", (req, res) => {
  const { name, email, course } = req.body;

  if (!name?.trim() || !email?.trim() || !course?.trim())
    return res.status(400).json({ error: "All fields are required" });

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: "Invalid email" });

  db.run(
    "UPDATE students SET name=?, email=?, course=? WHERE id=?",
    [name.trim(), email.trim(), course.trim(), req.params.id],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      if (!this.changes) return res.status(404).json({ error: "Student not found" });
      res.json({ message: "Student updated successfully" });
    }
  );
});

// DELETE student
app.delete("/api/students/:id", (req, res) => {
  db.run("DELETE FROM students WHERE id=?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (!this.changes) return res.status(404).json({ error: "Student not found" });
    res.json({ message: "Student deleted successfully" });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

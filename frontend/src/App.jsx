import { useCallback, useEffect, useMemo, useState } from "react";

const EMPTY_STUDENT = { id: "", name: "", age: "", department: "" };

async function request(path, options) {
  const response = await fetch(path, options);
  const responseText = await response.text();
  let result = null;

  if (responseText) {
    try {
      result = JSON.parse(responseText);
    } catch {
      result = responseText;
    }
  }

  if (!response.ok) {
    const message =
      typeof result === "object" && result !== null
        ? result.message || result.error
        : result;
    throw new Error(message || `Request failed (${response.status})`);
  }

  return result;
}

function getStudentId(student) {
  return student.ID ?? student.id;
}

function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function App() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [dialog, setDialog] = useState(null);
  const [form, setForm] = useState(EMPTY_STUDENT);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await request("/getStudent");
      if (!Array.isArray(data)) {
        setLoadError("The server returned an unexpected student list.");
        return;
      }
      setStudents(data);
    } catch (error) {
      setLoadError(error.message || "Unable to load students.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStudents();
  }, [loadStudents]);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return students;
    return students.filter((student) =>
      [getStudentId(student), student.name, student.department, student.age]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [search, students]);

  function openCreateDialog() {
    setForm(EMPTY_STUDENT);
    setFormError("");
    setDialog({ type: "create" });
  }

  function openEditDialog(student) {
    setForm({
      id: String(getStudentId(student) ?? ""),
      name: student.name ?? "",
      age: String(student.age ?? ""),
      department: student.department ?? "",
    });
    setFormError("");
    setDialog({ type: "edit", student });
  }

  async function saveStudent(event) {
    event.preventDefault();
    const id = Number(form.id);
    const age = Number(form.age);

    if (!Number.isInteger(id) || id < 1 || id > 2147483647) {
      setFormError("Enter a whole-number student ID between 1 and 2,147,483,647.");
      return;
    }
    if (!Number.isInteger(age) || age < 1 || age > 120) {
      setFormError("Enter an age between 1 and 120.");
      return;
    }
    if (!form.name.trim() || !form.department.trim()) {
      setFormError("Name and department are required.");
      return;
    }

    setSaving(true);
    setFormError("");
    const payload = {
      ID: id,
      name: form.name.trim(),
      age,
      department: form.department.trim(),
    };

    try {
      await request(
        dialog.type === "create" ? "/addStudent" : "/updateStudent",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      setDialog(null);
      setNotice(dialog.type === "create" ? "Student added." : "Student updated.");
      await loadStudents();
    } catch (error) {
      setFormError(error.message || "Unable to save this student.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteStudent(student) {
    setSaving(true);
    setFormError("");
    try {
      await request(`/deleteStudent/${encodeURIComponent(getStudentId(student))}`);
      setDialog(null);
      setNotice("Student deleted.");
      await loadStudents();
    } catch (error) {
      setFormError(error.message || "Unable to delete this student.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Student Directory home">
          <span className="brand-mark">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m3 9 9-5 9 5-9 5-9-5Z" />
              <path d="M7 11.2v4.3c2.8 2.2 7.2 2.2 10 0v-4.3M21 9v6" />
            </svg>
          </span>
          <span>Campus<span className="brand-accent">Desk</span></span>
        </a>
        <div className="topbar-right">
          <span className="connection-indicator" />
          <span>Student records</span>
          <span className="topbar-divider" />
          <span className="admin-avatar">AD</span>
          <span className="admin-label">Admin</span>
        </div>
      </header>

      <main className="page-content">
        <div className="page-heading">
          <div>
            <div className="eyebrow"><span /> MANAGEMENT</div>
            <h1>Student directory</h1>
            <p className="page-subtitle">A clear view of everyone in your campus community.</p>
          </div>
          <button className="primary-button" onClick={openCreateDialog}>
            <span className="plus-icon" aria-hidden="true">+</span>
            Add student
          </button>
        </div>

        <section className="summary-card" aria-label="Directory summary">
          <div className="summary-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M16 20v-1.6a3.4 3.4 0 0 0-3.4-3.4H6.4A3.4 3.4 0 0 0 3 18.4V20" />
              <circle cx="9.5" cy="7" r="3.5" />
              <path d="M17 11a3.5 3.5 0 0 0 0-6.8M21 20v-1.6a3.4 3.4 0 0 0-2.5-3.3" />
            </svg>
          </div>
          <div className="summary-copy">
            <span className="summary-label">TOTAL STUDENTS</span>
            <strong>{loading ? "—" : students.length}</strong>
          </div>
          <div className="summary-note">
            <span className="summary-dot" />
            <span>Records in your directory</span>
          </div>
        </section>

        <section className="directory-card">
          <div className="directory-toolbar">
            <div>
              <h2>All students <span className="count-badge">{students.length}</span></h2>
              <p>Search and manage student records</p>
            </div>
            <div className="toolbar-actions">
              <label className="search-box">
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <circle cx="8.7" cy="8.7" r="5.7" />
                  <path d="m13 13 4 4" />
                </svg>
                <input
                  type="search"
                  placeholder="Search students..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  aria-label="Search students"
                />
                {search && (
                  <button
                    className="clear-search"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    type="button"
                  >
                    ×
                  </button>
                )}
              </label>
              <button className="refresh-button" onClick={loadStudents} disabled={loading} aria-label="Refresh students">
                <svg viewBox="0 0 20 20" aria-hidden="true" className={loading ? "spin" : ""}>
                  <path d="M16.4 8A6.5 6.5 0 0 0 5 5.2L3.5 7M3.5 7V3.8M3.5 7h3.2M3.6 12a6.5 6.5 0 0 0 11.4 2.8l1.5-1.8m0 0v3.2m0-3.2h-3.2" />
                </svg>
              </button>
            </div>
          </div>

          {loadError ? (
            <div className="load-error" role="alert">
              <div>
                <strong>We couldn’t load the directory</strong>
                <span>{loadError}</span>
              </div>
              <button className="secondary-button" onClick={loadStudents}>Try again</button>
            </div>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>STUDENT</th>
                    <th>STUDENT ID</th>
                    <th>AGE</th>
                    <th>DEPARTMENT</th>
                    <th className="actions-heading">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 4 }, (_, index) => (
                      <tr className="loading-row" key={`loading-${index}`}>
                        <td><span className="skeleton skeleton-person" /></td>
                        <td><span className="skeleton skeleton-short" /></td>
                        <td><span className="skeleton skeleton-tiny" /></td>
                        <td><span className="skeleton skeleton-medium" /></td>
                        <td><span className="skeleton skeleton-actions" /></td>
                      </tr>
                    ))
                  ) : filteredStudents.length ? (
                    filteredStudents.map((student) => (
                      <tr key={getStudentId(student)}>
                        <td>
                          <div className="student-cell">
                            <span className="student-avatar">{initials(student.name)}</span>
                            <span className="student-name">{student.name}</span>
                          </div>
                        </td>
                        <td><span className="id-value">#{getStudentId(student)}</span></td>
                        <td><span className="age-value">{student.age} years</span></td>
                        <td><span className="department-badge">{student.department}</span></td>
                        <td>
                          <div className="row-actions">
                            <button
                              className="icon-button edit-action"
                              onClick={() => openEditDialog(student)}
                              aria-label={`Edit ${student.name}`}
                              title="Edit student"
                            >
                              <svg viewBox="0 0 20 20" aria-hidden="true">
                                <path d="m12.8 4.2 3 3M4 16l3.2-.7L16 6.5a2.1 2.1 0 0 0-3-3l-8.8 8.8L4 16Z" />
                              </svg>
                            </button>
                            <button
                              className="icon-button delete-action"
                              onClick={() => {
                                setFormError("");
                                setDialog({ type: "delete", student });
                              }}
                              aria-label={`Delete ${student.name}`}
                              title="Delete student"
                            >
                              <svg viewBox="0 0 20 20" aria-hidden="true">
                                <path d="M4.5 6h11M8 6V4h4v2m2.5 0-.7 10H6.2L5.5 6M8.2 9v4m3.6-4v4" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">
                        <div className="empty-state">
                          <span className="empty-icon">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <circle cx="10.5" cy="10.5" r="6.5" />
                              <path d="m15.5 15.5 5 5M8 10.5h5" />
                            </svg>
                          </span>
                          <strong>{search ? "No students found" : "Your directory is empty"}</strong>
                          <span>{search ? "Try a different name, ID, or department." : "Add your first student to get started."}</span>
                          {!search && <button className="text-button" onClick={openCreateDialog}>Add a student</button>}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !loadError && filteredStudents.length > 0 && (
            <div className="table-footer">
              Showing <strong>{filteredStudents.length}</strong> of <strong>{students.length}</strong> students
            </div>
          )}
        </section>
        <footer className="page-footer">CampusDesk <span>·</span> Student records, thoughtfully organized.</footer>
      </main>

      {notice && <div className="toast" role="status">{notice}</div>}

      {dialog && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) setDialog(null);
          }}
        >
          {dialog.type === "delete" ? (
            <section className="modal-card confirm-card" role="alertdialog" aria-modal="true" aria-labelledby="dialog-title">
              <span className="confirm-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 3 2.8 19h18.4L12 3Z" />
                  <path d="M12 9v4m0 3h.01" />
                </svg>
              </span>
              <h2 id="dialog-title">Delete this student?</h2>
              <p>This will permanently remove <strong>{dialog.student.name}</strong> from your directory.</p>
              {formError && <p className="form-error" role="alert">{formError}</p>}
              <div className="modal-actions">
                <button className="secondary-button" onClick={() => setDialog(null)} disabled={saving}>Keep student</button>
                <button className="danger-button" onClick={() => deleteStudent(dialog.student)} disabled={saving}>
                  {saving ? "Deleting..." : "Delete student"}
                </button>
              </div>
            </section>
          ) : (
            <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
              <div className="modal-heading">
                <div>
                  <span className="modal-kicker">{dialog.type === "create" ? "NEW RECORD" : "EDIT RECORD"}</span>
                  <h2 id="dialog-title">{dialog.type === "create" ? "Add a student" : "Edit student"}</h2>
                  <p>{dialog.type === "create" ? "Enter the details to add them to your directory." : "Update the student’s information below."}</p>
                </div>
                <button className="modal-close" onClick={() => setDialog(null)} aria-label="Close dialog" disabled={saving}>×</button>
              </div>
              <form onSubmit={saveStudent}>
                <label className="form-field">
                  <span>Student ID</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={form.id}
                    onChange={(event) => setForm({ ...form, id: event.target.value })}
                    disabled={dialog.type === "edit" || saving}
                    placeholder="e.g. 1001"
                  />
                  <small>Use a unique ID for each student.</small>
                </label>
                <label className="form-field">
                  <span>Full name</span>
                  <input
                    type="text"
                    required
                    maxLength="100"
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    disabled={saving}
                    placeholder="e.g. Alex Morgan"
                  />
                </label>
                <div className="form-row">
                  <label className="form-field">
                    <span>Age</span>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      step="1"
                      required
                      value={form.age}
                      onChange={(event) => setForm({ ...form, age: event.target.value })}
                      disabled={saving}
                      placeholder="e.g. 20"
                    />
                  </label>
                  <label className="form-field">
                    <span>Department</span>
                    <input
                      type="text"
                      required
                      maxLength="100"
                      value={form.department}
                      onChange={(event) => setForm({ ...form, department: event.target.value })}
                      disabled={saving}
                      placeholder="e.g. Computer Science"
                    />
                  </label>
                </div>
                {formError && <p className="form-error" role="alert">{formError}</p>}
                <div className="modal-actions">
                  <button type="button" className="secondary-button" onClick={() => setDialog(null)} disabled={saving}>Cancel</button>
                  <button type="submit" className="primary-button" disabled={saving}>
                    {saving ? "Saving..." : dialog.type === "create" ? "Add student" : "Save changes"}
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default App;

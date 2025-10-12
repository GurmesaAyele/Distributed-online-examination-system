import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import API from "../api/api"; // If you already have src/api/api.ts; otherwise replace with axios

// -----------------------------
// Types
// -----------------------------
interface Exam {
  id: number;
  title: string;
  description?: string;
  duration?: number;
}

interface User {
  id: number;
  username: string;
  email?: string;
  role?: string; // student | teacher | admin
}

interface Result {
  id: number;
  exam: number;
  student: number;
  score: number;
}

// -----------------------------
// Small UI helpers
// -----------------------------
function IconMenu() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="p-6 text-center text-gray-500 border-2 border-dashed rounded-lg">{text}</div>
  );
}

// -----------------------------
// Dashboard layout and sidebar
// -----------------------------
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className="flex">
        <aside className="w-64 bg-white border-r hidden md:block">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Admin Dashboard</h2>
            <p className="text-sm text-gray-500">Distributed Exam System</p>
          </div>

          <nav className="p-4 space-y-1">
            <NavLink to="/">Overview</NavLink>
            <NavLink to="/exams">Exams</NavLink>
            <NavLink to="/questions">Questions</NavLink>
            <NavLink to="/users">Users</NavLink>
            <NavLink to="/results">Results</NavLink>
          </nav>

          <div className="p-4 mt-auto text-xs text-gray-400">© {new Date().getFullYear()}</div>
        </aside>

        <div className="flex-1">
          <header className="flex items-center justify-between p-4 bg-white border-b">
            <div className="flex items-center gap-3">
              <button className="md:hidden p-2 rounded hover:bg-gray-100">
                <IconMenu />
              </button>
              <h1 className="text-xl font-semibold">Admin</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">admin@example.com</div>
            </div>
          </header>

          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="block px-3 py-2 rounded hover:bg-gray-50 text-sm font-medium text-gray-700">
      {children}
    </Link>
  );
}

// -----------------------------
// Overview Page
// -----------------------------
function Overview() {
  const [examsCount, setExamsCount] = useState<number | null>(null);
  const [usersCount, setUsersCount] = useState<number | null>(null);
  const [resultsCount, setResultsCount] = useState<number | null>(null);

  useEffect(() => {
    API.get("exams/")
      .then((r) => setExamsCount(Array.isArray(r.data) ? r.data.length : null))
      .catch(() => setExamsCount(null));
    API.get("users/")
      .then((r) => setUsersCount(Array.isArray(r.data) ? r.data.length : null))
      .catch(() => setUsersCount(null));
    API.get("results/")
      .then((r) => setResultsCount(Array.isArray(r.data) ? r.data.length : null))
      .catch(() => setResultsCount(null));
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Exams" value={examsCount} />
        <StatCard title="Users" value={usersCount} />
        <StatCard title="Results" value={resultsCount} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-2 bg-white p-4 rounded shadow"> 
          <h3 className="font-semibold mb-2">Latest Exams</h3>
          <LatestExams />
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Quick Actions</h3>
          <p className="text-sm text-gray-600">Create exam, manage users or review results.</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number | null }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold">{value ?? "—"}</div>
    </div>
  );
}

function LatestExams() {
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    API.get("exams/?ordering=-id&limit=5")
      .then((r) => setExams(r.data))
      .catch(() => setExams([]));
  }, []);

  if (exams.length === 0) return <EmptyState text="No exams yet." />;

  return (
    <ul className="space-y-3">
      {exams.map((e) => (
        <li key={e.id} className="p-3 border rounded">
          <div className="font-medium">{e.title}</div>
          <div className="text-sm text-gray-600">{e.duration ?? "—"} minutes</div>
        </li>
      ))}
    </ul>
  );
}

// -----------------------------
// Exams Page (List + Create)
// -----------------------------
function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const fetchExams = () => {
    setLoading(true);
    API.get("exams/")
      .then((r) => setExams(r.data))
      .catch(() => setExams([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchExams();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Exams</h2>
        <div>
          <button onClick={() => setShowCreate(true)} className="px-3 py-1 bg-blue-600 text-white rounded">Create Exam</button>
          <button onClick={fetchExams} className="ml-2 px-3 py-1 border rounded">Refresh</button>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4">
        {loading ? (
          <div>Loading…</div>
        ) : exams.length === 0 ? (
          <EmptyState text="No exams available." />
        ) : (
          <table className="w-full text-sm table-auto">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="p-2">ID</th>
                <th className="p-2">Title</th>
                <th className="p-2">Duration</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((e) => (
                <tr key={e.id} className="border-t">
                  <td className="p-2">{e.id}</td>
                  <td className="p-2">{e.title}</td>
                  <td className="p-2">{e.duration ?? "—"} min</td>
                  <td className="p-2">
                    <button
                      onClick={() => alert("Open edit modal — implement as needed")}
                      className="px-2 py-1 mr-2 border rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (!confirm("Delete this exam?")) return;
                        API.delete(`exams/${e.id}/`).then(() => fetchExams());
                      }}
                      className="px-2 py-1 border rounded text-sm text-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && <CreateExamModal onClose={() => setShowCreate(false)} onCreated={fetchExams} />}
    </div>
  );
}

function CreateExamModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState<number | "">(60);
  const [saving, setSaving] = useState(false);

  const submit = () => {
    setSaving(true);
    API.post("exams/", { title, description, duration })
      .then(() => {
        onCreated();
        onClose();
      })
      .catch((e) => alert("Error creating exam"))
      .finally(() => setSaving(false));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded w-full max-w-md">
        <h3 className="font-semibold mb-3">Create Exam</h3>
        <div className="space-y-2">
          <div>
            <label className="block text-sm">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm">Duration (minutes)</label>
            <input type="number" value={String(duration)} onChange={(e) => setDuration(Number(e.target.value))} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border p-2 rounded" />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 border rounded">Cancel</button>
          <button onClick={submit} className="px-3 py-1 bg-blue-600 text-white rounded" disabled={saving}>{saving ? "Saving…" : "Create"}</button>
        </div>
      </div>
    </div>
  );
}

// -----------------------------
// Users Page
// -----------------------------
function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    API.get("users/")
      .then((r) => setUsers(r.data))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading…</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Users</h2>
      </div>

      <div className="bg-white rounded shadow p-4">
        {users.length === 0 ? (
          <EmptyState text="No users found." />
        ) : (
          <table className="w-full text-sm table-auto">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="p-2">ID</th>
                <th className="p-2">Username</th>
                <th className="p-2">Email</th>
                <th className="p-2">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-2">{u.id}</td>
                  <td className="p-2">{u.username}</td>
                  <td className="p-2">{u.email ?? "—"}</td>
                  <td className="p-2">{u.role ?? "student"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// -----------------------------
// Results Page
// -----------------------------
function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    API.get("results/")
      .then((r) => setResults(r.data))
      .catch(() => setResults([]));
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Results</h2>
      </div>

      <div className="bg-white rounded shadow p-4">
        {results.length === 0 ? (
          <EmptyState text="No results yet." />
        ) : (
          <table className="w-full text-sm table-auto">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="p-2">ID</th>
                <th className="p-2">Exam</th>
                <th className="p-2">Student</th>
                <th className="p-2">Score</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-2">{r.id}</td>
                  <td className="p-2">{r.exam}</td>
                  <td className="p-2">{r.student}</td>
                  <td className="p-2">{r.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// -----------------------------
// Questions placeholder page
// -----------------------------
function QuestionsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Questions</h2>
        <div>
          <button className="px-3 py-1 bg-blue-600 text-white rounded">Create Question</button>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">Implement question management (create/update/delete) here.</div>
    </div>
  );
}

// -----------------------------
// Root App (routes)
// -----------------------------
export default function AdminDashboardApp() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/exams" element={<ExamsPage />} />
          <Route path="/questions" element={<QuestionsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

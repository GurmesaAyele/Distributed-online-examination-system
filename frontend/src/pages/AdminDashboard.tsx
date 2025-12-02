import React, { useEffect, useState } from "react";
import "../styles/admin-dashboard.css";
import { Chart, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

Chart.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// -------------------- Types --------------------
type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  profile_photo?: string;
};

type Exam = {
  id: number;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  max_score: number;
  is_active: boolean;
};

type Question = {
  id: number;
  exam: number;
  text: string;
  question_type: string;
  options?: string[];
  correct_answer?: string;
  category?: string;
  media_file?: string;
};

const roles = ["admin", "teacher", "student"];
const questionTypes = ["MCQ", "TF", "SA", "Essay"];

const AdminDashboard: React.FC = () => {
  // -------------------- State --------------------
  const [users, setUsers] = useState<User[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeTab, setActiveTab] = useState("users");
  const [darkMode, setDarkMode] = useState(false);

  // User form
  const [formUser, setFormUser] = useState<any>({
    id: 0,
    username: "",
    email: "",
    role: "student",
    first_name: "",
    last_name: "",
    password: "",
    profile_photo: null,
  });
  const [preview, setPreview] = useState<string>("");
  const [isEditingUser, setIsEditingUser] = useState(false);

  // Exam form
  const [formExam, setFormExam] = useState<any>({
    id: 0,
    name: "",
    description: "",
    start_time: "",
    end_time: "",
    duration_minutes: 60,
    max_score: 100,
    is_active: true,
  });
  const [isEditingExam, setIsEditingExam] = useState(false);

  // Question form
  const [formQuestion, setFormQuestion] = useState<any>({
    id: 0,
    exam: 0,
    text: "",
    question_type: "MCQ",
    options: ["", "", "", ""],
    correct_answer: "",
    category: "",
    media_file: null,
  });
  const [previewQuestionMedia, setPreviewQuestionMedia] = useState<string>("");

  // -------------------- Load Data --------------------
  const loadUsers = async () => {
    const res = await fetch("http://localhost:8000/api/users/");
    const data = await res.json();
    setUsers(data);
  };

  const loadExams = async () => {
    const res = await fetch("http://localhost:8000/api/exams/");
    const data = await res.json();
    setExams(data);
  };

  const loadQuestions = async () => {
    const res = await fetch("http://localhost:8000/api/questions/");
    const data = await res.json();
    setQuestions(data);
  };

  useEffect(() => {
    loadUsers();
    loadExams();
    loadQuestions();
  }, []);

  // -------------------- User Handlers --------------------
  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(formUser).forEach((key) => {
      if (formUser[key] !== null) formData.append(key, formUser[key]);
    });

    const url = isEditingUser
      ? `http://localhost:8000/api/users/${formUser.id}/`
      : "http://localhost:8000/api/users/";

    await fetch(url, { method: "POST", body: formData });
    setFormUser({ id: 0, username: "", email: "", role: "student", first_name: "", last_name: "", password: "", profile_photo: null });
    setPreview("");
    setIsEditingUser(false);
    loadUsers();
  };

  // -------------------- Exam Handlers --------------------
  const handleSubmitExam = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = isEditingExam
      ? `http://localhost:8000/api/exams/${formExam.id}/`
      : "http://localhost:8000/api/exams/";

    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formExam),
    });
    setFormExam({ id: 0, name: "", description: "", start_time: "", end_time: "", duration_minutes: 60, max_score: 100, is_active: true });
    setIsEditingExam(false);
    loadExams();
  };

  // -------------------- Question Handlers --------------------
  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(formQuestion).forEach((key) => {
      if (formQuestion[key] !== null) formData.append(key, formQuestion[key]);
    });

    const url = formQuestion.id
      ? `http://localhost:8000/api/questions/${formQuestion.id}/`
      : "http://localhost:8000/api/questions/";

    await fetch(url, { method: "POST", body: formData });
    setFormQuestion({ id: 0, exam: 0, text: "", question_type: "MCQ", options: ["", "", "", ""], correct_answer: "", category: "", media_file: null });
    setPreviewQuestionMedia("");
    loadQuestions();
  };

  // -------------------- Charts --------------------
  const activeStatusChart = {
    labels: ["Active", "Inactive"],
    datasets: [
      {
        label: "Users Status",
        data: [users.filter((u) => u.is_active).length, users.filter((u) => !u.is_active).length],
        backgroundColor: ["#28a745", "#dc3545"],
      },
    ],
  };

  const roleChart = {
    labels: roles,
    datasets: [
      {
        label: "Users by Role",
        data: roles.map((r) => users.filter((u) => u.role === r).length),
        backgroundColor: ["#007bff", "#ffc107", "#17a2b8"],
      },
    ],
  };

  const examChart = {
    labels: exams.map((e) => e.name),
    datasets: [
      {
        label: "Exams Max Score",
        data: exams.map((e) => e.max_score),
        backgroundColor: "#6f42c1",
      },
    ],
  };

  return (
    <div className={`dashboard-container ${darkMode ? "dark" : ""}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Admin Panel</h2>
        <button className="dark-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
        <ul>
          <li onClick={() => setActiveTab("users")} className={activeTab === "users" ? "active" : ""}>Users</li>
          <li onClick={() => setActiveTab("addUser")} className={activeTab === "addUser" ? "active" : ""}>Add User</li>
          <li onClick={() => setActiveTab("exams")} className={activeTab === "exams" ? "active" : ""}>Exams</li>
          <li onClick={() => setActiveTab("addExam")} className={activeTab === "addExam" ? "active" : ""}>Add Exam</li>
          <li onClick={() => setActiveTab("questions")} className={activeTab === "questions" ? "active" : ""}>Questions</li>
          <li onClick={() => setActiveTab("addQuestion")} className={activeTab === "addQuestion" ? "active" : ""}>Add Question</li>
          <li onClick={() => setActiveTab("stats")} className={activeTab === "stats" ? "active" : ""}>Stats</li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="content">
        {/* USERS */}
        {activeTab === "users" && (
          <div>
            <h2>Users</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Photo</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Active</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.profile_photo ? <img src={`http://localhost:8000${u.profile_photo}`} className="preview-img"/> : "No Photo"}</td>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>{u.is_active ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="charts">
              <div className="chart-box"><h4>Users Active Status</h4><Pie data={activeStatusChart}/></div>
              <div className="chart-box"><h4>Users by Role</h4><Pie data={roleChart}/></div>
            </div>
          </div>
        )}

        {/* ADD USER */}
        {activeTab === "addUser" && (
          <div>
            <h2>{isEditingUser ? "Edit User" : "Add User"}</h2>
            <form className="form-box" onSubmit={handleSubmitUser}>
              <input type="text" placeholder="Username" value={formUser.username} onChange={(e)=>setFormUser({...formUser,username:e.target.value})} required />
              <input type="email" placeholder="Email" value={formUser.email} onChange={(e)=>setFormUser({...formUser,email:e.target.value})} required />
              <input type="text" placeholder="First Name" value={formUser.first_name} onChange={(e)=>setFormUser({...formUser,first_name:e.target.value})}/>
              <input type="text" placeholder="Last Name" value={formUser.last_name} onChange={(e)=>setFormUser({...formUser,last_name:e.target.value})}/>
              <select value={formUser.role} onChange={(e)=>setFormUser({...formUser,role:e.target.value})}>{roles.map(r=><option key={r} value={r}>{r}</option>)}</select>
              {!isEditingUser && <input type="password" placeholder="Password" value={formUser.password} onChange={(e)=>setFormUser({...formUser,password:e.target.value})} required/>}
              <div className="photo-upload">
                <label>Profile Photo</label>
                <input type="file" accept="image/*" onChange={(e)=>{
                  if(e.target.files && e.target.files[0]){
                    const file = e.target.files[0];
                    setFormUser({...formUser,profile_photo:file});
                    setPreview(URL.createObjectURL(file));
                  }
                }} />
                {preview && <img src={preview} className="preview-img"/>}
              </div>
              <button type="submit">{isEditingUser ? "Update" : "Create"}</button>
            </form>
          </div>
        )}

        {/* ADD EXAM */}
        {activeTab === "addExam" && (
          <div>
            <h2>{isEditingExam ? "Edit Exam" : "Add Exam"}</h2>
            <form className="form-box" onSubmit={handleSubmitExam}>
              <input type="text" placeholder="Exam Name" value={formExam.name} onChange={(e)=>setFormExam({...formExam,name:e.target.value})} required/>
              <textarea placeholder="Description" value={formExam.description} onChange={(e)=>setFormExam({...formExam,description:e.target.value})}></textarea>
              <input type="datetime-local" value={formExam.start_time} onChange={(e)=>setFormExam({...formExam,start_time:e.target.value})} required/>
              <input type="datetime-local" value={formExam.end_time} onChange={(e)=>setFormExam({...formExam,end_time:e.target.value})} required/>
              <input type="number" placeholder="Duration (minutes)" value={formExam.duration_minutes} onChange={(e)=>setFormExam({...formExam,duration_minutes:parseInt(e.target.value)})}/>
              <input type="number" placeholder="Max Score" value={formExam.max_score} onChange={(e)=>setFormExam({...formExam,max_score:parseInt(e.target.value)})}/>
              <button type="submit">{isEditingExam ? "Update" : "Create"}</button>
            </form>
          </div>
        )}

        {/* ADD QUESTION */}
        {activeTab === "addQuestion" && (
          <div>
            <h2>Add Question</h2>
            <form className="form-box" onSubmit={handleSubmitQuestion}>
              <select value={formQuestion.exam} onChange={(e)=>setFormQuestion({...formQuestion,exam:parseInt(e.target.value)})}>
                <option value={0}>Select Exam</option>
                {exams.map(ex=><option key={ex.id} value={ex.id}>{ex.name}</option>)}
              </select>
              <textarea placeholder="Question Text" value={formQuestion.text} onChange={(e)=>setFormQuestion({...formQuestion,text:e.target.value})}></textarea>
              <select value={formQuestion.question_type} onChange={(e)=>setFormQuestion({...formQuestion,question_type:e.target.value})}>
                {questionTypes.map(q=><option key={q} value={q}>{q}</option>)}
              </select>
              <input type="file" accept="image/*,video/*,audio/*" onChange={(e)=>{
                if(e.target.files && e.target.files[0]){
                  const file = e.target.files[0];
                  setFormQuestion({...formQuestion,media_file:file});
                  setPreviewQuestionMedia(URL.createObjectURL(file));
                }
              }}/>
              {previewQuestionMedia && <div>{formQuestion.question_type==="Essay"?null:<img src={previewQuestionMedia} className="preview-img"/>}</div>}
              <button type="submit">Save Question</button>
            </form>
          </div>
        )}

        {/* STATS */}
        {activeTab === "stats" && (
          <div>
            <h2>Dashboard Statistics</h2>
            <div className="charts">
              <div className="chart-box"><h4>Users Active Status</h4><Pie data={activeStatusChart}/></div>
              <div className="chart-box"><h4>Users by Role</h4><Pie data={roleChart}/></div>
              <div className="chart-box"><h4>Exams Max Score</h4><Bar data={examChart}/></div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;

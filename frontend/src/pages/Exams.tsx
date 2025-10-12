import { useEffect, useState } from "react";
import API from "../api/api";

interface Exam {
  id: number;
  title: string;
  description: string;
  duration: number;
}

export default function Exams() {
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    API.get("exams/")
      .then((res) => setExams(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>📘 Available Exams</h1>
      {exams.map((exam) => (
        <div key={exam.id}>
          <h2>{exam.title}</h2>
          <p>{exam.description}</p>
          <p>Duration: {exam.duration} minutes</p>
          <hr />
        </div>
      ))}
    </div>
  );
}

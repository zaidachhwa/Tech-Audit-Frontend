import { useEffect, useState } from "react";
import { API } from "../../api/axios";

export default function StudentSelector({ student, setStudent }) {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await API.get("/students/list"); // ✅ FIXED
        console.log(res.data);
        setStudents(res.data.students);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStudents();
  }, []);

  return (
    <div className="bg-white p-4 rounded-xl border">
      <select
        value={student}
        onChange={(e) => setStudent(e.target.value)}
        className="border rounded-lg p-2 w-full"
      >
        <option value="">Select Student</option>

        {students.map((s) => (
          <option key={s._id} value={s._id}>
            {s.name}
          </option>
        ))}
      </select>
    </div>
  );
}
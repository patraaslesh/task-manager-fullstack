"use client";

import toast from "react-hot-toast";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // ✅ EDIT STATES
  const [editId, setEditId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  // 🔐 PROTECT ROUTE
  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
    }
  }, []);

  // 📥 FETCH TASKS
  const fetchTasks = async () => {
    try {
      let url = `http://localhost:5000/tasks?page=${page}`;

      if (search) url += `&search=${search}`;
      if (filter !== "") url += `&completed=${filter}`;

      const res = await fetch(url, {
        headers: {
          Authorization: token || "",
        },
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setTasks(data);
        setHasMore(data.length === 5);
      } else {
        setTasks([]);
        setHasMore(false);
      }
    } catch (error) {
      console.log(error);
      setTasks([]);
      setHasMore(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [search, filter, page]);

  // 🔄 Reset page on filter/search
  useEffect(() => {
    setPage(1);
  }, [search, filter]);

  // ➕ ADD TASK
  const addTask = async () => {
  if (!title.trim()) return;

  await fetch("http://localhost:5000/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token || "",
    },
    body: JSON.stringify({ title }),
  });

  toast.success("Task added 🎉");

  setTitle("");
  fetchTasks();
};

  // ❌ DELETE TASK
 const deleteTask = async (id: number) => {
  await fetch(`http://localhost:5000/tasks/${id}`, {
    method: "DELETE",
    headers: { Authorization: token || "" },
  });

  toast.success("Task deleted 🗑️");

  fetchTasks();
};

  // 🔁 TOGGLE TASK
const toggleTask = async (id: number) => {
  await fetch(`http://localhost:5000/tasks/${id}/toggle`, {
    method: "PATCH",
    headers: { Authorization: token || "" },
  });

  toast.success("Task updated 🔄");

  fetchTasks();
};

  // ✏️ UPDATE TASK
 const updateTask = async (id: number) => {
  if (!editText.trim()) return;

  await fetch(`http://localhost:5000/tasks/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: token || "",
    },
    body: JSON.stringify({ title: editText }),
  });

  toast.success("Task updated ✏️");

  setEditId(null);
  setEditText("");
  fetchTasks();
    };
    
  // 🚪 LOGOUT
  const logout = async () => {
    try {
      await fetch("http://localhost:5000/auth/logout", {
        method: "POST",
        headers: {
          Authorization: token || "",
        },
      });
    } catch (err) {
      console.log(err);
    }

    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-900 flex justify-center items-center">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
          >
            Logout
          </button>
        </div>

        {/* ADD TASK */}
        <div className="flex gap-2 mb-4">
          <input
            className="border border-gray-400 p-2 flex-1 rounded text-gray-900"
            placeholder="New task"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button
            onClick={addTask}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Add
          </button>
        </div>

        {/* SEARCH */}
        <input
          className="border border-gray-400 p-2 w-full mb-4 rounded text-gray-900"
          placeholder="Search task..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* FILTER */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setFilter("")}
            className={`px-3 py-1 rounded ${
              filter === "" ? "bg-blue-600 text-white" : "bg-gray-300"
            }`}
          >
            All
          </button>

          <button
            onClick={() => setFilter("true")}
            className={`px-3 py-1 rounded ${
              filter === "true" ? "bg-green-600 text-white" : "bg-gray-300"
            }`}
          >
            Completed
          </button>

          <button
            onClick={() => setFilter("false")}
            className={`px-3 py-1 rounded ${
              filter === "false" ? "bg-red-600 text-white" : "bg-gray-300"
            }`}
          >
            Pending
          </button>
        </div>

        {/* TASK LIST */}
        <div className="space-y-3">
          {tasks.length > 0 ? (
            tasks.map((task: any) => (
              <div
                key={task.id}
                className="flex justify-between items-center p-3 bg-gray-100 rounded shadow-sm"
              >
                {editId === task.id ? (
                  <input
                    className="border p-1 rounded text-black"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                ) : (
                  <span className="text-gray-900 font-medium">
                    {task.title} {task.completed ? "✅" : "❌"}
                  </span>
                )}

                <div className="flex gap-2">
                  {editId === task.id ? (
                    <button
                      onClick={() => updateTask(task.id)}
                      className="bg-green-500 text-white px-2 rounded"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditId(task.id);
                        setEditText(task.title);
                      }}
                      className="bg-yellow-500 text-white px-2 rounded"
                    >
                      Edit
                    </button>
                  )}

                  <button
                    onClick={() => toggleTask(task.id)}
                    className="bg-blue-500 text-white px-2 rounded"
                  >
                    Toggle
                  </button>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="bg-red-500 text-white px-2 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-700">No tasks found</p>
          )}
        </div>

        {/* PAGINATION */}
        <div className="flex justify-between items-center mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-1 border rounded text-gray-800 disabled:opacity-40"
          >
            Prev
          </button>

          <span className="text-gray-800 font-medium">Page: {page}</span>

          <button
            disabled={!hasMore}
            onClick={() => setPage(page + 1)}
            className="px-4 py-1 border rounded text-gray-800 disabled:opacity-40"
          >
            Next
          </button>
        </div>

      </div>
    </div>
  );
}
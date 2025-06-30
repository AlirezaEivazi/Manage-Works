import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';



interface Task {
  id: number;
  title: string;
  description: string;
}

interface User {
  username: string;
  role: string;
  tasks: Task[];
}

export default function AdminUserPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("https://localhost:7100/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    };

    fetchUsers();
  }, []);
  
  {users.map((user) => (
  <div key={user.username} className="bg-white shadow-md rounded-lg p-4 hover:bg-purple-100 transition-all">
    <h3 className="text-lg font-semibold">{user.username}</h3>
    <p className="text-sm text-gray-500">{user.role}</p>
    <Link
      to={`/admin/user/${user.username}`}
      className="text-purple-600 hover:underline mt-2 inline-block"
    >
      View Tasks
    </Link>
  </div>
))}

  const handleBack = () => {
    setSelectedUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-white p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-purple-700">
          {selectedUser ? `${selectedUser.username}'s Tasks` : "Admin User List"}
        </h1>

        {!selectedUser ? (
          <ul className="space-y-4">
            {users.length === 0 ? (
              <p className="text-center text-gray-500">No users found.</p>
            ) : (
              users.map((user) => (
                <li
                  key={user.username}
                  onClick={() => setSelectedUser(user)}
                  className="cursor-pointer bg-purple-100 hover:bg-purple-200 p-4 rounded-xl shadow transition-all"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-purple-800">{user.username}</span>
                    <span className="text-sm bg-purple-200 px-3 py-1 rounded-full text-purple-700">{user.role}</span>
                  </div>
                </li>
              ))
            )}
          </ul>
        ) : (
          <div>
            <ul className="space-y-4">
              {selectedUser.tasks.length === 0 ? (
                <p className="text-center text-gray-500">No tasks assigned.</p>
              ) : (
                selectedUser.tasks.map((task) => (
                  <li
                    key={task.id}
                    className="bg-purple-100 p-4 rounded-xl shadow hover:bg-purple-200 transition-all"
                  >
                    <h2 className="font-bold text-purple-800">{task.title}</h2>
                    <p className="text-gray-700">{task.description}</p>
                  </li>
                ))
              )}
            </ul>

            <div className="mt-6 text-center">
              <button
                onClick={handleBack}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full shadow"
              >
                Back to Users
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

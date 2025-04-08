// app/buyer/profile/page.tsx
"use client";
import { useState } from "react";

export default function ProfilePage() {
  const [name, setName] = useState("John Doe");
  const [email] = useState("john@lamduan.ac.th");

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Account Settings</h1>

      <label className="block mb-2">
        Name:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded mt-1"
        />
      </label>

      <label className="block mb-2">
        Email:
        <input
          type="text"
          value={email}
          readOnly
          className="w-full p-2 border bg-gray-100 mt-1"
        />
      </label>

      <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Save Changes</button>
    </div>
  );
}

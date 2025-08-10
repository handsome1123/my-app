'use client';

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 shadow rounded">Total Users: 0</div>
        <div className="bg-white p-4 shadow rounded">Total Products: 0</div>
        <div className="bg-white p-4 shadow rounded">Total Orders: 0</div>
        <div className="bg-white p-4 shadow rounded">Total Revenue: $0</div>
      </div>
    </div>
  );
}

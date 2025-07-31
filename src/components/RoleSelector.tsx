'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { roles, Role } from '@/utils/roles';

export default function RoleSelector() {
  const [selectedRole, setSelectedRole] = useState<Role | ''>('');
  const router = useRouter();

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value as Role;
    setSelectedRole(role);
    router.push(`/dashboard/${role}`);
  };

  return (
    <div className="mt-4">
      <label className="mr-2 font-semibold">Select Role:</label>
      <select
        className="p-2 border rounded"
        value={selectedRole}
        onChange={handleSelect}
      >
        <option value="">-- Choose Role --</option>
        {roles.map((role) => (
          <option key={role} value={role}>
            {role.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}

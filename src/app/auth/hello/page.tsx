'use client';

import { useEffect, useState } from 'react';

interface User {
  id: number;
  name: string;
}

const HelloPage = () => {
  const [data, setData] = useState<User[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/hello');
      const result = await res.json();
      setData(result.data);
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Hello from the Database</h1>
      {data ? (
        <ul>
          {data.map((item: User) => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default HelloPage;

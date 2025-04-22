'use client'; 

import { useEffect, useState } from 'react';

const HelloPage = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Fetch data from the API route
    const fetchData = async () => {
      const res = await fetch('/api/hello');
      const result = await res.json();
      setData(result.data);  // Assuming the response is { data: [...] }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Hello from the Database</h1>
      {data ? (
        <ul>
          {data.map((item: any) => (
            <li key={item.id}>{item.name}</li> // Adjust the fields to match your database structure
          ))}
        </ul>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default HelloPage;

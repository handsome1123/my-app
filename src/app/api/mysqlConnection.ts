import mysql from 'mysql2';

// Create a connection pool to the MySQL database
const pool = mysql.createPool({
  host: process.env.DB_HOST,       // 'localhost' or 'mysql' if using Docker network
  user: process.env.DB_USER,       // 'your_database_user'
  password: process.env.DB_PASSWORD, // 'your_database_password'
  database: process.env.DB_NAME    // 'your_database_name'
});

export default pool.promise();

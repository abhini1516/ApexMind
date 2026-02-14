1️⃣ Install Node.js (LTS version)

Download and install: https://nodejs.org
Check installation:
node -v
npm -v

2️⃣ Install PostgreSQL

Download and install: https://www.postgresql.org/download/
During installation:
Username: postgres
Password: use the same password which is sent (shared)
Port: 5432

3️⃣ Check PostgreSQL connection

Open terminal / cmd:
psql -U postgres
Enter the shared password.

Check databases:
\l
You should see apexmind.
If not, create it:
CREATE DATABASE apexmind;

Connect to it:
\c apexmind

4️⃣ Ensure users table exists

Run:

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);


✅ No need to insert any users; admin@apexmind.com already exists.

Exit psql:
\q

5️⃣ Clone the project
git clone https://github.com/abhini1516/ApexMind.git
cd ApexMind

6️⃣ Install project dependencies
npm install

7️⃣ Configure .env file
In project root, create .env and paste what is been sent personally.

8️⃣ Run the project
npm run dev
Then manually browse localhost:5000

9️⃣ Login
Open the frontend page and login using:

Email: admin@apexmind.com
Password: (Shared personally!)
No need to insert anything into the database — all data is already there.



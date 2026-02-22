import express, { Request, Response } from "express";
import { Pool } from "pg";
import dotenv from "dotenv"
import path from "path"

dotenv.config({path: path.join(process.cwd(), '.env')})

const app = express();
const port = 5000;

app.use(express.json());

const pool = new Pool({
  connectionString: `${process.env.CONNECTION_STR}`,
});

const initDb = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      age INT,
      phone VARCHAR(15),
      address TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      completed BOOLEAN NOT NULL DEFAULT false,
      due_date DATE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
};



app.get("/", (req: Request, res: Response) => {
  res.send("Hello next level developers!");
});


//users crud
app.post("/users", async(req: Request, res: Response)=> {
 const {name, email} = req.body;
 try{
  const result = await pool.query(`INSERT INTO users(name, email) VALUES($1, $2) RETURNING *`,[name, email]);
  res.status(201).json({
    success: true,
    message: "data inserted",
    data: result.rows[0]
  })

 }catch(err: any){
   res.status(500).json({
    success: false,
    message: err.message,
   })
 }

})

app.get("/users", async(req: Request, res: Response) => {
  try{
    const result = await pool.query(`SELECT * FROM users`);
    res.status(200).json({
      success: true,
      message: "users retrived successfully",
      data: result.rows
    })

  }catch(err:any){
    res.status(500).json({
      success: false,
      message: err.message,
      details: err
    })
  }
})

app.get("/users/:id", async(req: Request, res: Response) => {
  console.log(req.params);

  try{
    const result = await pool.query(`SELECT * FROM users WHERE id = $1`,[req.params.id])
    console.log(result.rows)

    if(result.rows.length === 0){
      res.status(404).json({
        success: false,
        message: "Data not found"
      })
    }
    else{
      res.status(200).json({
        success: true,
        message: "User fetch successfully",
        data: result.rows[0]
      })
    }
  }catch(err:any){
    res.status(500).json({
      success: false,
      message: err.message,
      details: err
    })
  }
})

const start = async () => {
  try {
    await initDb();
    console.log("✅ Tables ensured (users, todos)");
    app.listen(port, () => console.log(`Example app listening on port ${port}`));
  } catch (err) {
    console.error("❌ initDb failed:", err);
    process.exit(1);
  }
};

start();
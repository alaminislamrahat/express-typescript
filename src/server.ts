import express, { NextFunction, Request, Response } from "express";
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

//middle ware

const logger = (req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next()
}



app.get("/", logger,(req: Request, res: Response) => {
  res.send("Hello next level developers!");
});


//users crud

//!post route
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

//! Get route
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


//! single get  route
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

//! Update route
app.put("/users/:id", async(req: Request, res: Response) => {
  
  
  const {name, email} = req.body;

  try{
    const result = await pool.query(`UPDATE users SET name=$1, email=$2 WHERE id=$3 RETURNING *`,[name, email, req.params.id])
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
        message: "User updated successfully",
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


//? delete route
app.delete("/users/:id", async(req: Request, res: Response) => {
  console.log(req.params);

  try{
    const result = await pool.query(`DELETE FROM users WHERE id=$1`,[req.params.id])
    console.log(result.rows)

    if(result.rowCount === 0){
      res.status(404).json({
        success: false,
        message: "Data not found"
      })
    }
    else{
      res.status(200).json({
        success: true,
        message: "User deleted successfully",
        data: null
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


//todos crud
//post
app.post("/todos", async(req: Request, res: Response) => {
  const {user_id, title} = req.body;
  try{
    const result = await pool.query(`INSERT INTO todos(user_id, title) VALUES($1, $2) RETURNING *`,[user_id, title]);
    res.status(201).json({
      success: true,
      message: "Data inserted",
      data: result.rows[0]
    })
  }catch(err: any){
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
})

//get route
app.get("/todos", async(req: Request, res: Response) => {
  try{
    const result = await pool.query(`SELECT * FROM todos`);
    res.status(200).json({
      success: true,
      message: "Todos retrived successfully",
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



app.use((req: Request, res:Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path
  })
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
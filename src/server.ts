import express, { NextFunction, Request, Response } from "express";
import config from "./config";
import initDb, { pool } from "./config/db";
import logger from "./middleware/logger";
import { userRoutes } from "./modules/user/user.routes";


const app = express();
const port = config.port;

app.use(express.json());



//middle ware





app.get("/", logger,(req: Request, res: Response) => {
  res.send("Hello next level developers!");
});


//users crud

//!post route

app.use("/users", userRoutes)



//! Get route
// app.get("/users", )


//! single get  route
// app.get("/users/:id", )

//! Update route
// app.put("/users/:id", )


//? delete route
// app.delete("/users/:id", )


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
    console.log("✅ Db running :)");
    app.listen(port, () => console.log(` app listening on port ${port}`));
  } catch (err) {
    console.error("❌ initDb failed:", err);
    process.exit(1);
  }
};

start();
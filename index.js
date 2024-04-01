import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "BookNotes",
    password: "Rishabh2005",
    port: 5432,
  });
  db.connect();

  app.use(bodyParser.urlencoded({extended: true}));
  app.use(express.static("public"));

  let books = [];

  app.get("/",async(req,res)=>{
    try{
        const result = await db.query("SELECT * FROM books ORDER BY id ASC");
        books = result.rows;

        res.render("index.ejs",{
            bookItems: books,
        });
    }catch(err){
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
  });

  app.post("/add", async(req,res)=>{
    const {newTitle, newIsbn, newDescription, newRating} = req.body;
    if(!newTitle){
        return res.status(400).send("Title is required");
    }
    const parsedRating = parseInt(newRating);
    if(isNaN(parsedRating)|| parsedRating<0 || parsedRating>5){
        return res.status(400).send("Rating should be between 0 and 5");
    }

    try{
        await db.query("INSERT INTO books(title, isbn, description, rating) VALUES ($1,$2,$3,$4)",
        [newTitle, newIsbn, newDescription,newRating]);
        res.redirect("/");
    }catch(err){
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
  });

  app.get("/edit", async(req,res)=>{
    const isbnToEdit = req.query.isbn;
    try{
        const result = await db.query("SELECT * FROM books WHERE isbn = $1",[isbnToEdit]);
        const bookToEdit = result.rows[0];

        res.render("edit.ejs",{bookToEdit});
    }catch(err){
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
  })

  app.post("/delete", async(req,res)=>{
    const isbnToDel = req.body.isbn;

    try{
        await db.query("DELETE FROM books WHERE isbn = $1",[isbnToDel]);
        res.redirect("/");
    }catch(err){
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
  })

  app.listen(port,()=> {
    console.log(`The app is running on port ${port}`);
  });
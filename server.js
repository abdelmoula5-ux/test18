
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const db = new sqlite3.Database("./quiz.db");

app.use(bodyParser.json());
app.use(express.static("public"));

db.serialize(()=>{
db.run(`CREATE TABLE IF NOT EXISTS questions(
id INTEGER PRIMARY KEY AUTOINCREMENT,
question TEXT
)`)

db.run(`CREATE TABLE IF NOT EXISTS answers(
id INTEGER PRIMARY KEY AUTOINCREMENT,
question_id INTEGER,
text TEXT,
votes INTEGER DEFAULT 0
)`)
})

app.get("/api/questions",(req,res)=>{
db.all("SELECT * FROM questions",(err,questions)=>{
res.json(questions)
})
})

app.get("/api/answers/:qid",(req,res)=>{
db.all("SELECT * FROM answers WHERE question_id=?",[req.params.qid],(err,rows)=>{
res.json(rows)
})
})

app.post("/api/vote",(req,res)=>{
const id=req.body.answer_id
db.run("UPDATE answers SET votes=votes+1 WHERE id=?",[id],()=>{
io.emit("updateResults")
res.json({success:true})
})
})

app.post("/api/admin/add",(req,res)=>{
const {question,answers}=req.body

db.run("INSERT INTO questions(question) VALUES(?)",[question],function(){
const qid=this.lastID

answers.forEach(a=>{
db.run("INSERT INTO answers(question_id,text) VALUES(?,?)",[qid,a])
})

res.json({success:true})
})
})

io.on("connection",(socket)=>{
console.log("user connected")
})

const PORT=process.env.PORT || 3000
server.listen(PORT,()=>{
console.log("Server running on "+PORT)
})


const socket = io()

async function load(){

const qres = await fetch("/api/questions")
const questions = await qres.json()

const container=document.getElementById("quiz")
container.innerHTML=""

for(const q of questions){

const ares = await fetch("/api/answers/"+q.id)
const answers = await ares.json()

let html=`<div class="card"><h3>${q.question}</h3>`

answers.forEach(a=>{
html+=`<button onclick="vote(${a.id})">${a.text} (${a.votes})</button><br>`
})

html+="</div>"

container.innerHTML+=html

}

}

async function vote(id){

await fetch("/api/vote",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({answer_id:id})
})

}

socket.on("updateResults",()=>{
load()
})

load()

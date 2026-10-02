const express = require("express");
const cors = require("cors");

const app= express();
app.use(cors());
const PORT=3000;


app.get("/api/hello", (req,res)=> {
    res.json({ message: "Hello from Express!"})
});
app.get("/api/expenses", (req,res)=> {
    res.json([
        {id: 1, title:"Lunch", amount: 4.5, category:"Food", date:"2026-01-15"},
        {id: 2, title:"Bus Ticket", amount: 1.2, category:"Transport", date:"2026-01-15"}
    ]);
});
app.listen(PORT, () =>{
    console.log(`Server running at http://localhost:${PORT}`)
});


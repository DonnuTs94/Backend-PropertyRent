const express = require("express")
const cors = require("cors")
const authRoute = require("../routes/authRoute")

const PORT = process.env.PORT || 8000

const app = express()
app.use(cors())
app.use(express.json())

app.use("/public", express.static("public"))

app.use("/auth", authRoute)

app.listen(PORT, (err) => {
  console.log(`SERVER RUNING on Port ${PORT}`)
  if (err) {
    console.log(`ERROR: ${err}`)
  }
})

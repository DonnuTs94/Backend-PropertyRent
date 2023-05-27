const express = require("express")
const cors = require("cors")
const authRoute = require("../routes/authRoute")

const PORT = process.env.PORT || 8000

const app = express()
app.use(cors())
app.use(express.json())

app.use("/auth", authRoute)

app.listen(PORT, (err) => {
  if (err) {
    console.log(`ERROR: ${err}`)
  } else {
    console.log(`APP RUNING at ${PORT}`)
  }
})

const express = require('express')
const app = express()

app.use(express.static("./public/"));

const listener = app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${listener.address().port}`)
})
var path = require('path')
var express = require('express')
var app = express()

var port = 8081
app.use(express.static(path.join(__dirname, './')));

app.listen(port, function () {
  console.log('listening '+ port)
})
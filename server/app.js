var express = require('express') //basic webserver app,like bootstrap for html
var app = express() //using it as a variable
var mysql = require('mysql') //for mysql connection
var connect = require('express-myconnection') //For auto close and open of database
var cors =require('cors')
app.use(cors())
app.options('*', cors());
var config = require('./config.js')//This is not necessary but for global use this is a good pratice
var dbopt = {
    host: config.host,
    database: config.db,
    user: config.user,
    password: config.password,

}
app.use(connect(mysql, dbopt, 'pool')) //connecting the database

//body-parser extract the entire body portion of an incoming request stream and exposes it on  req.body
var bodyp = require('body-parser')
/**
 * bodyParser.urlencoded() parses the text as URL encoded data 
 * (which is how browsers tend to send form data from regular forms set to POST) 
 */
//It doesnt handle multipart forms
app.use(bodyp.urlencoded({
    extended: true
}))
//Returns middleware that only parses json and only looks at requests where the Content-Type header matches the type option
app.use(bodyp.json())

//This is important step in allowing connection between server and client
//enable CORS methods in response(res) of the server in its headers 
app.all(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,accept');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
/*  This syntax can be used if the data is set in different files ,this causes reduced loading
var index = require('./routes/index')
var users = require('./routes/users')
app.use('/', index)
app.use('/users', users)
*/

app.put('/getid', function(req, res, next) {//Obatin the field's data
//In the database ,the data is stored as a blob
//The database does it by itself(Thank God)so no encoding is required
//The blob data is typecasted as string for reading with the help of "cast(field as type)" 
//Changing the name of the obtained value will be good otherwise we will get a 
//unneccessary field name.Done with the help of "originalname as newname"
    var user = [req.body[0],req.body[1]]
    console.log(req.body)
	req.getConnection(function(error, conn) {
		conn.query("CALL insni(?,?)",user,function(err, rows, fields) {
			//if(err) throw er
			if (err) {
				console.log(err)
				res.json([{
					data: ''
				}])
			} else {
				console.log(rows[0][0].id)
				res.json({
					id: rows[0][0].id
				})
            }
        })
		})
	})


app.get('/autoc', function(req, res, next) {
		let name=req.query.name
		console.log(name)
		req.getConnection(function(error, conn) {
			conn.query("SELECT * FROM custo WHERE name LIKE '"+name+"%'",function(err, rows, fields) {
				//if(err) throw er
				if (err) {
					console.log(err)
					res.json([{
						data: ''
					}])
				} else {
					console.log(rows)
					res.json({
						data: rows
					})
				}
			})
		})
	})


app.listen(3000, () => {
    console.log("server Running successfully")
})
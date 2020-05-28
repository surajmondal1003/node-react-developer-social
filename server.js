const express=require('express');
var { mongoose } = require('./db/mongoose');
const users=require('./routes/api/users');
const profile=require('./routes/api/profile');
const posts=require('./routes/api/posts');
var bodyParser = require('body-parser');
const passport=require('passport');


const app=express();
app.use(bodyParser.urlencoded({extended:false }));
app.use(bodyParser.json());

app.use(passport.initialize());
// require('./config/passport.js')(passport);


app.get('/',(req,res)=>res.send('hello'));

app.use('/api/users',users);
app.use('/api/profile',profile);
app.use('/api/posts',posts);





const port=process.env.PORT||5000;



app.listen(port,()=>console.log(`server running on port ${port}`));
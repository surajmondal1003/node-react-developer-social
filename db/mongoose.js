var mongoose = require('mongoose');

mongoose.Promise=global.Promise;
mongoose.connect('mongodb://localhost:27017/devsocial')
.then(()=>console.log('sucess'))
.catch(()=>console.log('error'));

module.exports={mongoose};
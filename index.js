require('dotenv').config()
const request = require('request');

request.post({
    url:     process.env.UNLOCK_URI,
    form:    { UNLOCK2: "on" }},
function(err,res,body){
  if(err){
      console.log("=== ERROR ===");
      console.log(err);
      return;
  }
  if(res.statusCode !== 200 ){
      console.log(res)
      console.log(res.statusCode);
      return;
  }
  console.log("=== SUCCESS ===")
  console.log(res.statusCode);
});
const express = require('express')
const axios = require('axios')
const app = express()
var querystring = require('querystring');
const request = require('request');



var redirect_uri = 'http://localhost:5000/callback';

var client_id = '614e4ad3b1304cc6afbb6d874096cc6b';
var client_secret = 'b04f0e0c7fc74698aa3d65654ae8ad0a';


app.get('/callback', function(req, res) {

    var code = req.query.code || null;
  
    
      

    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          code: code,
          redirect_uri: redirect_uri,
          grant_type: 'authorization_code'
        },
        headers: {
          'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
        },
        json: true
      };

      request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
         
          const {access_token} = body;
          res.redirect(`https://apple-music-gvc4b9tl4-ammyy9908.vercel.app?access_token=${access_token}`)
        }
      });

      


      



    
  });



app.get('/login', function(req, res) {
  var scope = 'user-read-private user-read-email user-read-currently-playing streaming user-read-recently-played';

  res.redirect('https://accounts.spotify.com/authorize?' +
  querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      
    }));
});


const PORT = process.env.PORT | 5000;
app.listen(PORT,()=>{
    console.log(`listening at ${PORT}`)
})
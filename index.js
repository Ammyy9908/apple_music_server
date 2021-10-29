const express = require('express')
const axios = require('axios')
const app = express()
var querystring = require('querystring');
const request = require('request');



var redirect_uri = 'https://apple-server.herokuapp.com/callback';

var client_id = '614e4ad3b1304cc6afbb6d874096cc6b';
var client_secret = 'b04f0e0c7fc74698aa3d65654ae8ad0a';



app.get('/',async (req,res)=>{
    res.redirect('/login')
})
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
          res.redirect(`https://apple-music-alpha.vercel.app?access_token=${access_token}`)
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




var server_port = process.env.YOUR_PORT || process.env.PORT || 80;
var server_host = process.env.YOUR_HOST || '0.0.0.0';
app.listen(server_port, server_host, function() {
    console.log('Listening on port %d', server_port);
});
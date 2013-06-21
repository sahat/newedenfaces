// app.post('/api/feedback', function(req, res) {
//   var sendgrid = new SendGrid(config.sendgrid_user, config.sendgrid_key);
//   var characterName = req.body.characterName;
//   var message = req.body.message;
//   var uiRating = req.body.uiRating;
//   var text = 'From: ' + characterName + '.' + 'User Interface: ' +
//               uiRating + '.' + 'Message: ' + message + '.';
  
//   sendgrid.send({
//     to: 'sakhat@gmail.com',
//     from: 'aura@neweden.com',
//     subject: 'Site Feedback',
//     text: text
//   }, function(success, message) {
//     if (!success) {
//       console.log(message);
//     }
//     res.send('Email has been sent successfully');
//   });
// });


// app.put('/api/winner/:characterId', function(req, res) {
//   Character.update({ characterId: req.params.characterId }, { $inc: { wins: 1 } }, function(err) {
//     if (err) {
//       return res.send(500, err);
//     }
//     //console.log('incrementing win count');
//     res.send(200);
//   });
  
// });

// app.put('/api/loser/:characterId', function(req, res) {
//   Character.update({ characterId: req.params.characterId }, { $inc: { losses: 1 } }, function(err) {
//     if (err) return res.send(500, err);
//     console.log('incrementing loss count');
//     res.send(200);
//   });
  
// });
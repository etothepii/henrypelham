var db = require('./frederickNorthDBRaw');

exports.connect = function(after) {
  db.connect(after);
}

exports.getWatching = function(email, after) {
  console.log("Getting Watching");
  db.Person.find({ EMAIL: email }, function (err, person) {
    if (err) {
      after (err, null);
    }
    else {
      db.BoundedArea.find({ 
        PARENT: null,
        OWNER: person.ID
      }, function (err, routeAreas) {
        after(err, routeAreas)
      });  
    }
  });
}

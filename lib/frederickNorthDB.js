var db = require('./frederickNorthDBRaw');

exports.connect = function(after) {
  db.connect(after);
}

exports.getWatching = function(email, after) {
  console.log("Getting Watching for %s", email);
  db.Person.find({ EMAIL: email }, function (err, person) {
    if (err) {
      console.error("Error finding person");
      after (err, null);
    }
    else if (person.length == 0) {
      after ("No people found for " + email);
    }
    else {
      console.log("Found matching people %d", person.length);
      db.BoundedArea.find({ 
        PARENT: null,
        OWNER: person.ID
      }, function (err, routeAreas) {
        after(err, routeAreas)
      });  
    }
  });
}

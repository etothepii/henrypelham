var db = require('./frederickNorthDBRaw');

exports.connect = function(after) {
  db.connect(after);
}

exports.getWatching = function(googleId, after) {
  console.log("Getting Watching for %s", googleId);
  db.Person.find({ GOOGLE_ID: googleId }, function (err, person) {
    if (err) {
      console.error("Error finding person");
      return after (err, null);
    }
    else if (person.length == 0) {
      return after ("No people found for " + googleId);
    }
    else {
      console.log("Found matching people %d", person.length);
      console.log("The person[0].ID = %s", person[0].ID);
      db.BoundedArea.find({ OWNER: person[0].ID }).where("PARENT IS NULL", 
      function(err, boundedAreas) {
        console.log("Found %d BoundedAreas", boundedAreas.length);
        if (err) {
          return after(err, null);
        }
        return fillBoundedArea(boundedAreas, 0, function(err) {
          console.log("Executing final piece which should involve rendering the page");
          fillRouteSizes(boundedAreas);
          return after(err, boundedAreas);
        });
      });  
    }
  });
}

function fillRouteSizes(boundedAreas) {
  var routeIds = [];
  getRouteIds(boundedAreas, routeIds);
}

function getRouteIds(boundedAreas, routeIds) {
  for (var index = 0; index < boundedAreas.length; index++) {
    var boundedArea = boundedAreas[index];
    for (var routeIndex = 0; routeIndex < boundedArea.routes.length; routeIndex++) {
      routeIds.push(boundedArea.routes[routeIndex].ID);
      getRouteIds(boundedArea.children, routeIds);
    }
  }
}

function fillBoundedArea(boundedAreas, index, after, err) {
  if (boundedAreas.length == index) {
    console.log("Ended with index: %d", index);
    return after(err);
  }
  console.log("BoundedArea: %d", index);
  boundedAreas[index].getRoutes(function(err, routes) {
    boundedAreas[index].routes = routes;
    boundedAreas[index].getChildren(function(err, children) {
      if (err) {
        return after(err);
      }
      console.log("%s has %d children", boundedAreas[index].NAME, children.length);
      boundedAreas[index].children = children;
      return fillBoundedArea(children, 0, function(err) {
        return fillBoundedArea(boundedAreas, index + 1, after, err);
      });  
    });
  });
}

var db = require('./frederickNorthDBRaw');

exports.connect = function(after) {
  db.connect(after);
}

exports.getWatching = function(googleId, leafletId, after) {
  console.log("Getting Watching for %s with %s", googleId, leafletId);
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
          fillRouteSizes(boundedAreas, function(err) {
            console.log("LeafletId: %s", leafletId);
            if (leafletId) {
              return addLeafletMaps(boundedAreas, leafletId, after)
            }
            after(err, boundedAreas);
          });
        });
      });
    }
  });
}

addLeafletMaps = function(boundedAreas, leafletId, after) {
  var routeIds = getRouteIds(boundedAreas, []);
  db.LeafletMap.find({ROUTE: routeIds, LEAFLET: leafletId}, function(err, leafletMaps) {
    var leafletMapsByRouteMap = leafletMapsAsMap(leafletMaps);
    for (var index = 0; index < boundedAreas.length; index++) {
      matchLeafletMaps(boundedAreas[index], leafletMapsByRouteMap);
    }
    after(null, boundedAreas);
  });
}

function matchLeafletMaps(boundedArea, leafletMapByRoute) {
  var deliveryStatus = {complete: 0, remaining: 0};
  for (var index = 0; index < boundedArea.children.length; index++) {
    var child = boundedArea.children[index];
    matchLeafletMaps(child, leafletMapByRoute);
    if (child.deliveryStatus.complete + child.deliveryStatus.remaining == 0) {
      boundedArea.children.splice(index--,1);
    }
    else {
      deliveryStatus.complete += child.deliveryStatus.complete;
      deliveryStatus.remaining += child.deliveryStatus.remaining;
    }
  }
  for (var index = 0; index < boundedArea.routes.length; index++) {
    var route = boundedArea.routes[index];
    var leafletMap = leafletMapByRoute[route.ID];
    if (leafletMap) {
      if (leafletMap.DELIVERED) {
        deliveryStatus.complete += route.size;
      }
      else {
        deliveryStatus.remaining += route.size;
      }
      route.leafletMap = leafletMap;
    }
    else {
      boundedArea.routes.splice(index--, 1);
    }
  }
  boundedArea.deliveryStatus = deliveryStatus;
}

function leafletMapsAsMap(leafletMaps) {
  var map = [];
  for (var index = 0; index < leafletMaps.length; index++) {
    var leafletMap = leafletMaps[index];
    map[leafletMap.ROUTE] = leafletMap;
  }
  return map;
}

exports.getLeaflets = function(googleId, after) {
  exports.getWatching(googleId, null, function(err, boundedAreas) {
    var routeIds = getRouteIds(boundedAreas, []);
    db.LeafletMap.aggregate(["LEAFLET"], {ROUTE: routeIds}).count().groupBy("LEAFLET").get(
      function(err, counts) {
        if (err) {
          return after(err);
        }
        var leaflets = [];
        for (var index = 0; index < counts.length; index++) {
          leaflets.push(counts[index].LEAFLET);
        }
        db.Leaflet.find({ID: leaflets}, after);
      });
  });
}

exports.getLeafletMapAndMarkAsDelivered = function(leafletMapId, after) {
  db.LeafletMap.get(leafletMapId, function(err, leafletMap) {
    if (err) {
      return after(err, null);
    }
    leafletMap.DELIVERED = new Date();
      leafletMap.save(function(err) {
      if (err) {
        return after(err, null);
      }
      db.Leaflet.get(leafletMap.LEAFLET, function(err, leaflet) {
        if (err) {
          return after(err, null);
        }
        db.Route.get(leafletMap.ROUTE, function(err, route) {
          if (err) {
            return after(err, null);
          }
          leafletMap.leaflet = leaflet;
          leafletMap.route = route;
          return after(err, leafletMap);
        });
      });
    });
  });
}

function fillRouteSizes(boundedAreas, after) {
  var routeIds = getRouteIds(boundedAreas, []);
  db.RouteMember.aggregate(["ROUTE"], {ROUTE: routeIds}).count().groupBy("ROUTE").get(
    function (err, stats) {
      if (err) {
        return after(err);
      }
      var routeSizes = [];
      for (var index = 0; index < stats.length; index++) {
        var stat = stats[index];
        routeSizes[stat.ROUTE] = stat.count;
      }
      matchRouteSizes(boundedAreas, routeSizes);
      after(err)
    });
}

function matchRouteSizes(boundedAreas, routeSizes) {
  for (var index = 0; index < boundedAreas.length; index++) {
    var boundedArea = boundedAreas[index];
    for (var routeIndex = 0; routeIndex < boundedArea.routes.length; routeIndex++) {
      var route = boundedArea.routes[routeIndex];
      route.size = routeSizes[route.ID];
    }
    matchRouteSizes(boundedArea.children, routeSizes);
  }
}

function getRouteIds(boundedAreas, routeIds) {
  for (var index = 0; index < boundedAreas.length; index++) {
    var boundedArea = boundedAreas[index];
    for (var routeIndex = 0; routeIndex < boundedArea.routes.length; routeIndex++) {
      routeIds.push(boundedArea.routes[routeIndex].ID);
    }
    getRouteIds(boundedArea.children, routeIds);
  }
  return routeIds
}

function fillBoundedArea(boundedAreas, index, after, err) {
  if (boundedAreas.length == index) {
    console.log("Ended with index: %d", index);
    return after(err);
  }
  console.log("BoundedArea: %d", index);
  boundedAreas[index].getRoutes().orderRaw("TRIM(NAME)").run(function(err, routes) {
    boundedAreas[index].routes = routes;
    boundedAreas[index].getChildren().order("NAME").run(function(err, children) {
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

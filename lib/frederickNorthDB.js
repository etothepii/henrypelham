var orm = require("orm");

exports.connect = function (fs, after) {
  var password;
  password = process.env.FREDNORTH_DB_PASSWORD;
  connectToDatabase(password, orm);
  after();
}

function connectToDatabase(password, orm) {
  orm.connect("mysql://" + process.env.FREDNORTH_DB_USERNAME + ":" + password + "@localhost/" + process.env.DATABASE, function (err, db) {
    if (err) throw err;
    buildORM(db);
  });
}

var classification;
var deliveryPointAddress;
var bLPU;
var route;
var routeMember;
var person;
var leafletMap;
var leaflet;
var users;
var groups;
var groupMembers;
var boundedArea;


function buildORM(db) {
  classification = db.define("Classification", {
    UPRN: Number,
    RECORD_IDENTIFIER: Number,
    CHANGE_TYPE: String,
    PRO_ORDER: Number,
    CLASS_KEY: String,
    CLASSIFICATION_CODE: String,
    CLASS_SCHEME: String,
    SCHEMA_VERSION: Number,
    START_DATE: Date,
    END_DATE: Date,
    LAST_UPDATE_DATE: Date
  },{
    UPRN: Number
  });
  exports.Classification = classification;
  deliveryPointAddress = db.define("DeliveryPointAddress", {
    UPRN: Number,
    RECORD_IDENTIFIER: Number,
    CHANGE_TYPE: String,
    PRO_ORDER: Number,
    PARENT_ADDRESSABLE_UPRN: Number,
    RM_UDPRN: Number,
    ORGANISATION_NAME: String,
    DEPARTMENT_NAME: String,
    SUB_BUILDING_NAME: String,
    BUILDING_NAME: String,
    BUILDING_NUMBER: Number,
    DEPENDENT_THOROUGHFARE_NAME: String,
    THOROUGHFARE_NAME: String,
    DOUBLE_DEPENDENT_LOCALITY: String,
    DEPENDENT_LOCALITY: String,
    POST_TOWN: String,
    POSTCODE: String,
    POSTCODE_TYPE: String,
    WELSH_DEPENDENT_THOROUGHFARE_NAME: String,
    WELSH_THOROUGHFARE_NAME: String,
    WELSH_DOUBLE_DEPENDENT_LOCALITY: String,
    WELSH_DEPENDENT_LOCALITY: String,
    WELSH_POST_TOWN: String,
    PO_BOX_NUMBER: String,
    PROCESS_DATE: Date,
    START_DATE: Date,
    END_DATE: Date,
    LAST_UPDATE_DATE: Date,
    ENTRY_DATE: Date
  },{
    UPRN: Number
  });
  exports.DeliveryPointAddress = deliveryPointAddress;
  bLPU = db.define("BLPU", {
    UPRN: Number,
    RECORD_IDENTIFIER: Number,
    CHANGE_TYPE: String,
    PRO_ORDER: Number,
    LOGICAL_STATUS: Number,
    BLPU_STATE: Number,
    BLPU_STATE_DATE: Date,
    PARENT_UPRN: Number,
    X_COORDINATE: Number,
    Y_COORDINATE: Number,
    RPC: Number,
    LOCAL_CUSTODIAN_CODE: Number,
    START_DATE: Date,
    END_DATE: Date,
    LAST_UPDATE_DATE: Date,
    ENTRY_DATE: Date,
    POSTAL_ADDRESS: String,
    POSTCODE_LOCATOR: String,
    MULTI_OCC_COUNT: Number
  },{
    UPRN: Number
  });
  exports.BLPU = bLPU;
  route = db.define("Route", {
    ID: String,
    NAME: String,
    BOUNDED_AREA: String,
    OWNER: Number,
    OWNER_GROUP: Number,
    DELIVERED_BY: Number,
    BOUNDARY: Buffer
  },{
    ID: String
  });
  exports.Route = route;
  routeMember = db.define("RouteMember", {
    ID: String,
    ROUTE: String,
    UPRN: Number
  },{
    ID: String
  });
  exports.RouteMember = routeMember;
  person = db.define("Person", {
    ID: Number,
    SURNAME: String,
    OTHER_NAMES: String,
    TITLE: String,
    MAIN_CONTACT_NUMBER: String,
    DELIVERY_ADDRESS: String,
    EMAIL: String
  },{
    ID: Number
  });
  exports.Person = person;
  leafletMap = db.define("LeafletMap", {
    ID: String,
    LEAFLET: String,
    ROUTE: String,
    DELIVERED: Date,
    DELIVERED_BY: Number
  },{
    ID: String
  });
  exports.LeafletMap = leafletMap;
  leaflet = db.define("Leaflet", {
    ID: String,
    DELIVERY_COMMENCED: Date,
    TITLE: String,
    DESCRIPTION: String
  },{
    ID: String
  });
  exports.Leaflet = leaflet;
  users = db.define("Users", {
    ID: Number,
    EMAIL: String,
    PERSON: Number
  },{
    ID: Number
  });
  exports.Users = users;
  groups = db.define("Groups", {
    ID: Number
  },{
    ID: Number
  });
  exports.Groups = groups;
  groupMembers = db.define("GroupMembers", {
    ID: Number,
    GROUP: Number,
    MEMBER: Number,
    GROUP_MEMBER: Number
  },{
    ID: Number
  });
  exports.GroupMembers = groupMembers;
  boundedArea = db.define("BoundedArea", {
    ID: String,
    PARENT: String,
    OWNER: Number,
    OWNER_GROUP: Number,
    NAME: String,
    BOUNDARY: Buffer
  },{
    ID: String
  });
  exports.BoundedArea = boundedArea;
}

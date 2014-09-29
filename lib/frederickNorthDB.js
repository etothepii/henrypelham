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

var agent;
var user;
var pollingArea;
var overseeing;
var candidate;
var tally;
var count;
var politicalParty;

function buildORM(db) {
  agent = db.define("Agent", {
    ID: Number,
    EMAIL: String
  },{
    id: "ID"
  });
  exports.Agent = agent;
  user = db.define("User", {
    ID: Number,
    EMAIL: String
  },
  {
    id: "ID"
  });
  exports.User = user;
  registeredDevice = db.define("RegisteredDevice", {
    ID: Number,
    USER: Number,
    DEVICE_IDENTIFIER: String
  },
  {
    id: "ID"
  });
  exports.RegisteredDevices = registeredDevice;
  pollingArea = db.define("PollingArea", {
    ID: Number,
    NAME: String,
    CHILD_TYPE: String,
    PARENT: Number
  },
  {
    id: "ID"
  });
  exports.PollingArea = pollingArea;
  pollingArea.hasOne("parent", pollingArea, {field:"PARENT", reverse:"children"});
  overseeing = db.define("Overseeing", {
    ID: Number,
    AGENT: Number,
    USER: Number,
    POLLING_AREA: Number
  },
  {
    id: "ID"
  });
  exports.Overseeing = overseeing;
  overseeing.hasOne("pollingArea", pollingArea, {field:"POLLING_AREA"});
  overseeing.hasOne("agent", agent, {field:"AGENT", reverse:"watching"});
  count = db.define("Count", {
    ID: String,
    DEVICE_IDENTIFIER: Number,
    POLLING_AREA: Number,
    VOTES_CAST: Number,
    BALLOT_BOX: String
  },
  {
    id: "ID"
  });
  exports.Count = count;
  count.hasOne("deviceIdentifier", registeredDevice, {field:"DEVICE_IDENTIFIER", reverse:"counts"});
  count.hasOne("pollingArea", pollingArea, {field:"POLLING_AREA", reverse:"counts"});
  politicalParty = db.define("PoliticalParty", {
    ID: Number,
    NAME: String,
    MAJOR: Boolean,
    COLOUR: String,
    LOGO_REF: String
  },
  {
    id: "ID"
  });
  exports.PoliticalParty = politicalParty;
  candidate = db.define("Candidate", {
    ID: Number,
    SURNAME: String,
    OTHER_NAMES: String,
    PARTY: Number,
    ELECTION_AREA: Number,
    DISPLAYABLE: Boolean,
    ORDER: Number
  },
  {
    id: "ID"
  });
  candidate.hasOne("party", politicalParty, {field:"PARTY", reverse:"candidates"});
  candidate.hasOne("electionArea", pollingArea, {field:"ELECTION_AREA", reverse:"candidates"});
  exports.Candidate = candidate;
  tally = db.define("Tally", {
    ID: Number,
    CANDIDATE: Number,
    PARTY: Number,
    COUNT: String,
    VOTES: Number
  },
  {
    id: "ID"
  });
  exports.Tally = tally;
  tally.hasOne("candidate", candidate, {field:"CANDIDATE", reverse:"tallies"});
  tally.hasOne("party", politicalParty, {field:"PARTY"});
  tally.hasOne("count", count, {field:"COUNT", reverse:"tallies"});
}

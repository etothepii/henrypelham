var db = require('./frederickNorthDBRaw');

exports.connect = function(after) {
  db.connect(after);
}

exports.details = function(email) {
  return { 
    ID: 1,
    SURNAME: "Robinson",
    OTHER_NAMES: "James Philip",
    TITLE: "Mr",
    MAIN_CONTACT_NUMBER: "07813 875 460",
    DELIVERY_ADDRESS: "40 Westcott House, East India Dock Road, London E14 0DG",
    EMAIL: "james.robinson@epii.co.uk"
  }  
}

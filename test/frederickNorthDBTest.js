var expect = require("chai").expect
var db = require("../lib/frederickNorthDB");
describe("frederickNorthDB", function() {
  describe("#getLeaflets", function() {
    it('should return precisely one leaflet entry from the test database', function(done) {
      db.connect(function() {
        db.getLeaflets(100274569354905081446, function(err, leaflets) {
          expect(err).to.equal(null);
          expect(leaflets.length).to.equal(1);
          expect(leaflets[0].ID).to.equal("78bb9ca9-1c5c-474d-b02e-14d698eef0f7");
          done();
        });
      });
    });
  });
});

var async = require("async");
var minimist = require("minimist");

var database = require("./database");
var api = require("./brooks");

var args = minimist(process.argv.slice(2));

var player = args.player || "433587";

var crash = function(err) {
  console.log(err);
  database.close();
  process.exit();
}

api.getGamesByPlayer(player, function(err, games) {
  if (err) crash(err);
  async.each(games, function(game, done) {
    api.getPitches(game, player, function(err, pitches) {
      async.each(pitches, database.addPitch, function() {
        console.log("Finished saving game", game.id);
        done();
      });
    });
  }, function(err) {
    if (err) console.log(err);
    database.close();
    console.log("all done!");
  });
});
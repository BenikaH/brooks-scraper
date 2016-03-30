var async = require("async");
var cheerio = require("cheerio");
var request = require("request");
var qs = require("querystring");
var url = require("url");

var columns = require("./columns");

const BASE_URL = "http://www.brooksbaseball.net/"
// game list: tabs.php?player=433587&var=gl
// pitch table: pfxVB/tabdel_expanded.php?pitchSel=433587&game=gid_2008_04_06_seamlb_balmlb_1/&s_type=3&h_size=700&v_size=500

var getGamesByPlayer = function(playerID, callback) {
  var src = BASE_URL + `tabs.php?var=gl&player=${playerID}`;
  request(src, function(err, response, body) {
    if (err || response.statusCode >= 400) {
      return callback(err || response.statusMessage);
    }
    var $ = cheerio.load(body);
    var links = $(`a[href*="pfx.php?s_type"]`).toArray()
    var games = links.map(function(link) {
      var parsed = url.parse(link.attribs.href);
      var query = qs.parse(parsed.query);
      return {
        id: query.game.replace(/\/$/, ""),
        year: query.year,
        month: query.month,
        day: query.day
      }
    });
    callback(null, games);
  });
};

var getPitches = function(game, pitcher, callback) {
  var q = qs.stringify({
    game: game.id + "/",
    pitchSel: pitcher,
    s_type: 3,
    h_size: 700,
    v_size: 500
  });
  var src = BASE_URL + "/pfxVB/tabdel_expanded.php?" + q;
  request(src, function(err, response, body) {
    if (err || response.statusCode >= 400) {
      return callback(err || response.statusMessage);
    }
    var $ = cheerio.load(body);
    var headers = $("th").toArray().map(el => $(el).text());
    var rows = $("tr").has("td").toArray();
    var result = rows.map(function(row) {
      var cells = $(row).find("td").toArray().map(el => $(el).text());
      var data = {};
      cells.forEach(function(value, i) {
        var key = headers[i];
        key = columns.remap[key] || key;
        var type = columns.types[key];
        switch (type) {
          case "integer":
            value = parseInt(value, 10);
            break;

          case "numeric":
          case "double precision":
            value = parseFloat(value, 10);
            break;

          case "boolean":
            //do something?
            break;

          case "date":
            var dateParts = value.split("-").map(v => parseInt(v, 10));
            value = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
        }
        if (typeof value == "number" && isNaN(value)) value = null;
        data[key] = value;
      });
      data.game = game.id;
      return data;
    });
    callback(null, result);
  });
};

module.exports = { getGamesByPlayer, getPitches };
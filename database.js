var async = require("async");
var pg = require("pg");
pg.defaults.parseInt8 = true;
var creds = require("./creds.json")
var database = new pg.Client(creds);
database.connect();

var verbose = process.argv.some(a => a.match(/--verbose|-v$/));

log = function() {
  if (verbose) console.log.apply(console, arguments);
}

var SQL = function(parts) {
  var values = [];
  for (var i = 1; i < arguments.length; i++) values.push(arguments[i]);
  return {
    text: parts.reduce((prev, current, i) => prev + "$" + i + current),
    values
  }
};

var addPitch = function(pitch, callback) {
  var query = SQL`
INSERT INTO pitches (
    date, game, sv_id, play, ab_total, ab_count,
    pitcher, batter, at_bat, result, result_type,
    id, sz_top, sz_bottom, pfx_xdata, pfx_zdata,
    pitch_type, zone, pitch_confidence, batter_handed,
    strikes, balls, pitcher_handed, pitch_description,
    spin, norm_ht, pitcher_team, inning, t_start,
    vy_start, f_time, pfx_x, pfx_z, uncorrected_pfx_x, uncorrected_pfx_z,
    x0, y0, z0, vx0, vy0, vz0,
    ax, ay, az, start_speed,
    px, pz, px_old, pz_old, sb
  ) VALUES (
    ${pitch.date}, ${pitch.game}, ${pitch.sv_id}, ${pitch.play}, ${pitch.ab_total}, ${pitch.ab_count},
    ${pitch.pitcher}, ${pitch.batter}, ${pitch.at_bat}, ${pitch.result}, ${pitch.result_type},
    ${pitch.id}, ${pitch.sz_top}, ${pitch.sz_bottom}, ${pitch.pfx_xdata}, ${pitch.pfx_zdata},
    ${pitch.pitch_type}, ${pitch.zone}, ${pitch.pitch_confidence}, ${pitch.batter_handed},
    ${pitch.strikes}, ${pitch.balls}, ${pitch.pitcher_handed}, ${pitch.pitch_description},
    ${pitch.spin}, ${pitch.norm_ht}, ${pitch.pitcher_team}, ${pitch.inning}, ${pitch.t_start},
    ${pitch.vy_start}, ${pitch.f_time}, ${pitch.pfx_x}, ${pitch.pfx_z}, ${pitch.uncorrected_pfx_x}, ${pitch.uncorrected_pfx_z},
    ${pitch.x0}, ${pitch.y0}, ${pitch.z0}, ${pitch.vx0}, ${pitch.vy0}, ${pitch.vz0},
    ${pitch.ax}, ${pitch.ay}, ${pitch.az}, ${pitch.start_speed},
    ${pitch.px}, ${pitch.pz}, ${pitch.px_old}, ${pitch.pz_old}, ${pitch.sb}
  );
  `;
  database.query(query, callback);
};

var close = () => database.end();

module.exports = {
  addPitch,
  close
}
import momentTZ from "moment-timezone";

console.log(
  "npm:moment-timezone",
  // https://www.npmjs.com/package/moment-timezone
  momentTZ("2014-06-01T12:00:00Z").tz("America/Los_Angeles").format("ha z") ===
    "5am PDT",
);

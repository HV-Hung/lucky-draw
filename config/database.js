var sqlite3 = require("sqlite3").verbose();
var md5 = require("md5");

const DBSOURCE = "./database/db.sqlite";

let db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    // Cannot open database
    console.error(err.message);
    throw err;
  } else {
    console.log("Connected to the SQLite database.");
    db.run(
      `
        CREATE TABLE user (
            id text PRIMARY KEY ,
            name text, 
            email text UNIQUE,  
            company_id UNIQUE,
            lucky_number integer UNIQUE,
            qr_code text,
            last_check_in text
            ) 
          `,
      (err) => {
        if (err) {
          // Table already created
        } else {
          // Table just created, creating some rows
        }
      }
    );
  }
});

module.exports = db;

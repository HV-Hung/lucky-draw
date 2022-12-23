const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const short = require("short-uuid");
const db = require("../config/database");
const XLSX = require("xlsx");
var fs = require("fs");

const createUser = asyncHandler(async (req, res) => {
  const { email, name, company_id } = req.body;
  if (!email || !name || !company_id)
    return res.status(400).json("email, name, company_id are required!");

  const code = short.generate();
  const qr_code = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${code}`;

  db.serialize(() => {
    db.get("select * from user where email = ?", email, (err, user) => {
      if (user) {
        req.flash("error", "Email already exists");
        res.redirect("/user");
      } else {
        db.get(
          "select * from user where company_id = ?",
          company_id,
          (err, user) => {
            if (user) {
              req.flash("error", "Company already exists");
              res.redirect("/user");
            } else {
              db.run(
                `INSERT INTO user(id,email,name,company_id,qr_code) VALUES(?,?,?,?,?)`,
                [code, email, name, company_id, qr_code],
                function (err) {
                  if (err) {
                    req.flash("error", err.message);
                  }
                  res.redirect("/user");
                }
              );
            }
          }
        );
      }
    });
  });
});
const importUser = (req, res) => {
  // console.log(req.file);
  var workbook = XLSX.readFile(req.file.path);
  var sheet_name_list = workbook.SheetNames;
  const users = XLSX.utils
    .sheet_to_json(workbook.Sheets[sheet_name_list[0]])
    .map((user) => {
      const code = short.generate();
      const qr_code = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${code}`;

      return Object.values({
        ...user,
        qr_code,
        code,
      });
    });

  let sql =
    "INSERT INTO user(name, email,company_id, qr_code, id) VALUES " +
    users
      .map((item) => {
        const itemc = item.map((item2) => {
          return `"${item2}"`;
        });
        return `( ${itemc.toString()} )`;
      })
      .toString();

  db.run(sql, (err) => {
    if (err) {
      req.flash("error", "Email and company id must be unique");
    }
    res.redirect("/user");
  });

  fs.unlinkSync(req.file.path);
};
const getAllUsers = asyncHandler(async (req, res) => {
  var sql = "select * from user";
  var params = [];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ importError: err.message });
      return;
    }
    res.json({
      message: "success",
      data: rows,
    });
  });
});
const getOneUser = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const user = await User.findById(id);
  if (!user) return res.status(400).json({ message: "No users found" });
  res.json(user);
});

const updateUser = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const { email, name, company_id } = req.body;
  if (!email || !name || !company_id)
    return res.status(400).json("email, name, company_id are required!");

  const user = await User.findById(id);
  if (!user) return res.status(400).json({ message: "user not found" });
  user.name = name;
  user.email = email;
  user.company_id = company_id;
  await user.save();
  res.json({ message: `${name} updated` });
});

const deleteUser = asyncHandler(async (req, res) => {
  const id = req.body.id;

  db.run("DELETE FROM user WHERE id = ?", id, function (err) {
    if (err) {
      res.redirect("/user");
    }
    res.redirect("/user");
  });
});
const userCheckIn = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const maxNumberOfUsers = 999;
  let luckyNumber = Math.floor(Math.random() * maxNumberOfUsers) + 1;
  const date = new Date().toLocaleString();

  db.serialize(() => {
    db.get("select * from user where id = ?", id, (err, user) => {
      if (!user) {
        return res.status(400).json("no user found");
      } else if (user.lucky_number) {
        db.run(
          `UPDATE user set  last_check_in= ? where id = ?`,
          [date, id],
          (err) => {
            if (err) {
              return console.error(err.message);
            }else {
              db.get(
                "select * from user where id = ?",
                id,
                (err, user) => {
                  res.status(200).json(user);
                }
              );
            }
          }
        );
      } else {
        db.serialize(() => {
          db.all(
            "select lucky_number from user where lucky_number IS not NULL ",
            [],
            (err, users) => {
              if (err) {
                return console.error(err.message);
              }
              console.log({ users });
              if (users.length > 0) {
                while (
                  users.filter((user) => user.lucky_number == luckyNumber)
                    .length > 0
                ) {
                  luckyNumber =
                    Math.floor(Math.random() * maxNumberOfUsers) + 1;
                }
              }
            }
          );
        });
        db.serialize(() => {
          db.run(
            `UPDATE user set lucky_number = ?, last_check_in= ? where id = ?`,
            [luckyNumber, date, id],
            (err) => {
              if (err) {
                return console.error(err.message);
              } else {
                db.get(
                  "select * from user where id = ?",
                  id,
                  (err, user) => {
                    res.status(200).json(user);
                  }
                );
              }
            }
          );
        });
      }
    });
  });
});
const drawLuckyNumber = asyncHandler(async (req, res) => {
  db.serialize(() => {
    db.all(
      "select * from user where lucky_number IS not NULL ",
      [],
      (err, users) => {
        if (err) {
          return console.error(err.message);
        }
        if (users.length > 0) {
          const luckyUser = users[Math.floor(Math.random() * users.length)];
          res.json(luckyUser);
        } else res.json("no user");
      }
    );
  });
});

module.exports = {
  createUser,
  getAllUsers,
  getOneUser,
  updateUser,
  deleteUser,
  userCheckIn,
  drawLuckyNumber,
  importUser,
};

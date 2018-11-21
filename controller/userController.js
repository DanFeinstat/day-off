const db = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

module.exports = {
  findAll: function(req, res) {
    db.Users.find(req.query)
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
  },
  create: function(req, res) {
    db.Users.create(req.body)
      .then(user => {
        const spellbookJwt = jwt.sign(
          { _id: req.body._id },
          process.env.SECRET
        );

        res.status(200).send({ userID: user.id, spellbookJwt }); //probably going to need to add a route for finding a specific user
      })
      .catch(err => res.status(422).json(err));
  },

  deleteUser: function(req, res) {
    db.Users.deleteOne({ _id: req.params.id })
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
  },

  addSpell: (req, res) => {
    db.Users.updateOne(
      { _id: req.params.id },
      {
        $push: {
          spells: [req.body],
        },
      }
    )
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
  },

  getSpells: function(req, res) {
    // console.log(req.body);
    db.Users.findOne({ _id: req.params.id })
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(422).json(err));
  },

  getUser: function(req, res) {
    db.Users.findOne({ _id: req.params.id })
      .then(user => res.status(200).send(user))
      .catch(err => res.status(404).send(err));
  },
  login: function(req, res) {
    // db.Users.findOne({ email: req.body.email })
    //   .then(user => {
    //     var passwordResult = bcrypt.compareSync(
    //       req.body.password,
    //       user.password
    //     );

    //     if (passwordResult) {
    //       const spellbookJwt = jwt.sign({ id: user._id }, process.env.SECRET);
    //       res.status(200).send({ spellbookJwt, user });
    //     } else {
    //       res.status(404).send({ message: "Incorrect Password" });
    //     }
    //   })
    //   .catch(() =>
    //     res.status(400).send({ message: "Could not find your email" })
    //   );
    db.Users.findOne({ email: req.body.email })
      .then(dbModel => {
        var passwordResult = bcrypt.compare(
          req.body.password,
          dbModel.password
        );

        if (passwordResult) {
          const spellbookJwt = jwt.sign(
            { id: dbModel._id },
            process.env.SECRET
          );
          res.status(200).send({ spellbookJwt, dbModel });
        } else {
          res.status(404).send({ message: "Incorrect Password" });
        }
      })
      .catch(err => res.status(422).json({ message: "Still not working" }));
  },
};
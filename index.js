const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.gknwl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const informationCollection = client
      .db("backend")
      .collection("informations");

    // add bulk informations
    app.post("/informationBulk", async (req, res) => {
      const informations = req.body;
      const options = { ordered: true };
      const result = await informationCollection.insertMany(
        informations,
        options
      );
      res.send(result);
    });

    // get number of entries for creating pages for pagination
    // app.get("/informationCount", async (req, res) => {
    //   const count = await informationCollection.estimatedDocumentCount();
    //   res.send({ count });
    // });
    app.get("/informationCount", async (req, res) => {
      const type = req.query.type;
      const input = req.query.input;
      let informations;
      if (type === "name") {
        informations = await informationCollection
          .find({ name: { $regex: input, $options: "i" } })
          .toArray();
      } else if (type === "position") {
        informations = await informationCollection
          .find({ position: { $regex: input, $options: "i" } })
          .toArray();
      } else {
        informations = await informationCollection
          .find({ office: { $regex: input, $options: "i" } })
          .toArray();
      }
      res.send({ informations });
    });

    app.get("/informationBulk", async (req, res) => {
      const page = parseInt(req.query.page);
      const count = parseInt(req.query.size);
      const type = req.query.type;
      const input = req.query.input;
      let mysort = { name: 1 };
      let informations;

      if (type === "name") {
        informations = await informationCollection
          .find({ name: { $regex: input, $options: "i" } })
          .sort(mysort)
          .skip(page * count)
          .limit(count)
          .toArray();
      } else if (type === "position") {
        informations = await informationCollection
          .find({ position: { $regex: input, $options: "i" } })
          .sort(mysort)
          .skip(page * count)
          .limit(count)
          .toArray();
      } else {
        informations = await informationCollection
          .find({ office: { $regex: input, $options: "i" } })
          .sort(mysort)
          .skip(page * count)
          .limit(count)
          .toArray();
      }

      //   if (page || count) {
      //     informations = await informationCollection
      //       .find()
      //       .sort(mysort)
      //       .skip(page * count)
      //       .limit(count)
      //       .toArray();
      //   } else {
      //     informations = await informationCollection
      //       .find()
      //       .sort(mysort)
      //       .toArray();
      //   }

      res.send(informations);
    });

    // // get result
    // app.get("/informationSearch", async (req, res) => {
    //   const type = req.query.type;
    //   const input = req.query.input;
    //   let informations;
    //   if (type === "name") {
    //     informations = await informationCollection
    //       .find({ name: { $regex: input } })
    //       .toArray();
    //   } else if (type === "position") {
    //     informations = await informationCollection
    //       .find({ position: { $regex: input } })
    //       .toArray();
    //   } else {
    //     informations = await informationCollection
    //       .find({ office: { $regex: input } })
    //       .toArray();
    //   }
    //   res.send(informations);
    // });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Backend Server is LIVE!");
});

app.listen(port, () => {
  console.log("Listening to port", port);
});

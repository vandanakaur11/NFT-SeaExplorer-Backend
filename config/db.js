const mongoose = require("mongoose");

console.log("process.env.MONGO_URI >>>>>>>>", process.env.MONGO_URI);

const connectDB = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((e) => console.log(`Connected to database: ${e.connections[0].host}`))
    .catch((err) => {
      console.log(`Error: ${err}`);
      process.exit();
    });
};

module.exports = connectDB;

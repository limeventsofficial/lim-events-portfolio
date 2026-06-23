const mongoose = require("mongoose");

mongoose.connect('mongodb+srv://limeventsDb:RF5NzmRZfirplTIx@cluster0.eckzixb.mongodb.net/LimEvents?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => {
    console.log("Connected");
    process.exit(0);
  })
  .catch(err => {
    console.error(err,'error hapened');
    process.exit(1);
  });
import mongoose, { ConnectOptions } from "mongoose";

const opts: ConnectOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  poolSize: 10, // TODO: config
}

const connString = ''; // TODO: get from config

export default mongoose.createConnection(connString, opts);

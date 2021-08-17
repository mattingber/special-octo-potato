import mongoose, { ConnectOptions } from "mongoose";
import config from "config";


const opts: ConnectOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  poolSize: config.get('db.mongo.poolSize'),
};

const connString: string = config.get('db.mongo.connectionString');

export default mongoose.createConnection(connString, opts);

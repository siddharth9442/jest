import 'dotenv/config';
import { connectDb } from './db/index.js';
import { app } from './app.js';

connectDb().then(() => {
    console.log("MongoDB connected successfully!", new Date());
});


const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log("App is listening on: ", `http://localhost:${port}`);
})
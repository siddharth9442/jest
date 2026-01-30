import express from 'express';
import errorHandler from './middlewares/error.middleware.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));


import authRouter from './controllers/auth/index.js';

app.use('/api/auth/', authRouter);



// middleware to handle errors
app.use(errorHandler);


export { app };
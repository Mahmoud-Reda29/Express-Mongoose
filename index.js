import express from 'express';
import './config.js'
import bootstrap from './src/app.controller.js';
const app = express();


bootstrap(app,express);


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

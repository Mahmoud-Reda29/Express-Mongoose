import { connectDB } from "./DB/connection.js";
import userRouter from "./modules/user/user.controller.js";
import notesRouter from "./modules/note/note.controller.js";

const bootstrap = (app, express) => {

    app.use(express.json());
    app.use("/users",userRouter)
    app.use("/notes",notesRouter)
    connectDB();

    app.use("*", (req, res) => {
        res.status(404).json({ error: "Invalid Url", url: req.originalUrl });
    });
}
export default bootstrap

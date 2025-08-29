require("dotenv").config();
const express = require("express");
const path = require("path")
const app = express();
const PORT = process.env.PORT || 3000;
const indexRouter = require("./routers/indexRouter.js");

app.use(express.static(path.join(__dirname, "public")));
app.use("/", indexRouter);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.statusCode || 500).send(err.message || "Internal server error");
})

app.listen(PORT, () => {
    console.log(`File uploader listening on port ${PORT}`);
});
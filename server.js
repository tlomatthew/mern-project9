const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const authRoute = require("./routes").auth; //竟然是這樣用！！ 放在index裡連到資料夾後用object方式從裡面選屬性
const courseRoute = require("./routes").course;

const passport = require("passport");
require("./config/passport")(passport); //因為在require的passport.js裏直接將module.exports設為一個function 所以直接加上（）
//而參數直接用 上面require的passport套件
//connect to DB
const cors = require("cors");
const path = require("path");
const port = process.env.PORT || 8080; //process.env.PORT是heroku自動動態設定的

mongoose
  .connect(process.env.MONGODB_CONNECTION)
  .then(() => {
    console.log("連接到mongoDB....");
  })
  .catch((e) => {
    console.log(e);
  });

//middelware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, "client", "build")));

app.use("/api/users", authRoute);
//courseRoute應該被保護 只有只有登入系統的人才能新增課程或註冊課程
//如果 request header內部沒有ｊｗｔ,則request 就會被視為unauthorized
app.use(
  "/api/courses",
  passport.authenticate("jwt", { session: false }),
  //middleware  使用passport.authenticate會執行在passport.js裡的 passport jwt strategy
  courseRoute
);
if (
  process.env.NODE_ENV === "production" ||
  process.env.NODE_ENV === "staging"
) {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  });
}

app.listen(port, () => {
  console.log("backend-server is running on port 8080");
});

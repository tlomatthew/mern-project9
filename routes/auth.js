const router = require("express").Router();
const registerValidation = require("../validation").registerValidation;
const loginValidation = require("../validation").loginValidation;
const User = require("../models").user;
const jwt = require("jsonwebtoken");
//讓我們知道有發出有關auth的請求
router.use((req, res, next) => {
  console.log("正在接受跟auth有關的請求");
  next();
});

router.get("/testAPI", (req, res) => {
  return res.send("成功連結auth route");
});

router.post("/register", async (req, res) => {
  // 確認資料有符合格式
  let { error } = registerValidation(req.body);
  console.log(error);
  if (error) return res.status(400).send(error.details[0].message);
  //確認信箱是否有被註冊過
  let emailExist = await User.findOne({ email: req.body.email }).exec();
  if (emailExist) {
    return res.status(400).send("email has been used");
  }
  // 製作新用戶
  if (!emailExist) {
    let { username, email, password, role } = req.body;
    let newUser = new User({ username, email, password, role });
    try {
      let saveUser = await newUser.save();
      return res.send({
        msg: "儲存成功",
        saveUser,
      });
    } catch (e) {
      return res.status(400).send("無法儲存使用者...");
      console.log(e);
    }
  }
});

router.post("/login", async (req, res) => {
  //確認data是否符合格式
  let { error } = loginValidation(req.body);
  let result = loginValidation(req.body);
  // console.log(result);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  // 確認信箱是否存在
  const foundUser = await User.findOne({ email: req.body.email }).exec();
  if (!foundUser) {
    return res.status(401).send("User not found...........check email again");
  }

  //確認密碼是否正確 schema 裡有instance method

  foundUser.comparePassword(req.body.password, (err, isMatch) => {
    if (err) {
      return res.status(500).send(err); //這裡的error是指在schema 李內部brycpt的錯誤 而就算密碼不相同
      //在schema 李的instance method 依然可以執行 只是result 會是false 也就是cb()裡的第二餐數 所以當
      //下面的is match 為false return 401
    }

    if (isMatch) {
      // 製作json web token
      const tokenObject = {
        _id: foundUser._id,
        email: foundUser.email,
      };
      const token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET);
      // 在token 屬性 "JWT "後面一定要加上空格不然會有ＢＵＧ
      return res.send({ msg: "成功登入", token: "JWT " + token, foundUser });
    } else {
      return res.status(401).send("password error");
    }
  });
});

module.exports = router;

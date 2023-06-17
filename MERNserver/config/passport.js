let JwtStrategy = require("passport-jwt").Strategy;
let ExtractJwt = require("passport-jwt").ExtractJwt;
// extractJwt 只的就是他能夠將 token 中的jwt的部分拉出來
const User = require("../models/").user;

module.exports = (passport) => {
  let opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
  //將 已被驗證的schema的header裡的jwt拿出放在opts object
  opts.secretOrKey = process.env.PASSPORT_SECRET;
  // 將 輸入要給予的secret 放盡opts object
  passport.use(
    // 使用jwtStrategy方式去驗證token 第一個參數為 前面拿取的opts object
    //第二參數為cb()兩個參數分別為jwt_payload,和done

    new JwtStrategy(opts, async function (jwt_payload, done) {
      // 如果沒有被篡改過 jwt_payload 會是token解析出來的json data
      try {
        let foundUser = await User.findOne({ _id: jwt_payload._id }).exec();
        if (foundUser) {
          console.log(foundUser);
          return done(null, foundUser); //功能就是將req.user設定為foundUser
        } else {
          return done(null, false);
        }
      } catch (e) {
        return done(e, false);
      }
    })
  );
};

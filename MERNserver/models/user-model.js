const mongoose = require("mongoose");

const Schema = mongoose.Schema; //{Schema}=mongoose
const bcrypt = require("bcrypt");
const userSchema = new Schema({
  username: { type: String, required: true, minLength: 3, maxLength: 50 },
  email: { type: String, required: true, minLength: 6, maxLength: 50 },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "instructor"], required: true },
  date: { type: Date, default: Date.now },
});

//instance method
userSchema.methods.isStudent = function () {
  return this.role == "student";
};

userSchema.methods.isInstructor = function () {
  return this.role == "instructor";
};

userSchema.methods.comparePassword = async function (password, cb) {
  // 參數的password指的是使用者要登入的密碼,而this.password指的是存在mongoDB裡的資料的password
  let result;
  try {
    result = await bcrypt.compare(password, this.password);
    return cb(null, result);
  } catch (e) {
    return cb(e, result);
  }
};

// mongoose middleweres
// 若使用者為新用戶,或正在更改密碼,則將密碼hash
userSchema.pre("save", async function (next) {
  //this 代表mongoDB裡的ducument       mongoose裡有一個屬性是 this.isＮew
  // this.isModified()也是 參數裡可以放其他 model裡的屬性 用isModified來確認是否有改過
  if (this.isNew || this.isModified("password")) {
    //將密碼hash
    const hashValue = await bcrypt.hash(this.password, 10);
    this.password = hashValue;
  }
  next();
});

module.exports = mongoose.model("User", userSchema);

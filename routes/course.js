const router = require("express").Router();

const Course = require("../models").course;
const courseValidation = require("../validation").courseValidation;

router.use((req, res, next) => {
  console.log("course正在接受一個request");
  next();
});

//獲得系統中的所有課程
router.get("/", async (req, res) => {
  try {
    let allCourses = await Course.find({})
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send({
      message: "以下為所有課程",
      allCourses,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send(e);
  }
});
//用講師ＩＤ查詢克程
router.get("/instructor/:_instructor_id", async (req, res) => {
  let { _instructor_id } = req.params;
  try {
    let foundCourse = await Course.find({ instructor: _instructor_id })
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send({ message: "以下為妳所搜尋的講師所有課程", foundCourse });
  } catch (e) {
    console.log(e);
  }
});
// 用學生ＩＤ來尋找註冊過的課程
router.get("/student/:_student_id", async (req, res) => {
  let { _student_id } = req.params;
  try {
    let foundCourse = await Course.find({ students: _student_id })
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send({ message: "以下為你註冊的課程", foundCourse });
  } catch (e) {
    console.log(e);
  }
});

// 查詢指定課程 用課程title查詢
router.get("/findByTitle/:title", async (req, res) => {
  try {
    let { title } = req.params;
    let foundcourse = await Course.find({ title })
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send({
      message: "你指定的課程為",
      foundcourse,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send(e);
  }
});

//新增課程
router.post("/", async (req, res) => {
  // 先驗證格式是否正確
  let { error } = courseValidation(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  if (req.user.isStudent()) {
    return res.status(400).send("只有講師可以創建課程");
  }
  let { title, description, price } = req.body;
  try {
    let newCourse = new Course({
      title,
      description,
      price,
      instructor: req.user._id,
      //instructor裏的req.user 因為在index 裏每次要進到course route 必須經過 passport.authenticate
      //的middleware如果通過jwt 驗證 會將驗證過的user存在req.user 在passort.js
      //new jwt strategy 的 done()裏會將通過驗證的user存在req.body
    });
    console.log(newCourse);

    let saveCourse = await newCourse.save();
    return res.send({
      saveCourse,
      message: "課程創建成功",
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send("無法創建課程...");
  }
});
//學生透過課程ＩＤ註冊課程
router.post("/enroll/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    let course = await Course.findOne({ _id }).exec();
    course.students.push(req.user._id);
    await course.save();
    return res.send("註冊成功");
  } catch (e) {
    console.log(e);
  }
});

//更改課程
router.patch("/:_id", async (req, res) => {
  // 格式是否正確
  let { error } = courseValidation(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  let { _id } = req.params;
  // 確認課程存在 用ＩＤ搜尋課程
  try {
    let foundcourse = await Course.findOne({ _id }).exec();
    if (!foundcourse) {
      console.log(req.user);
      return res.status(400).send("查無此課程");
    }

    // 使用者必須是此課程講師,才能編輯課程
    if (foundcourse.instructor.equals(req.user._id)) {
      let UpdatedCourse = await Course.findOneAndUpdate({ _id }, req.body, {
        new: true,
        runValidators: true,
      })
        .populate("instructor", ["username", "email"])
        .exec();

      return res.send({ message: "更新課程成功,更新課程為", UpdatedCourse });
    } else {
      console.log(foundcourse);
      console.log(req.user);
      return res.status(403).send("只有此課程講師可以編輯課程");
    }
  } catch (e) {
    console.log(e);
    return res.status(500).send({ message: "伺服器錯誤", e });
  }
});

//刪除課程
router.delete("/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    //確認課程存在
    let foundcourse = await Course.findOne({ _id }).exec();

    if (!foundcourse) {
      return res.status(400).send("查無此課程");
    }

    //使用者必須是此課程講師才能刪除

    if (foundcourse.instructor.equals(req.user._id)) {
      await Course.findOneAndDelete({ _id }).exec();
      return res.send("course is deleted success");
    } else {
      return res.status(403).send("只有此課程的講師可以刪除課程");
    }
  } catch (e) {
    console.log(e);
    return res.status(500).send({ message: "伺服器錯誤", e });
  }
});
module.exports = router;

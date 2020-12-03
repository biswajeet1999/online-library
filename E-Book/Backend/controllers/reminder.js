const User = require("../models/User");
const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "biswajeetpadhi1999@gmail.com",
    pass: "9776022955",
  },
});

let reminderQueue = [];

setInterval(() => {
  scheduleTaskFromQueue();
}, 1000);

const insertTaskIntoQueue = (userId, email, name, date, task) => {
  const taskObject = { userId, email, name, date, task };
  reminderQueue.push(taskObject);
  let i = reminderQueue.length - 2;
  while (
    i >= 0 &&
    new Date(reminderQueue[i + 1].date).getTime() < new Date(reminderQueue[i].date).getTime()
  ) {
    [reminderQueue[i + 1], reminderQueue[i]] = [reminderQueue[i], reminderQueue[i + 1]];
    i--;
  }
};

const scheduleTaskFromQueue = () => {
  if (reminderQueue.length > 0) {
    const currentTask = reminderQueue[0];
    if (new Date(currentTask.date).getTime() <= new Date().getTime()) {
      reminderQueue.shift(); // removed first inorder to prevent duplicate message send
      // send mail
      transporter.sendMail(
        {
          from: "biswajeetpadhi1999@gmail.com",
          //  to: currentTask.mail,
          to: "biswajeet.cse.2017@nist.edu",
          subject: "reminder from E-Book Store",
          text: currentTask.task,
        },
        (err, success) => {
          if (err) {
            console.log(err);
          } else {
            console.log(success);
          }
          // remove todo from database
          User.findByIdAndUpdate(
            currentTask.userId,
            { $pull: { todo: { date: currentTask.date, task: currentTask.task } } },
            { useFindAndModify: false },
            (err, task) => {
              if (err) console.log(err);
            }
          );
        }
      );
    }
  }
};

exports.setReminder = (req, res) => {
  const { _id, email, name } = req.profile;
  const user = req.profile;
  const { date, task } = req.body;
  insertTaskIntoQueue(_id, email, name, date, task);
  // save into database
  user.todo.push({ date, task });
  user.save((err, user) => {
    if (err) {
      return res.status(400).json({ err: "unable to schedule task" });
    } else {
      return res.status(200).json({ msg: "Task successfully scheduled" });
    }
  });
};

exports.getReminders = (req, res) => {
  const user = req.profile;
  return res.status(200).json({ msg: user.todo });
};

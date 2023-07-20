const nodemailer = require("nodemailer")

const emailer = async ({
  to,
  subject,
  text,
  html,
  attachments,
  filename,
  path,
  cid,
}) => {
  if (!to)
    throw new Error("Emailer need recipient email. `to` parameter is missing")

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "donnutsjr@gmail.com",
      pass: "knnykqnsrrmcjzbr",
    },
  })
  await transporter.sendMail({
    to,
    subject,
    text,
    html,
    attachments,
    filename,
    path,
    cid,
  })
}

module.exports = emailer

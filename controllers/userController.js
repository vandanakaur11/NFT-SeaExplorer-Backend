const User = require("./../models/User");
const { Aggregate, Types } = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sgMail = require("@sendgrid/mail");
const nodemailer = require("nodemailer");
const { env } = require("process");

sgMail.setApiKey(env.SENDGRID_API_KEY);

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json({
      status: "success",
      results: users.length,
      data: {
        users,
      },
    });
  } catch (error) {
    console.log("error >>>>>>>>", error);

    res.status(400).json({
      status: "fail",
      message: error,
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    console.log("error >>>>>>>>", error);

    res.status(400).json({
      status: "fail",
      message: error,
    });
  }
};

exports.createUser = async (req, res) => {
  try {
    const {
      name: { first, last },
      email,
      password,
      role,
    } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        status: "fail",
        message: `This email '${email}' is already associated with an account!`,
      });
    }

    // Validate fields
    if (!first || !last || !email || !password || !role) {
      return res
        .status(400)
        .json({ status: "fail", message: "All fields must be filled!" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Generate JWT Token
    const hashToken = generateToken(email);

    const newUser = await User.create({
      name: { first, last },
      email,
      password: hashPassword,
      hashToken,
      role,
    });

    if (newUser) {
      const verificationLink = `${env.CLIENT_URL}/verify/${newUser._id}/${newUser.hashToken}`;

      // Send mail via sendgrid

      /* const mailDetails = {
        from: env.USER_EMAIL, // sender email
        to: email, // receiver email
        subject: "Verification Email - NFT-SeaExplorer",
        html: `<h4>Greetings from NFT-SeaExplorer,</h4><h4>Below is your one time use verify link:</h4><h4>Click here for verification <a href="${verificationLink}">link</a></h4><h4>Please be aware that this verification link is only valid for 1 day.</h4><h4>Sincerely,</h4><h4>The NFT-SeaExplorer Team</h4>`,
      };

      sendMailViaSendGrid(mailDetails); */

      // Send mail via nodemailer

      const mailOptions = {
        from: env.USER_EMAIL, // sender email
        to: email, // receiver email
        subject: "Verification Email - NFT-SeaExplorer",
        html: `<h4>Greetings from NFT-SeaExplorer,</h4><h4>Below is your one time use verify link:</h4><h4>Click here for verification <a href="${verificationLink}">link</a></h4><h4>Please be aware that this verification link is only valid for 1 day.</h4><h4>Sincerely,</h4><h4>The NFT-SeaExplorer Team</h4>`,
      };

      sendMailViaNodeMailer(mailOptions);

      newUser &&
        res.status(201).json({
          status: "success",
          message: "User created successfully.",
        });
    }
  } catch (error) {
    console.log("error >>>>>>>>", error);

    res.status(400).json({
      status: "fail",
      message: error,
    });
  }
};

exports.verifyUser = async (req, res) => {
  try {
    const { id, token } = req.params;

    // Check user exist or not
    const existingUser = await User.findOne({ _id: id });

    if (!existingUser) {
      return res
        .status(400)
        .json({ status: "fail", message: "User not found!" });
    }

    if (existingUser.isVerified) {
      return res.status(400).json({
        status: "fail",
        message: "User already verified, Now login!",
      });
    }

    const verifiedUser = await User.updateOne(
      { _id: id },
      { $set: { hashToken: "abcd", isVerified: true } },
      { new: true }
    );

    if (verifiedUser) {
      const successMessage = `<h4>Your account verified successfully... Now <a href="http://localhost:3000/login">Login</a> your account</h4><h4>Regards,</h4><h4>NFT-SeaExplorer Team</h4>`;

      // Send mail via sendgrid

      /* const mailDetails = {
        from: env.USER_EMAIL, // sender email
        to: existingUser.email, // receiver email
        subject: "Verified Account - NFT-SeaExplorer",
        html: successMessage,
      };

      sendMailViaSendGrid(mailDetails); */

      // Send mail via nodemailer

      const mailOptions = {
        from: env.USER_EMAIL, // sender email
        to: existingUser.email, // receiver email
        subject: "Verified Account - NFT-SeaExplorer",
        html: successMessage,
      };

      sendMailViaNodeMailer(mailOptions);

      return res.status(200).json({
        status: "success",
        message: "Account verified successfully, Now login...",
      });
    }

    res.status(400).json({ status: "fail", message: "Something went wrong!" });
  } catch (error) {
    console.log("error >>>>>>>>", error);

    res.status(400).json({
      status: "fail",
      message: error,
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({
        status: "fail",
        message: "User not found!",
      });
    }

    // Validate fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "fail", message: "All fields must be filled!" });
    }

    // Check user verified or not
    if (!existingUser.isVerified) {
      const verificationLink = `${env.CLIENT_URL}/verify/${existingUser._id}/${existingUser.hashToken}`;

      // Send mail via sendgrid

      /* const mailDetails = {
        from: env.USER_EMAIL, // sender email
        to: email, // receiver email
        subject: "Verification Email - NFT-SeaExplorer",
        html: `<h4>Greetings from NFT-SeaExplorer,</h4><h4>Below is your one time use verify link:</h4><h4>Click here for verification <a href="${verificationLink}">link</a></h4><h4>Please be aware that this verification link is only valid for 1 day.</h4><h4>Sincerely,</h4><h4>The NFT-SeaExplorer Team</h4>`,
      };

      sendMailViaSendGrid(mailDetails); */

      // Send mail via nodemailer

      const mailOptions = {
        from: env.USER_EMAIL, // sender email
        to: email, // receiver email
        subject: "Verification Email - NFT-SeaExplorer",
        html: `<h4>Greetings from NFT-SeaExplorer,</h4><h4>Below is your one time use verify link:</h4><h4>Click here for verification <a href="${verificationLink}">link</a></h4><h4>Please be aware that this verification link is only valid for 1 day.</h4><h4>Sincerely,</h4><h4>The NFT-SeaExplorer Team</h4>`,
      };

      sendMailViaNodeMailer(mailOptions);

      return res.status(400).json({
        status: "fail",
        message:
          "Your account not verified!. Check your email for verification.",
      });
    }

    // Verify Password
    const verifyPassword = await bcrypt.compare(
      password,
      existingUser.password
    );

    // Get data with role
    // const userDetail = await User.aggregate([
    //   {
    //     $lookup: {
    //       from: "roles",
    //       localField: "role",
    //       foreignField: "_id",
    //       as: "roleDetail",
    //     },
    //   },
    // ]);

    // console.log("userDetail >>>>>>>>", userDetail);

    console.log("verifyPassword >>>>>>>>", verifyPassword);

    const userDetail = await User.findOne({ email }).select(
      "-password -hashToken -role -code -isVerified -__v"
    );

    if (verifyPassword) {
      res.status(200).json({
        status: "success",
        token: generateToken,
        data: { user: userDetail },
      });
    } else {
      res.status(400).json({
        status: "failed",
        message: "Username or password is invalid!",
      });
    }
  } catch (error) {
    console.log("error >>>>>>>>", error);

    res.status(400).json({
      status: "fail",
      message: error,
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({
        status: "fail",
        message: "User not found!",
      });
    }

    // Validate fields
    if (!email) {
      return res
        .status(400)
        .json({ status: "fail", message: "Email field must be filled!" });
    }

    const { _id, email: userEmail } = existingUser;

    const generateSixDigitCode = Math.floor(Math.random() * 1000000);
    console.log("generateSixDigitCode >>>>>>>>", generateSixDigitCode);

    const updateCode = await User.updateOne(
      { _id },
      { $set: { code: generateSixDigitCode } }
    );

    if (updateCode) {
      const forgotPassword = `<h4>Greetings from NFT-SeaExplorer,</h4><h4>Below is your one time use code:</h4><h4>${generateSixDigitCode}</h4><h4>Please be aware that this code is only valid for one hour.</h4><h4>Sincerely,</h4><h4>The NFT-SeaExplorer Team</h4>`;

      // Send mail via sendgrid

      /* const mailDetails = {
        from: env.USER_EMAIL, // sender email
        to: email, // receiver email
        subject: "Forgot Password Verification Code - NFT-SeaExplorer",
        html: forgotPassword,
      };

      sendMailViaSendGrid(mailDetails); */

      // Send mail via nodemailer

      const mailOptions = {
        from: env.USER_EMAIL, // sender email
        to: email, // receiver email
        subject: "Forgot Password Verification Code - NFT-SeaExplorer",
        html: forgotPassword,
      };

      sendMailViaNodeMailer(mailOptions);

      res.status(200).json({
        status: "success",
        message: `Success! verification code sent to '${userEmail}' email.`,
        data: {
          id: _id,
        },
      });
    }
  } catch (error) {
    console.log("error >>>>>>>>", error);

    res.status(400).json({
      status: "fail",
      message: error,
    });
  }
};

exports.verifyOTPCode = async (req, res) => {
  try {
    const { id } = req.params;

    const { code } = req.body;

    // Check user exist or not
    const existingUser = await User.findOne({ _id: id });

    if (!existingUser) {
      return res.status(400).json({
        status: "fail",
        message: "User not found!",
      });
    }

    // Validate fields
    if (!code) {
      return res
        .status(400)
        .json({ status: "fail", message: "Code field must be filled!" });
    }

    // Compare code
    if (code !== existingUser.code) {
      return res.status(400).json({
        status: "fail",
        message: "Code not correct, check your email!",
      });
    }

    const result = await User.updateOne(
      { _id: id },
      { $set: { code: 000000 } }
    );

    if (result) {
      return res.status(200).json({
        status: "success",
        message: "Code verified successfully. Now reset your password...",
      });
    }

    res.status(400).json({
      status: "fail",
      message: "Something went wrong!",
    });
  } catch (error) {
    console.error("error >>>>>>>>", error);

    res.status(400).json({
      status: "fail",
      message: error,
    });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { id } = req.params;

    const { password, confirmPassword } = req.body;

    // Check user exist or not
    const existingUser = await User.findOne({ _id: id });

    if (!existingUser) {
      return res.status(400).json({
        status: "fail",
        message: "User not found!",
      });
    }

    // Validate fields
    if (!password || !confirmPassword) {
      return res
        .status(400)
        .json({ status: "fail", message: "All fields must be filled!" });
    }

    // Compare password and confirm password
    if (password !== confirmPassword) {
      return res.status(400).json({
        status: "fail",
        message: "Password and confirm password do not match!",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const result = await User.updateOne(
      { _id: id },
      { $set: { password: hashPassword } }
    );

    if (result) {
      return res.status(200).json({
        status: "success",
        message: "Password updated successfully. Now login...",
      });
    }

    res.status(400).json({
      status: "fail",
      message: "Something went wrong!",
    });
  } catch (error) {
    console.error("error >>>>>>>>", error);

    res.status(400).json({
      status: "fail",
      message: error,
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ status: "success", data: { user } });
  } catch (error) {
    console.error("error >>>>>>>>", error);

    res.status(400).json({
      status: "fail",
      message: error,
    });
  }
};

exports.updateAccountStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    const {
      accountAccepted: { status, reason },
    } = req.body;

    // Validate fields
    if (status === "" || !reason === "") {
      return res
        .status(400)
        .json({ status: "fail", message: "All fields must be filled!" });
    }

    if (user) {
      if (status) {
        const updateAccountStatus = await User.findByIdAndUpdate(
          req.params.id,
          req.body,
          { new: true, runValidators: true }
        );

        if (updateAccountStatus) {
          const updateAccountStatusEmail = `<h4>Your account approved so, you enjoy your <a href="http://localhost:3000">NFT-SeaExplorer</a> journey.</h4><h4>Regards,</h4><h4>NFT-SeaExplorer Team</h4>`;

          // Send mail via sendgrid

          /* const mailDetails = {
            from: env.USER_EMAIL, // sender email
            to: user.email, // receiver email
            subject: "Account Status Email - NFT-SeaExplorer",
            html: updateAccountStatusEmail,
          };

          sendMailViaSendGrid(mailDetails); */

          // Send mail via nodemailer

          const mailOptions = {
            from: env.USER_EMAIL, // sender email
            to: user.email, // receiver email
            subject: "Account Status Email - NFT-SeaExplorer",
            html: updateAccountStatusEmail,
          };

          sendMailViaNodeMailer(mailOptions);

          return res
            .status(200)
            .json({ status: "success", data: { user: updateAccountStatus } });
        }

        res
          .status(400)
          .json({ status: "success", message: "Something was wrong!" });
      } else {
        const updateAccountStatus = await User.findByIdAndUpdate(
          req.params.id,
          req.body,
          { new: true, runValidators: true }
        );

        if (updateAccountStatus) {
          const updateAccountStatusEmail = `<h4>Your account is un-approved because '${reason}'</h4><h4>Regards,</h4><h4>NFT-SeaExplorer Team</h4>`;

          // Send mail via sendgrid

          /* const mailDetails = {
            from: env.USER_EMAIL, // sender email
            to: user.email, // receiver email
            subject: "Account Status Email - NFT-SeaExplorer",
            html: updateAccountStatusEmail,
          };

          sendMailViaSendGrid(mailDetails); */

          // Send mail via nodemailer

          const mailOptions = {
            from: env.USER_EMAIL, // sender email
            to: user.email, // receiver email
            subject: "Account Status Email - NFT-SeaExplorer",
            html: updateAccountStatusEmail,
          };

          sendMailViaNodeMailer(mailOptions);

          return res
            .status(200)
            .json({ status: "success", data: { user: updateAccountStatus } });
        }

        res
          .status(400)
          .json({ status: "success", message: "Something was wrong!" });
      }
    }
  } catch (error) {
    console.error("error >>>>>>>>", error);

    res.status(400).json({
      status: "fail",
      message: error,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    console.error("error >>>>>>>>", error);

    res.status(400).json({
      status: "fail",
      message: error,
    });
  }
};

const generateToken = (email) => {
  return jwt.sign({ email }, env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

const sendMailViaSendGrid = async (mailDetails) => {
  try {
    await sgMail
      .send(mailDetails)
      .then(() => {
        console.log("Mail sent successfully!");
      })
      .catch((err) => {
        console.error("sendMailViaSendGrid err >>>>>>>>>>>>>>>>>>", err);
      });
  } catch (error) {
    console.error(error);

    if (error.response) {
      console.error(error.response.body);
    }
  }
};

const sendMailViaNodeMailer = (mailOptions) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.USER_EMAIL,
      pass: env.USER_PASS,
    },
  });

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("sendMailViaNodeMailer error >>>>>>>>>>>>>", error);
    } else {
      console.log("info >>>>>>", info);
      console.info("Email sent: " + info.response);
    }
  });
};

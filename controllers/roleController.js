const Role = require("./../models/Role");

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find();

    res.status(200).json({
      status: "success",
      results: roles.length,
      data: {
        roles,
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

exports.getRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);

    res.status(200).json({
      status: "success",
      data: {
        role,
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

exports.createRole = async (req, res) => {
  try {
    const { name } = req.body;

    // Validate field

    if (!name) {
      return res
        .status(400)
        .json({ status: "fail", message: "Name field must be filled!" });
    }

    // Check existing role
    const role = await Role.findOne({ name });

    if (role) {
      return res.status(400).json({
        status: "fail",
        message: `${role.name} role already exist!`,
      });
    }

    const newRole = await Role.create(req.body);

    newRole &&
      res.status(201).json({ status: "success", data: { role: newRole } });
  } catch (error) {
    console.log("error >>>>>>>>", error);

    res.status(400).json({
      status: "fail",
      message: error,
    });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ status: "success", data: { role } });
  } catch (error) {
    console.log("error >>>>>>>>", error);

    res.status(400).json({
      status: "fail",
      message: error,
    });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    await Role.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    console.log("error >>>>>>>>", error);

    res.status(400).json({
      status: "fail",
      message: error,
    });
  }
};

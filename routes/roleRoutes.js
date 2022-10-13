const router = require("express").Router();
const roleController = require("./../controllers/roleController");

router
  .route("/")
  .get(roleController.getAllRoles)
  .post(roleController.createRole);

router
  .route("/:id")
  .get(roleController.getRole)
  .patch(roleController.updateRole)
  .delete(roleController.deleteRole);

module.exports = router;

import { RoleController } from "./RoleController";
import { roleService } from "../../useCases";
import { Router } from "express";

const roleController = new RoleController(roleService);
const router = Router();

router.post('/', roleController.createRole);
router.patch('/:roleId', roleController.updateRole);
router.put('/:roleId/group/:groupId', roleController.moveGroup);
router.put('/:roleId/digitalIdentity/:digitalIdentityUniqueId', 
  roleController.connectDigitalIdentity);
router.delete('/:roleId/digitalIdentity/:digitalIdentityUniqueId', 
  roleController.disconnectDigitalIdentity);

export default router;

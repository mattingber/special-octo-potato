import { GroupController } from "./GroupController";
import { groupService } from "../../useCases";
import { Router } from "express";

const groupController = new GroupController(groupService);
const router = Router();

router.post('/', groupController.createGroup);
router.put('/:id/parent/:parentId', groupController.moveGroup);

export default router;

import { DigitalIdentityController } from "./DigitalIdentityController";
import { digitalIdentityService } from "../../useCases";
import { Router } from "express";

const diController = new DigitalIdentityController(digitalIdentityService);
const router = Router();

router.post('/', diController.createDigitalIdentity);
router.patch('/:id', diController.updateDigitalIdentity);

export default router;

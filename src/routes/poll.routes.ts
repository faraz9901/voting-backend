import express from "express";
import { createPoll, deletePoll, getActivePolls, updatePoll } from "../controller/poll.controller";
import { validate } from "../middleware/validate";
import { pollValidation } from "../validations/poll.validation";
import { verifyToken } from "../middleware/verifyToken";

// assigning router 
const router = express.Router()

// poll routes
router.post('/', verifyToken, validate(pollValidation), createPoll)
router.get('/', getActivePolls)
router.put('/:pollId', verifyToken, validate(pollValidation), updatePoll)
router.delete('/:pollId', verifyToken, deletePoll)


export default router
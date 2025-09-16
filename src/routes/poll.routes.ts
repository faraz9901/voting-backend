import express from "express";
import { createPoll, deletePoll, getActivePolls, updateOptions, updatePoll, voteOption } from "../controller/poll.controller";
import { validate } from "../middleware/validate";
import { pollValidation, updateOptionValidation, updateQuestionValidation } from "../validations/poll.validation";
import { verifyToken } from "../middleware/verifyToken";

// assigning router 
const router = express.Router()

// poll routes
router.post('/', verifyToken, validate(pollValidation), createPoll)
router.get('/', getActivePolls)
router.put('/:pollId', verifyToken, validate(updateQuestionValidation), updatePoll)
router.put('/options/:pollId', verifyToken, validate(updateOptionValidation), updateOptions)
router.delete('/:pollId', verifyToken, deletePoll)
// router.post('/vote/pollId', voteOption)


export default router
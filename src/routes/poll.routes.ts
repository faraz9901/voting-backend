import express from "express";
import { createPoll, deletePoll, getActivePolls, getPollVotes, updateOptions, updatePoll, voteOption } from "../controller/poll.controller";
import { validate } from "../middleware/validate";
import { pollValidation, updateOptionValidation, updateQuestionValidation } from "../validations/poll.validation";
import { verifyToken } from "../middleware/verifyToken";

// assigning router 
const router = express.Router()

// poll routes
router.post('/', verifyToken, validate(pollValidation), createPoll)
router.get('/', getActivePolls)

router.put('/options/:pollId', verifyToken, validate(updateOptionValidation), updateOptions)
router.post('/vote/:pollId', verifyToken, voteOption)

router.get("/:pollId", getPollVotes)
router.put('/:pollId', verifyToken, validate(updateQuestionValidation), updatePoll)
router.delete('/:pollId', verifyToken, deletePoll)


export default router
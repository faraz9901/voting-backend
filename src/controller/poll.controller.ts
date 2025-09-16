import { Response } from "express"
import { AppError, AppRequest, AppResponse } from "../utils";
import { prisma } from "../utils/prisma";
import { io } from "../app";

export const createPoll = async (req: AppRequest, res: Response) => {
    const userId = req.userId

    if (!userId) {
        throw new AppError(401, "Please login");
    }
    // This body is validated by validate middleware
    const { question, options, isPublished } = req.body

    // if the poll is empty
    if (!question || !options) {
        throw new AppError(400, "A poll cannot be empty");
    }

    const poll = await prisma.poll.create({
        data: {
            question,
            userId,
            isPublished,
            pollOptions: {
                create: options.map((opt: string) => {
                    return { text: opt }
                })
            }
        },
        include: { pollOptions: true }
    })


    return new AppResponse(201, "Poll Created", poll).send(res)


}

export const getActivePolls = async (req: AppRequest, res: Response) => {
    const polls = await prisma.poll.findMany({
        where: {
            isPublished: true
        },
        include: {
            pollOptions: true,   // fetch related options
        },
    });

    return new AppResponse(200, "Active Polls", polls).send(res)
}

export const updatePoll = async (req: AppRequest, res: Response) => {

    // get the user id from the req obj 
    const userId = req.userId

    // checking if the user is logged in
    if (!userId) {
        throw new AppError(401, "Please login");
    }

    const { pollId } = req.params

    // Retriving the poll
    const currentPoll = await prisma.poll.findUnique({
        where: {
            id: pollId
        }
    })

    // checking if the poll exist 
    if (!currentPoll) {
        throw new AppError(404, "Poll does not exist")
    }

    // if current user is not the owner of the poll
    if (userId !== currentPoll.userId) {
        throw new AppError(403, "You don't have permission to edit this poll")
    }

    const { question, isPublished } = req.body

    // Question is required
    if (!question) {
        throw new AppError(400, "Question is required")
    }

    // Updating the poll
    const updatedPoll = await prisma.poll.update({
        where: { id: pollId },
        data: {
            question,
            isPublished,
        }
    })


    // returning the response
    return new AppResponse(200, "Updated Successfully", updatedPoll).send(res)
}


export const updateOptions = async (req: AppRequest, res: Response) => {

    // get the user id from the req obj 
    const userId = req.userId

    // checking if the user is logged in
    if (!userId) {
        throw new AppError(401, "Please login");
    }

    const { pollId } = req.params

    // Retriving the poll
    const currentPoll = await prisma.poll.findUnique({
        where: {
            id: pollId
        }
    })

    // checking if the poll exist 
    if (!currentPoll) {
        throw new AppError(404, "Poll does not exist")
    }

    // if current user is not the owner of the poll
    if (userId !== currentPoll.userId) {
        throw new AppError(403, "You don't have permission to edit this poll")
    }

    const { text, pollOptionId } = req.body

    if (!text) {
        throw new AppError(401, "Text is required")
    }

    let updatedOption;

    // If updating a existing option then the user will have to send pollOptionId
    if (pollOptionId) {

        const pollOptionToUpdate = await prisma.pollOption.findFirst({
            where: {
                id: pollOptionId,
                pollId: currentPoll.id
            }
        })

        if (!pollOptionToUpdate) {
            throw new AppError(404, "Poll Option not found")
        }

        updatedOption = await prisma.pollOption.update({
            where: {
                id: pollOptionId
            },
            data: {
                text
            }
        })
    } else {
        // If polloption id is send then create a new option
        updatedOption = await prisma.pollOption.create({
            data: {
                text,
                pollId,
            }
        })
    }

    // returning the response
    return new AppResponse(200, "Updated Successfully", updatedOption).send(res)
}


export const deletePoll = async (req: AppRequest, res: Response) => {
    // get the user id from the req obj 
    const userId = req.userId

    // checking if the user is logged in
    if (!userId) {
        throw new AppError(401, "Please login");
    }

    const { pollId } = req.params

    // Retriving the poll
    const currentPoll = await prisma.poll.findUnique({
        where: {
            id: pollId
        }
    })

    // checking if the poll exist 
    if (!currentPoll) {
        throw new AppError(404, "Poll does not exist")
    }

    // if current user is not the owner of the poll
    if (userId !== currentPoll.userId) {
        throw new AppError(403, "You don't have permission to delete this poll")
    }

    await prisma.$transaction([
        prisma.vote.deleteMany({ where: { pollOption: { pollId } } }),
        prisma.pollOption.deleteMany({ where: { pollId } }),
        prisma.poll.delete({ where: { id: pollId } })
    ])

    return new AppResponse(200, "Deleted").send(res)
}


export const voteOption = async (req: AppRequest, res: Response) => {
    // get the user id from the req obj 
    const userId = req.userId

    // checking if the user is logged in
    if (!userId) {
        throw new AppError(401, "Please login");
    }

    const { pollId } = req.params
    const { pollOptionId } = req.body

    if (!pollId || !pollOptionId) {
        throw new AppError(400, "Poll ID and Poll Option ID is required")
    }

    // retriving the options
    const option = await prisma.pollOption.findFirst({
        where: {
            id: pollOptionId,
            pollId: pollId
        }
    })

    // if options does not exist
    if (!option) {
        throw new AppError(404, "Poll or the Poll Option does not exists")
    }

    // Checking if the user already voted or not
    const existingVote = await prisma.vote.findFirst({
        where: {
            userId: userId, // the current user
            pollOption: {
                pollId: pollId, // the poll they’re voting in
            },
        },
    });


    let vote;

    // updating the vote if the user already voted
    if (existingVote) {
        vote = await prisma.vote.update({
            where: { id: existingVote.id },
            data: {
                pollOptionId
            },
            include: { pollOption: true }
        })
    }
    // creating the vote
    else {
        vote = await prisma.vote.create({
            data: {
                userId,
                pollOptionId
            },
            include: { pollOption: true }
        })
    }

    io.to(`poll-${pollId}`).emit("pollUpdated");

    // returning the response
    return new AppResponse(200, existingVote ? "Vote Updated" : "Successfully Voted").send(res)
}


export const getPollVotes = async (req: AppRequest, res: Response) => {
    const { pollId } = req.params;

    if (!pollId) {
        throw new AppError(400, "Poll not found")
    }

    const poll = await prisma.poll.findUnique({
        where: { id: pollId },
        include: {
            pollOptions: {
                include: {
                    _count: {
                        select: { vote: true },
                    },
                },
            },
        },
    });

    if (!poll) {
        throw new AppError(404, "Poll not found");
    }

    // Format votes
    const voteCounts: Record<string, number> = {};
    let totalVotes = 0;

    poll.pollOptions.forEach((opt) => {
        const count = opt._count.vote;
        voteCounts[opt.text] = count;
        totalVotes += count;
    });

    const pollOptions = poll.pollOptions.map(opt => ({
        id: opt.id,
        text: opt.text,
        pollId: opt.pollId
    }))

    return new AppResponse(200, "Poll Votes", {
        poll: {
            id: poll.id,
            question: poll.question,
            isPublished: poll.isPublished,
            createdAt: poll.createdAt,
            options: pollOptions
        },
        votes: voteCounts,
        total: totalVotes,
    }).send(res);

};
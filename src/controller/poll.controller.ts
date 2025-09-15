import { Response } from "express"
import { AppError, AppRequest, AppResponse } from "../utils";
import { prisma } from "../utils/prisma";

export const createPoll = async (req: AppRequest, res: Response) => {
    const userId = req.userId

    if (!userId) {
        throw new AppError(401, "No user found");
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
        throw new AppError(401, "Question is required")
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

    const { options } = req.body

    // option is required
    if (!options) {
        throw new AppError(401, "Question is required")
    }

    // Updating the options
    const updatedOptions = await prisma.poll.update({
        where: { id: pollId },
        data: {
            pollOptions: {
                deleteMany: {},
                create: options.map((opt: string) => ({ text: opt }))
            }
        },
        include: { pollOptions: true }
    })


    // returning the response
    return new AppResponse(200, "Updated Successfully", updatedOptions).send(res)
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
        throw new AppError(403, "You don't have permission to edit this poll")
    }

    await prisma.$transaction([
        prisma.pollOption.deleteMany({ where: { pollId } }),
        prisma.poll.delete({ where: { id: pollId } })
    ])

    return new AppResponse(200, "Deleted").send(res)
}
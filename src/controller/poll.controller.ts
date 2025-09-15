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



}
export const deletePoll = async (req: AppRequest, res: Response) => {

}
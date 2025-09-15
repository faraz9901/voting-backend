import z from "zod";


export const pollValidation = z.object(
    {
        question: z.string("Question is required").min(3, "Question too short"),
        options: z.array(z.string("Some options are invalid").min(1, "Options can't be empty")).min(2, "Atleast 2 options are needed"),
        isPublished: z.boolean().default(true).optional()
    }
)
export const updateQuestionValidation = z.object(
    {
        question: z.string("Question is required").min(3, "Question too short"),
        isPublished: z.boolean().default(true).optional()
    }
)
export const updateOptionValidation = z.object(
    {
        options: z.array(z.string("Some options are invalid").min(1, "Options can't be empty"), "Invalid Options").min(2, "Atleast 2 options are needed"),
    }
)
import z from "zod";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?`~]).{6,}$/

export const loginValidation = z.object(
    {
        email: z.email("Invalid Email"),
        password: z.string("Password is required")
            .regex(
                passwordRegex,
                "Invalid Credentials"
            )
    }
)


export const registerValidation = z.object(
    {
        name: z.string("Name is Required")
            .min(3, "Name Should be atleast 3 characters long")
            .max(50, "Name cannot be more than 50 character long"),
        email: z.email("Invalid Email"),
        password: z.string("Password is required")
            .regex(
                passwordRegex,
                "Password should be atleast 6 characters long with one uppercase, lowercase, number, and special character"
            )
    }
)

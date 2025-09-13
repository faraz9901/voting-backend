import z from "zod";

export const loginValidation = z.object(
    {
        email: z.email("Invalid Email"),
        password: z.string("Password is required")
            .min(6, "Password should be atleast 6 characters long")
            .regex(/(?=.*[a-z])/, "Password must contain at least one lowercase letter")
            .regex(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
            .regex(/(?=.*\d)/, "Password must contain at least one number")
            .regex(/(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?`~])/,
                "Password must contain at least one special character")
    }
)


export const registerValidation = z.object(
    {
        name: z.string("Name is Required")
            .min(3, "Name Should be atleast 3 characters long")
            .max(50, "Name cannot be more than 50 character long"),
        email: z.email("Invalid Email"),
        password: z.string("Password is required")
            .min(6, "Password should be atleast 6 characters long")
            .regex(/(?=.*[a-z])/, "Password must contain at least one lowercase letter")
            .regex(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
            .regex(/(?=.*\d)/, "Password must contain at least one number")
            .regex(/(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?`~])/,
                "Password must contain at least one special character")
    }
)

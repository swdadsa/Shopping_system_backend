import jwt from "jsonwebtoken";

export function generateVerificationToken(email: string): string {
    const secretKey = process.env.JWT_SECRET || "y6FzT!32b4X$1eP9JqK%87^nV0rW+m@d";
    return jwt.sign({ email }, secretKey, { expiresIn: "1d" }); // Expires in 1 day
}

export function verifyToken(token: string): any {
    const secretKey = process.env.JWT_SECRET || "y6FzT!32b4X$1eP9JqK%87^nV0rW+m@d";
    return jwt.verify(token, secretKey);
}

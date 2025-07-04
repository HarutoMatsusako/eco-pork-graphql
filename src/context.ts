import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export function getUserIdFromReq(req: any): number {
  const auth = req.headers.authorization;
  if (!auth) throw new GraphQLError("認証トークンが必要です");
  const token = auth.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    return payload.userId;
  } catch {
    throw new GraphQLError("認証トークンが不正です");
  }
}

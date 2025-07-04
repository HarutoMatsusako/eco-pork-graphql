import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const userMutations = {
  registerUser: async (
    _: any,
    args: { name: string; email: string; password: string }
  ) => {
    const { name, email, password } = args;
    // 既存ユーザー確認
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error("このメールアドレスは既に登録されています");
    }
    // パスワードハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);
    // ユーザー作成
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });
    // JWTトークン生成
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "24h",
    });
    return token;
  },
  loginUser: async (_: any, args: { email: string; password: string }) => {
    const { email, password } = args;
    // ユーザー検索
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error("メールアドレスまたはパスワードが正しくありません");
    }
    // パスワード検証
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("メールアドレスまたはパスワードが正しくありません");
    }
    // JWTトークン生成
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "24h",
    });
    return token;
  },
};

export const userQueries = {
  purchaseHistory: async (_: any, args: { userId: number }, context: any) => {
    // 認証チェック
    if (!context.userId) {
      throw new Error("認証が必要です");
    }
    // 自分の購入履歴のみ取得可能
    if (context.userId !== args.userId) {
      throw new Error("他のユーザーの購入履歴は取得できません");
    }
    const orders = await prisma.order.findMany({
      where: { userId: args.userId },
      include: { orderItems: true },
      orderBy: { createdAt: "desc" },
    });
    return orders;
  },
};

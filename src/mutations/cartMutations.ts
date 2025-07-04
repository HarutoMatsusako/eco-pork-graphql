import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const cartMutations = {
  addToCart: async (
    _: any,
    args: { userId: number; productId: number; quantity: number }
  ) => {
    const { userId, productId, quantity } = args;
    // 既存のCartItemがあるか確認
    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existing) {
      // 数量を加算
      return await prisma.cartItem.update({
        where: { userId_productId: { userId, productId } },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      // 新規作成
      return await prisma.cartItem.create({
        data: { userId, productId, quantity },
      });
    }
  },
  removeFromCart: async (
    _: any,
    args: { userId: number; productId: number }
  ) => {
    const { userId, productId } = args;
    // CartItemが存在するか確認
    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (!existing) return false;
    await prisma.cartItem.delete({
      where: { userId_productId: { userId, productId } },
    });
    return true;
  },
}; 
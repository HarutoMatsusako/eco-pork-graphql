import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const orderMutations = {
  placeOrder: async (_: any, args: { userId: number }) => {
    const { userId } = args;
    // ユーザーのカートアイテムを取得
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });
    if (cartItems.length === 0) {
      throw new Error("カートが空です");
    }
    // 在庫確認と減算
    for (const cartItem of cartItems) {
      const inventory = await prisma.inventory.findUnique({
        where: { productId: cartItem.productId },
      });
      if (!inventory || inventory.stockQuantity < cartItem.quantity) {
        throw new Error(
          `商品「${cartItem.product.name}」の在庫が不足しています`
        );
      }
      // 在庫を減算
      await prisma.inventory.update({
        where: { productId: cartItem.productId },
        data: { stockQuantity: inventory.stockQuantity - cartItem.quantity },
      });
    }
    // 合計金額を計算
    const totalPrice = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    // 注文を作成
    const order = await prisma.order.create({
      data: {
        userId,
        totalPrice,
        orderItems: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: { orderItems: true },
    });
    // カートを空にする
    await prisma.cartItem.deleteMany({ where: { userId } });
    return order;
  },
};

export const orderQueries = {
  orderHistory: async (_: any, args: { userId: number }) => {
    const { userId } = args;
    const orders = await prisma.order.findMany({
      where: { userId },
      include: { orderItems: true },
      orderBy: { createdAt: "desc" },
    });
    return orders;
  },
};

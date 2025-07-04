import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const inventoryMutations = {
  updateInventory: async (
    _: any,
    args: { productId: number; stockQuantity: number }
  ) => {
    const { productId, stockQuantity } = args;
    // productIdが存在するかチェック
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) return null;
    // Inventoryの更新または作成
    const inventory = await prisma.inventory.upsert({
      where: { productId },
      update: { stockQuantity },
      create: { productId, stockQuantity },
    });
    return inventory;
  },
};

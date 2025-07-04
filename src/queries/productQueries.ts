import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const productQueries = {
  product: async (_: any, args: { id: number }) => {
    const { id } = args;
    const product = await prisma.product.findUnique({ where: { id } });
    return product;
  },
};

// GraphQL Product Mutations
// 商品登録Mutationの実装予定ファイル

import { PrismaClient } from "@prisma/client";
import { GraphQLError } from "graphql";

const prisma = new PrismaClient();

export const productMutations = {
  createProduct: async (
    _: any,
    args: { name: string; description: string; price: number; stock: number }
  ) => {
    const { name, description, price, stock } = args;
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
      },
    });
    return product;
  },
  updateProduct: async (
    _: any,
    args: {
      id: number;
      name: string;
      description: string;
      price: number;
      stock: number;
    }
  ) => {
    const { id, name, description, price, stock } = args;
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        stock,
      },
    });
    return product;
  },
  deleteProduct: async (_: any, args: { id: number }) => {
    const { id } = args;
    await prisma.product.delete({
      where: { id },
    });
    return true;
  },
  increaseStock: async (_: any, args: { id: number; amount: number }) => {
    const { id, amount } = args;
    const product = await prisma.product.update({
      where: { id },
      data: { stock: { increment: amount } },
    });
    return product;
  },
  decreaseStock: async (_: any, args: { id: number; amount: number }) => {
    const { id, amount } = args;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new GraphQLError("商品が見つかりません");
    if (product.stock < amount) throw new GraphQLError("在庫が不足しています");
    const updated = await prisma.product.update({
      where: { id },
      data: { stock: { decrement: amount } },
    });
    return updated;
  },
};

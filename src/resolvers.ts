import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const resolvers = {
  Query: {
    // 商品管理
    products: async () => {
      return await prisma.product.findMany();
    },
    product: async (_: any, args: { id: number }) => {
      const product = await prisma.product.findUnique({
        where: { id: args.id },
      });
      if (!product) throw new GraphQLError("商品が見つかりません");
      return product;
    },

    // カート管理（認証必須）
    cart: async (_: any, __: any, context: any) => {
      if (!context.userId) throw new GraphQLError("認証が必要です");
      return await prisma.cartItem.findMany({
        where: { userId: context.userId },
        include: { product: true },
        orderBy: { createdAt: "desc" },
      });
    },

    // 注文管理（認証必須）
    purchaseHistory: async (_: any, __: any, context: any) => {
      // TODO: 本来は認証が必要です。テスト用に一時的に無効化しています。
      // if (!context.userId) throw new GraphQLError("認証が必要です");

      // テスト用：全注文を取得（本来は特定ユーザーの注文のみ）
      return await prisma.order.findMany({
        include: { orderItems: { include: { product: true } } },
        orderBy: { createdAt: "desc" },
      });
    },
  },

  Order: {
    product: async (parent: any) => {
      // Orderの最初のOrderItemからProductを取得
      const firstOrderItem = await prisma.orderItem.findFirst({
        where: { orderId: parent.id },
        include: { product: true },
      });

      if (!firstOrderItem) {
        throw new GraphQLError("注文に商品が見つかりません");
      }

      return firstOrderItem.product;
    },
    quantity: async (parent: any) => {
      // Orderの全OrderItemのquantityの合計を計算
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId: parent.id },
        select: { quantity: true },
      });

      return orderItems.reduce((total, item) => total + item.quantity, 0);
    },
  },

  Mutation: {
    // 商品管理
    createProduct: async (
      _: any,
      args: { name: string; description: string; price: number; stock: number }
    ) => {
      const { name, description, price, stock } = args;
      if (price < 0) throw new GraphQLError("価格は0以上である必要があります");
      if (stock < 0)
        throw new GraphQLError("在庫数は0以上である必要があります");

      const product = await prisma.product.create({
        data: { name, description, price, stock },
      });
      return product;
    },

    updateProduct: async (
      _: any,
      args: {
        id: number;
        name?: string;
        description?: string;
        price?: number;
        stock?: number;
      }
    ) => {
      const { id, name, description, price, stock } = args;

      // バリデーション
      if (price !== undefined && price < 0)
        throw new GraphQLError("価格は0以上である必要があります");
      if (stock !== undefined && stock < 0)
        throw new GraphQLError("在庫数は0以上である必要があります");

      const existingProduct = await prisma.product.findUnique({
        where: { id },
      });
      if (!existingProduct) throw new GraphQLError("商品が見つかりません");

      // 更新データの構築
      const data: any = {};
      if (name !== undefined) data.name = name;
      if (description !== undefined) data.description = description;
      if (price !== undefined) data.price = price;
      if (stock !== undefined) data.stock = stock;

      const product = await prisma.product.update({
        where: { id },
        data,
      });
      return product;
    },

    deleteProduct: async (_: any, args: { id: number }) => {
      const existing = await prisma.product.findUnique({
        where: { id: args.id },
      });
      if (!existing) {
        throw new Error("商品が見つかりません");
      }
      await prisma.product.delete({
        where: { id: args.id },
      });
      return true;
    },

    // 在庫管理
    increaseStock: async (_: any, args: { id: number; amount: number }) => {
      const { id, amount } = args;
      if (amount <= 0)
        throw new GraphQLError("増加量は1以上である必要があります");

      const existingProduct = await prisma.product.findUnique({
        where: { id },
      });
      if (!existingProduct) throw new GraphQLError("商品が見つかりません");

      const product = await prisma.product.update({
        where: { id },
        data: { stock: { increment: amount } },
      });
      return product;
    },

    decreaseStock: async (_: any, args: { id: number; amount: number }) => {
      const { id, amount } = args;
      if (amount <= 0)
        throw new GraphQLError("減少量は1以上である必要があります");

      const existingProduct = await prisma.product.findUnique({
        where: { id },
      });
      if (!existingProduct) throw new GraphQLError("商品が見つかりません");
      if (existingProduct.stock < amount)
        throw new GraphQLError("在庫が不足しています");

      const product = await prisma.product.update({
        where: { id },
        data: { stock: { decrement: amount } },
      });
      return product;
    },

    updateStock: async (_: any, args: { id: number; stock: number }) => {
      const { id, stock } = args;
      if (stock < 0)
        throw new GraphQLError("在庫数は0以上である必要があります");

      // 商品存在確認
      const existingProduct = await prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        // デバッグ用：全商品のIDを確認
        const allProducts = await prisma.product.findMany({
          select: { id: true, name: true },
        });
        console.log("Available products:", allProducts);
        throw new GraphQLError(
          `商品ID ${id} が見つかりません。利用可能な商品ID: ${allProducts
            .map((p) => p.id)
            .join(", ")}`
        );
      }

      const product = await prisma.product.update({
        where: { id },
        data: { stock },
      });
      return product;
    },

    // カート操作（認証必須）
    addToCart: async (
      _: any,
      args: { productId: number; quantity: number },
      context: any
    ) => {
      if (!context.userId) throw new GraphQLError("認証が必要です");
      const { productId, quantity } = args;

      if (quantity <= 0)
        throw new GraphQLError("数量は1以上である必要があります");

      const product = await prisma.product.findUnique({
        where: { id: productId },
      });
      if (!product) throw new GraphQLError("商品が見つかりません");
      if (product.stock < quantity)
        throw new GraphQLError("在庫が不足しています");

      const existing = await prisma.cartItem.findUnique({
        where: { userId_productId: { userId: context.userId, productId } },
      });

      if (existing) {
        const newQuantity = existing.quantity + quantity;
        if (product.stock < newQuantity)
          throw new GraphQLError("在庫が不足しています");

        return await prisma.cartItem.update({
          where: { userId_productId: { userId: context.userId, productId } },
          data: { quantity: newQuantity },
          include: { product: true },
        });
      }

      return await prisma.cartItem.create({
        data: { userId: context.userId, productId, quantity },
        include: { product: true },
      });
    },

    removeFromCart: async (
      _: any,
      args: { productId: number },
      context: any
    ) => {
      if (!context.userId) throw new GraphQLError("認証が必要です");
      const { productId } = args;

      const existing = await prisma.cartItem.findUnique({
        where: { userId_productId: { userId: context.userId, productId } },
      });
      if (!existing) throw new GraphQLError("カートに商品がありません");

      await prisma.cartItem.delete({
        where: { userId_productId: { userId: context.userId, productId } },
      });
      return true;
    },

    // 注文管理（認証必須）
    placeOrder: async (_: any, __: any, context: any) => {
      if (!context.userId) throw new GraphQLError("認証が必要です");

      const cartItems = await prisma.cartItem.findMany({
        where: { userId: context.userId },
        include: { product: true },
      });

      if (cartItems.length === 0) throw new GraphQLError("カートが空です");

      // 在庫チェック
      for (const item of cartItems) {
        if (item.product.stock < item.quantity) {
          throw new GraphQLError(
            `商品「${item.product.name}」の在庫が不足しています`
          );
        }
      }

      // 在庫減算
      for (const item of cartItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 合計金額計算
      const totalPrice = cartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );

      // 注文作成
      const order = await prisma.order.create({
        data: {
          userId: context.userId,
          totalPrice,
          orderItems: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
        include: { orderItems: { include: { product: true } } },
      });

      // カートクリア
      await prisma.cartItem.deleteMany({ where: { userId: context.userId } });

      return order;
    },

    // ユーザー管理
    registerUser: async (
      _: any,
      args: { username: string; email: string; password: string }
    ) => {
      const { username, email, password } = args;

      if (password.length < 6)
        throw new GraphQLError("パスワードは6文字以上である必要があります");

      const existingUser = await prisma.user.findUnique({
        where: { username },
      });
      if (existingUser)
        throw new GraphQLError("このユーザー名は既に使用されています");

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { username, email, password: hashedPassword },
      });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: "24h",
      });
      return token;
    },

    loginUser: async (_: any, args: { username: string; password: string }) => {
      const { username, password } = args;

      const user = await prisma.user.findUnique({ where: { username } });
      if (!user)
        throw new GraphQLError("ユーザー名またはパスワードが正しくありません");

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword)
        throw new GraphQLError("ユーザー名またはパスワードが正しくありません");

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: "24h",
      });
      return token;
    },
  },
};

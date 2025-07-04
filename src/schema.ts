import { gql } from "apollo-server";

export const typeDefs = gql`
  # 豚肉ECサイト GraphQL API
  #
  # サンプルクエリ・ミューテーション例:
  #
  # 1. 商品一覧取得
  # query {
  #   products {
  #     id
  #     name
  #     description
  #     price
  #     stock
  #     createdAt
  #     updatedAt
  #   }
  # }
  #
  # 2. 商品詳細取得
  # query {
  #   product(id: 1) {
  #     id
  #     name
  #     description
  #     price
  #     stock
  #     createdAt
  #     updatedAt
  #   }
  # }
  #
  # 3. 商品登録
  # mutation {
  #   createProduct(
  #     name: "豚ロース"
  #     description: "上質な豚ロース肉"
  #     price: 1500
  #     stock: 10
  #   ) {
  #     id
  #     name
  #     description
  #     price
  #     stock
  #     createdAt
  #     updatedAt
  #   }
  # }
  #
  # 4. 商品更新
  # mutation {
  #   updateProduct(
  #     id: 1
  #     name: "豚ロース"
  #     description: "上質な豚ロース肉"
  #     price: 1600
  #     stock: 15
  #   ) {
  #     id
  #     name
  #     description
  #     price
  #     stock
  #     createdAt
  #     updatedAt
  #   }
  # }
  #
  # 5. 商品削除
  # mutation {
  #   deleteProduct(id: 1)
  # }
  #
  # 6. 在庫増加
  # mutation {
  #   increaseStock(id: 1, amount: 5) {
  #     id
  #     name
  #     stock
  #   }
  # }
  #
  # 7. 在庫減少
  # mutation {
  #   decreaseStock(id: 1, amount: 2) {
  #     id
  #     name
  #     stock
  #   }
  # }
  #
  # 8. カート追加
  # mutation {
  #   addToCart(productId: 1, quantity: 2) {
  #     id
  #     userId
  #     productId
  #     quantity
  #   }
  # }
  #
  # 9. カート削除
  # mutation {
  #   removeFromCart(productId: 1)
  # }
  #
  # 10. 注文確定
  # mutation {
  #   placeOrder {
  #     id
  #     userId
  #     totalPrice
  #     createdAt
  #     orderItems {
  #       id
  #       productId
  #       quantity
  #       price
  #       product {
  #         name
  #       }
  #     }
  #   }
  # }
  #
  # 11. ユーザー登録
  # mutation {
  #   registerUser(
  #     username: "testuser"
  #     password: "password123"
  #   )
  # }
  #
  # 12. ユーザーログイン
  # mutation {
  #   loginUser(
  #     username: "testuser"
  #     password: "password123"
  #   )
  # }
  #
  # 13. 購入履歴取得
  # query {
  #   purchaseHistory {
  #     id
  #     totalPrice
  #     createdAt
  #     orderItems {
  #       productId
  #       quantity
  #       price
  #       product {
  #         name
  #       }
  #     }
  #   }
  # }
  #
  # 注意: 認証が必要な操作には Authorization header に JWT トークンを設定してください
  # Authorization: Bearer <your-jwt-token>

  type Product {
    id: Int!
    name: String!
    description: String!
    price: Int!
    stock: Int!
    createdAt: String!
    updatedAt: String!
  }

  type CartItem {
    id: Int!
    userId: Int!
    productId: Int!
    quantity: Int!
    createdAt: String!
    product: Product!
  }

  type OrderItem {
    id: Int!
    orderId: Int!
    productId: Int!
    quantity: Int!
    price: Int!
    product: Product!
  }

  type Order {
    id: Int!
    userId: Int!
    totalPrice: Int!
    createdAt: String!
    orderItems: [OrderItem!]!
    product: Product!
    quantity: Int!
  }

  type User {
    id: Int!
    username: String!
    email: String
    createdAt: String!
  }

  type Query {
    # 商品管理
    products: [Product!]!
    product(id: Int!): Product

    # カート管理
    cart: [CartItem!]!

    # 注文管理
    purchaseHistory: [Order!]!
  }

  type Mutation {
    # 商品管理
    createProduct(
      name: String!
      description: String!
      price: Int!
      stock: Int!
    ): Product!
    updateProduct(
      id: Int!
      name: String
      description: String
      price: Int
      stock: Int
    ): Product!
    deleteProduct(id: Int!): Boolean!

    # 在庫管理
    increaseStock(id: Int!, amount: Int!): Product!
    decreaseStock(id: Int!, amount: Int!): Product!
    updateStock(id: Int!, stock: Int!): Product!

    # カート操作
    addToCart(productId: Int!, quantity: Int!): CartItem!
    removeFromCart(productId: Int!): Boolean!

    # 注文管理
    placeOrder: Order!

    # ユーザー管理
    registerUser(username: String!, email: String!, password: String!): String!
    loginUser(username: String!, password: String!): String!
  }
`;

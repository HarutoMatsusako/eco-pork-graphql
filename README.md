# 豚肉 EC サイト GraphQL API

## 概要

豚肉 EC サイト用の GraphQL バックエンド API です。商品管理、在庫管理、注文管理、ユーザー管理機能を提供します。

## 詳細設計ドキュメント

Notion: [https://www.notion.so/xxx](https://www.notion.so/Eco-Pork-2257a170b5f980e49dc3d341b007ddee?source=copy_link)


## 機能一覧

### 1. 商品管理

- 商品一覧取得
- 商品詳細取得
- 商品登録
- 商品更新
- 商品削除

### 2. 在庫管理

- 在庫数増加
- 在庫数減少（在庫不足時はエラー）

### 3. 注文管理

- カート追加
- カート削除
- 注文確定（在庫減算、カートクリア）
- 購入履歴取得

### 4. ユーザー管理

- ユーザー登録
- ユーザーログイン（JWT 認証）



## セットアップ

### 1. リポジトリをクローン
git clone https://github.com/HarutoMatsusako/eco-pork-graphql.git
cd eco-pork-graphql

### 2. 依存関係インストール
npm install

### 3. 環境変数設定
cp .env.example .env
## ※.env にDB接続情報を記載
例
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret"



### 4. DBマイグレーション
npx prisma migrate dev --name init

### 5. サーバー起動
npm run dev

### 6. 起動確認URL
サーバー起動後、以下URLでGraphQLサーバーにアクセスできます。
http://localhost:4000/


## 認証方法

認証が必要な操作には、HTTP リクエストヘッダーに JWT トークンを設定してください：

```
Authorization: Bearer <your-jwt-token>
```


## サンプルクエリ・ミューテーション

### 商品一覧取得

```graphql
query {
  products {
    id
    name
    description
    price
    stock
    createdAt
    updatedAt
  }
}
```

### 商品詳細取得

```graphql
query {
  product(id: 1) {
    id
    name
    description
    price
    stock
    createdAt
    updatedAt
  }
}
```

### 商品登録

```graphql
mutation {
  createProduct(
    name: "豚ロース"
    description: "上質な豚ロース肉"
    price: 1500
    stock: 10
  ) {
    id
    name
    description
    price
    stock
    createdAt
    updatedAt
  }
}
```

### 商品更新（部分更新可能）

```graphql
# 全フィールド更新
mutation {
  updateProduct(
    id: 1
    name: "豚ロース"
    description: "上質な豚ロース肉"
    price: 1600
    stock: 15
  ) {
    id
    name
    description
    price
    stock
    createdAt
    updatedAt
  }
}

# 価格のみ更新
mutation {
  updateProduct(id: 1, price: 1800) {
    id
    name
    price
    stock
  }
}

# 在庫数のみ更新
mutation {
  updateProduct(id: 1, stock: 20) {
    id
    name
    stock
  }
}
```

### 商品削除

```graphql
mutation {
  deleteProduct(id: 1)
}
```

### 在庫増加

```graphql
mutation {
  increaseStock(id: 1, amount: 5) {
    id
    name
    stock
  }
}
```

### 在庫減少

```graphql
mutation {
  decreaseStock(id: 1, amount: 2) {
    id
    name
    stock
  }
}
```

### 在庫数直接更新

```graphql
mutation {
  updateStock(id: 1, stock: 20) {
    id
    name
    stock
    updatedAt
  }
}
```

### ユーザー登録

```graphql
mutation {
  registerUser(
    username: "testuser"
    email: "test@example.com"
    password: "password123"
  )
}
```

### ユーザーログイン

```graphql
mutation {
  loginUser(username: "testuser", password: "password123")
}
```

### カート追加（認証必須）

```graphql
mutation {
  addToCart(productId: 1, quantity: 2) {
    id
    userId
    productId
    quantity
    createdAt
  }
}
```

### カート削除（認証必須）

```graphql
mutation {
  removeFromCart(productId: 1)
}
```

### 注文確定（認証必須）

```graphql
mutation {
  placeOrder {
    id
    userId
    totalPrice
    createdAt
    orderItems {
      id
      productId
      quantity
      price
      product {
        name
      }
    }
  }
}
```

### 購入履歴取得（認証必須）

```graphql
query {
  purchaseHistory {
    id
    totalPrice
    createdAt
    orderItems {
      productId
      quantity
      price
      product {
        name
      }
    }
  }
}
```

## エラーハンドリング

以下のエラーが適切に処理されます：

- 認証エラー（認証が必要な操作でトークンが無効）
- 在庫不足エラー
- 商品が見つからないエラー
- バリデーションエラー（価格・在庫数が負の値など）
- ユーザー名重複エラー

## 技術スタック

- GraphQL (Apollo Server)
- Prisma (ORM)
- SQLite (データベース)
- TypeScript
- JWT (認証)
- bcrypt (パスワードハッシュ化)

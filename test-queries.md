# テスト用 GraphQL クエリ

## 1. 商品作成（テスト用）

```graphql
mutation {
  createProduct(
    name: "テスト商品"
    description: "テスト用の商品です"
    price: 1000
    stock: 10
  ) {
    id
    name
    description
    price
    stock
  }
}
```

## 2. 商品一覧取得（作成確認）

```graphql
query {
  products {
    id
    name
    description
    price
    stock
  }
}
```

## 3. カート追加（認証必須）

```graphql
mutation {
  addToCart(productId: [実際の商品ID], quantity: 1) {
    id
    userId
    productId
    quantity
    createdAt
  }
}
```

## 4. 在庫数更新（updateStock）- 作成した商品の ID を使用

```graphql
# 作成した商品のIDを確認してから実行してください
mutation {
  updateStock(id: [実際の商品ID], stock: 20) {
    id
    name
    stock
    updatedAt
  }
}
```

## 5. 商品一覧取得（更新確認）

```graphql
query {
  products {
    id
    name
    description
    price
    stock
    updatedAt
  }
}
```

## 6. 商品削除（作成した商品の ID を使用）

```graphql
mutation {
  deleteProduct(id: [実際の商品ID])
}
```

## 7. 商品一覧取得（削除確認）

```graphql
query {
  products {
    id
    name
    description
    price
    stock
  }
}
```

## 8. ユーザー登録

```graphql
mutation {
  registerUser(
    username: "testuser"
    email: "test@example.com"
    password: "password123"
  )
}
```

## 9. ユーザーログイン

```graphql
mutation {
  loginUser(username: "testuser", password: "password123")
}
```

## 実行手順

1. まず商品作成を実行して ID を確認
2. 商品一覧で作成された商品の ID を確認
3. その ID を使ってカートに商品を追加
4. その ID を使って updateStock で在庫数を更新
5. 商品一覧で更新が成功したことを確認
6. その ID を使って商品削除を実行
7. 商品一覧で削除が成功したことを確認

## トラブルシューティング

- 「商品が見つかりません」エラーが出た場合：
  1. 商品一覧クエリで実際に存在する商品 ID を確認
  2. その ID を使って updateStock を実行
  3. サーバーログで利用可能な商品 ID を確認

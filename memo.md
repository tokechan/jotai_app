# 2025-02-01

## 1. React + Jotai lav

React と Jotai を使って実用的な Notion 風ノートアプリを開発検証

2025 年に入って React 界隈に衝撃的が走りました。これまでメンテナンスが全然されていなかった状態管理ライブラリ『Recoil』のプロジェクトが凍結されました。

[Recoil の GitHub](https://github.com/facebookexperimental/Recoil)

2023 年に Meta 社のレイオフをきっかけにメンテナンスが半年以上されなくなっていたところに、React19 が登場して対応できなくなった結果完全に Recoil はなくなったらしい。

ここは Cursol の提案です。リサーチ必要
↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
その後、React 界隈では Zustand という状態管理ライブラリが注目されている。

[Zustand の GitHub](https://github.com/pmndrs/zustand)

そんな中、Recoil の代替として選ばれているのが Jotai です。

[Jotai の GitHub](https://github.com/pmndrs/jotai)

そんな Jotai を使って Notion 風ノートアプリを開発検証してみます。

- React の基本機能の理解
- Jotai の状態管理の理解
- Convex の DB を使ったデータの永続化
- コードブロック機能
- コード補完機能

この点にフォーカスして進めていきます。

そして、デプロイすれば日常でも活用できるレベルのものを目指します。

このリポジトリがベースになります。
[text](https://github.com/jinwatanabe/jotai-note-app)

## Jotai って何？

Jotai は React の状態管理ライブラリです。
そもそも状態管理ライブラリの役割から学びます。

アプリケーション全体のデータ（状態）を一元的に管理するためのツール。
Reactwo 使っていると Props のバケツリレーによる依存関係や影響範囲の複雑化が起きることがあります。

それを解決するために状態管理ライブラリが登場しました。

Jotai はその中でも最もシンプルなものです。

Jotai の公式ドキュメントはこちら
[Jotai の公式ドキュメント](https://jotai.org/docs/introduction)

コンポーネントが多くなるとバケツリレーのように渡して最後の別のコンポーネントにデータを使って画面表示を行うことがあります。
コンポーネント A → コンポーネント B → コンポーネント C → コンポーネント D
これを、、、、
コンポーネント A → コンポーネント D に直接渡したいな、、、

それを実現できるのが状態管理ライブラリです。

構造的には、状態管理ライブ拉致を使うことによってグローバルステートを作り。
そこを利用して、どこからでもアクセス可能なデータ保管庫をつくることができます。
こうすることで必要なコンポーネントからデータを直接保管庫から読み取って使用することができる。

React の標準的な状態管理は、useContext という状態管理の仕組みが用意されている。
＊これは、コンポーネント間でデータを共有するための仕組みです。
useContext は、コンポーネント間でデータを共有するための仕組みです。

Jotai が注目されている３つの理由

1.  Recoil にインスパイアされているので使用感が近い
2.  useState 感覚で利用できるのでキャッチアップしやすい
3.  状態管理ライブラリ３部作の１つであり作者が日本人

## Jotai の基本機能

Jotai におけるグローバルステートは Atom という単位で管理する

```
function Counter() {
   //使いたいところでuseAtomを呼び出す
  const [count, setCount] = useAtom(countAtom);
  //count:現在の値
  //setCount:更新関数

  return (
   <div>
       <p>Count: {count}</p>
       <button onClick={() => setCount(count + 1)}>
           Increment
       </button>
   </div>
  )
}
```

このようにストア（保管庫）を用意しておく。
そして、コンポーネントでは useAtom を呼び出してストアの値を取得して使用する。
こうすることでどこからでもこのストアをインポートして中身を取り出し利用することができる。
更新の方法は useState と変わらないので、同じ感覚で利用できます。

Jotai には派生 Atom という考え方があります。

### 派生 Atom

派生 Atom とは、他の Atom から新しい値を研鑽して作る状態のこと
「読み取り専用派生 Atom」「読み書き可能な派生 Atom」「書き込み可能な派生 Atom」がある

```
const doubleAtom = atom(get => get(countAtom) * 2)

function Counter() {
  const [count, setCount] = useAtom(countAtom)
  const [double] = useAtom(doubleAtom)

```

読み取り Atom は double のようなもので、double は count を 2 倍にした値を常に返します。doubleAtom を使って double の更新(setDoubleAtom のようなもの)はできないので読み取り専用と言えます。
double を更新するには count を更新するしか方法がありません。

```
const doubleAtom = atom(
 get => get(countAtom) * 2,  // 読み取り
 (get, set, newDouble) => set(countAtom, newDouble / 2)  // 書き込み
)

function Counter() {
 const [count, setCount] = useAtom(countAtom)
 const [double, setDouble] = useAtom(doubleAtom)
```

それに対して読み書き可能 Atom であれば doubleAtom を使って更新ができます。(setDouble を使う)

## Convex とは？

Convex は React のデータベースです。
世の中には supabase、Firebase などの BaaS がありますが、Convex はそれらの BaaS とは違ったメリットがあります。

Convex はデータベースのバージョン管理やデータのバックアップ、データのバージョン管理などの機能を提供しています。

スケーラブルあバックエンドアプリケーションを簡単に構築および展開するためのバックエンド（BaaS）プラットフォームです。

特徴は３つあります

1. TypeScript のエンドツーエンド型安全性
   Convexno 型安全性は、データベーススキーマから自動的に型定義が生成され、フロントエンドとバックエンドで一貫した型チェックを実現できる。API の呼び出しやデータ操作において型の不一によるエラーをコンパイル時に検出できる
2. バックエンド実装の簡素化
   データベース操作が直感的な API で提供され、認証、認可の仕組みが組み込まれているため、カスタムのバックエンドインフラを構築する必要がない
3. 認証、認可の組み込み統合
   Convex は認証、認可の仕組みが組み込まれているため、Auth ０や Clerk などの認証プロバイダーと簡単に統合できる

## Let's build env

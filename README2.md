# 本棚アプリ　開発時README

# ファイル構造

- `/main.js` Electronメインプロセス。
- `/view` Elctron レンダープロセス内使用ファイル。
- `/view/init.htmll` 初期設定時のHTML ファイルパスなどの設定。
- `/view/main.html` メインプロセスでのHTML

# 使用ライブラリ

- アイコン: https://icooon-mono.com
- デフォルト壁紙:https://gamerconsul.com
- `node.js`
  - `Electron` (MIT License)
  - `fs-extra` (MIT License)
  - `js-yaml` (MIT License)
- `window`
  - `jquery 3.7.1`(MIT License)
  - `opencv.js` (Apache2 License)
  - `toastr.js` (MIT License)
  - `fuse.js` (Apache2 License)
    使用ライブラリのライセンス表記は`/libraries`内にあります。（コピーライトと別ファイルの場合はこちらで統合。）

# TODO

### v0.1.0

- CSVエクスポート
- カメラを選べるように
- NDCを表示
- 画像パスを相対パスに（変更できるように）
- 画像ないときの代換え画像
- タグ絞り込みの`or`追加
- favicon設定
- インストール時などの設定
  - ファイルパス等の設定
  - ファイルの新規作成
- 保存場所の変更 => ファイルの選択と移動
- タイトルによるあいまい検索

### v0.1.1

- OK: 画像表示・取得の無効化
- OK: TODO: 壁紙の変更などのUI設定
- OK: TODO: 設定変更時の自動再起動

### v0.1.2

- about画面追加
- メニューバーに要素追加

### Todo

- TODO: NDC APIの使用による登録後ジャンル分け
- TODO: 日付での絞り込み
- TODO: 画像を登録できるように(挿絵や、特別表紙など)
- TODO: 実際の本棚のようなUI＆アニメーション

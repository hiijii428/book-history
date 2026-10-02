/**
 * # Electron 本棚アプリ
 * isbnや名称から本を検索し、データーベースに登録できる
 * DB形式: yaml (csvでエクスポートできる)
*/

/****************************/
/*********** debug **********/
/** 開発者ツールのon/off **/
let debug = true;
/****************************/
/****************************/
const {electron,BrowserWindow,app,ipcMain,Menu, dialog, webContents} = require('electron');
const yaml = require('js-yaml');
const path = require('path');
const fs = require('fs-extra');

let home_path = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"];
let setting_json = null;/* setting json path */
const db_name = "db.yaml" /* 変更NG */
if (process.platform.indexOf("win") != -1) {
    setting_json = path.join(home_path, "AppData/local/book_history", "setting.json")
} else {
    setting_json = path.join(home_path, ".local/share/book_history", "setting.json")
}


function init_window_display() {
    // let old_file_json = {};
    let old_file_json = JSON.parse(fs.readFileSync(setting_json))
    let initWindow = new BrowserWindow({ width: 400, height: 400, webPreferences: { preload: __dirname + '/preload.js' } });
    let html_path = 'file://' + __dirname + '/view/init.html';
    initWindow.loadURL(html_path);
    initWindow.setMenu(null);
    if (debug) { initWindow.webContents.openDevTools(); }// developper tool を開く
    initWindow.on('closed', () => {
        initWindow = null;
    });
    ipcMain.once("restart", async (event, arg) => { 
        app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) })
        app.exit(0)
    })
    ipcMain.on("init_setting", async (event, arg) => {
        let folder_path = dialog.showOpenDialogSync(null, {
            properties: ['openDirectory', 'createDirectory'],
            title: 'フォルダを開く',
            defaultPath: arg["default_path"] ?? path.join(home_path, "Documents"),
        })[0];
        console.log(arg["name"]);
        console.log(folder_path)
        file_json = JSON.parse(fs.readFileSync(setting_json))
        file_json[arg["name"]] = folder_path;
        // file_json["data_path"] = "";     /* db,img表示フォルダ */
        // file_json["book_img"] = "";     /* カバーフォルダ */
        fs.writeFileSync(setting_json, JSON.stringify(file_json), "utf8");
        initWindow.webContents.send("file_selected", {
            "dataText": folder_path
        })
    })
    ipcMain.on("db_path_move", async (event, arg) => {
        console.log("db update :move")
        let new_file_json = await JSON.parse(fs.readFileSync(setting_json))
        console.log(new_file_json);
        console.log("new:" + new_file_json["data_path"]);
        console.log("old:" + old_file_json["data_path"]);
        /* data_pathが、昔にあり、今と違うなら */
        if ( old_file_json["data_path"] && (new_file_json["data_path"] != old_file_json["data_path"]) ) {
            fs.moveSync(old_file_json["data_path"], new_file_json["data_path"], { overwrite: true });
        } else if (!old_file_json["data_path"]) {/* 過去ファイルにないなら */
            let yaml_data = [{
    /* 本の内容を登録するjson(形のみ) */
    "title": "はじめに",
    "title_kana": "ハジメニ",
    "author": "Hiijii428",
    "author_kana": null,
    "author_desc": null,

    "descript": fs.readFileSync("README.md").toString(),
    "cover": null,
    "publisher": "Hiijii428",
    "pubdate": "2026.09",

    "price": "000",
    "lang":"JP",
    "page": "000",
    "isbn": "9000000000000",
    "ndc":"000",

    "get_day": "",
    "comment": "<mark>　　左上のペンアイコンからここを編集できます。</mark>",
    "tags": "カンマ区切りで複数のワードを入力できます。",

    "index":0
}]
            fs.writeFileSync(path.join(new_file_json["data_path"],db_name), yaml.dump(yaml_data), "utf8");
        }
        /* book_imgが、昔にあり、今と違うなら */
        if ( old_file_json["book_img"] && (new_file_json["book_img"] != old_file_json["book_img"]) ) {
            fs.moveSync(old_file_json["book_img"], new_file_json["book_img"], { overwrite: true })
        } else if (!old_file_json["book_img"]) {/*過去ファイルにないなら */
            // fs.writeFileSync(new_file_json["book_img"], "", "utf8");
        }
    });
}
function init_setting() {
    //TODO: windows対応 => 要確認
    let root_path = ""
    if (process.platform.indexOf("win") != -1) {
        root_path = path.join(home_path, "AppData/local/book_history")
    } else {
        root_path = path.join(home_path, ".local/share/book_history")
    }
    if (!fs.existsSync(root_path)) {
        fs.mkdirSync(root_path)
    }
    let file_json = {};
    if (fs.existsSync(setting_json)) {
        file_json = JSON.parse(fs.readFileSync(setting_json))
    } else {
        fs.writeFileSync(setting_json, "{}", "utf8");
    }

    //TODO: UIでの入力
    // mainWindow を作成
    if (app.isReady()) {
        init_window_display()
    }
    app.on('ready', async () => {
        init_window_display()
    });

}
function about_window_display() {
    console.log("about_window_display");
    let aboutWindow = new BrowserWindow({ width: 400, height: 400, webPreferences: { preload: __dirname + '/preload.js' } });
    let html_path = 'file://' + __dirname + '/view/about.html';
    aboutWindow.loadURL(html_path);
    aboutWindow.setMenu(null);
    if (debug) { aboutWindow.webContents.openDevTools(); }// developper tool を開く
    aboutWindow.on('closed', () => {
        aboutWindow = null;
    });
    aboutWindow.webContents.on('new-window', (e, url) => {
        if (url.match(/^http/)) {
            e.preventDefault()
            shell.openExternal(url)
        }
    });
}

if (!fs.existsSync(setting_json)  ) {
    init_setting();
} else {
    /******************************************************************************/
    /********************************  MainWindow *********************************/
    /******************************************************************************/
    /******************************************************************************/
    let setting = JSON.parse(fs.readFileSync(setting_json, "utf8"));
    if (setting["data_path"] === undefined || setting["book_img"] === undefined ) {
        init_setting();
        return;
    }
    let root_path = setting["data_path"];
    console.log("data path: " + root_path);
    let cover_path = setting["book_img"];
    console.log("cover path: " + cover_path);
    let db_yaml_path = path.join(setting["data_path"], db_name);
    console.log("db file path: " + db_yaml_path);
    console.log("setting json path: " + setting_json);
    if (!fs.existsSync(db_yaml_path)) {
        let y = {}/* チュートリアルDB */
        let yaml_data = yaml.dump(y);
        fs.writeFileSync(db_yaml_path, yaml_data, "utf8");
    }

    let mainWindow = null;
    console.log("electron start!")

    app.on('ready', async () => {
        // mainWindow を作成
        mainWindow = new BrowserWindow({/* width: 400, height: 400,*/ webPreferences: { preload: __dirname + '/preload.js' } });
        mainWindow.hide()
        let html_path = 'file://' + __dirname + '/view/main.html';
        mainWindow.loadURL(html_path);
        if (debug) { mainWindow.webContents.openDevTools(); }// developper tool を開く
        const template = [{
            label: '編集',
            submenu: [
                {
                    label: "表示設定",
                    click: (menuItem, browserWindow, event) => { mainWindow.webContents.send("setting_request") }
                },
                {
                    label: '環境設定',
                    click: (menuItem, browserWindow, event) => { console.log("init setting"); init_setting() }
                }
            ]
        }, {
            label: "その他",
            submenu:[{
                label: "アプリについて",
                click: (menuItem, browserWindow, event) => { about_window_display(); }
            }]
        }];
        const menu = Menu.buildFromTemplate(template)
        Menu.setApplicationMenu(menu);

        mainWindow.webContents.on('did-finish-load', () => {
            console.log("View");
            mainWindow.show();
        });
        mainWindow.on('closed', () => {
            mainWindow = null;
        });
    });


    /**************************** html との通信用 ***************************/

    ipcMain.on("db_open", (event, arg) => {
        console.log("db open request!");
        let yaml_text = fs.readFileSync(db_yaml_path, "utf8");
        let json = yaml.load(yaml_text);
        for (let i = 0; i < json.length; i++) {
            if (json[i]["cover"]) {
                json[i]["img_path"] = path.join(cover_path, json[i]["cover"])
            }
        }

        mainWindow.webContents.send("openfile", //送信チャンネル名(自分で区別できるように)//
            {   //送信したいデータ一覧//
                dataText: JSON.stringify(json)
            });
    });
    ipcMain.on("text_file_save", async (event, arg) => {
        /**
         * {content: string}
         */
        console.log("Text file Save Request!");
        let save_path = path.join(home_path, "Downloads", "本棚.csv")
        fs.writeFileSync(save_path, arg["content"]);
        mainWindow.webContents.send("text_file_save_res",
            {
                dataText: save_path
            });
    });
    ipcMain.on("file_save", async (event, arg) => {
        /**
         * {url: https://hoge.com/hoge.jpg, path: /hoge/hoge/bookcover/}
         */
        console.log("Web File Save Request!");
        let img_path = path.join(cover_path, arg["filename"])
        console.log(img_path)
        const res = await fetch(arg["url"]/*, { Headers: { "Referer": arg["referer"]??"" } }*/);
        // バイナリデータはarrayBufferメソッドを叩いて取り出す
        const arrayBuffer = await res.arrayBuffer();
        // Uint8ContentsのArrayBuffer型 -> Buffer型に変換
        const buffer = Buffer.from(arrayBuffer);
        fs.promises.writeFile(img_path, buffer);
        mainWindow.webContents.send("file_save_res", //送信チャンネル名(自分で区別できるように)//
            {   //送信したいデータ一覧//
                dataText: arg["filename"]
            });
    });

    ipcMain.on("yaml_add", (event, arg) => {
        json = JSON.parse(arg)
        console.log("Book add request!")
        let yaml_text = fs.readFileSync(db_yaml_path)
        let y = yaml.load(yaml_text)
        json["index"] = y[y.length - 1]["index"] + 1  //一番最新よりも一つ大きな数。
        y.push(json)
        let overwrite = yaml.dump(y);
        fs.writeFileSync(db_yaml_path, overwrite);
    });
    ipcMain.on("yaml_overwrite", (event, arg) => {
        //  arg  { index : yaml_index, data : json  }
        console.log("Book overwrite request!");
        let yaml_text = fs.readFileSync(db_yaml_path)
        let y = yaml.load(yaml_text)
        let index = null;
        for (let i = 0; i < y.length; i++) {
            if (y[i]["index"] == arg["index"]) {
                index = i
            }
        }
        y[index] = arg["data"];
        console.log(y[index]["title"] + "を編集保存");
        let overwrite = yaml.dump(y);
        fs.writeFileSync(db_yaml_path, overwrite);
    });
    ipcMain.on("yaml_rm", (event, arg) => {
        console.log("Book remove request!")
        let yaml_text = fs.readFileSync(db_yaml_path)
        let y = yaml.load(yaml_text)
        let remove_index = null;
        for (let index = 0; index < y.length; index++) {
            if (y[index]["index"] == arg) {
                remove_index = index;
            }
        }
        y.splice(remove_index, 1);
        let overwrite = yaml.dump(y);
        fs.writeFileSync(db_yaml_path, overwrite);
    });
    ipcMain.on("setting_json_overwrite", (event, arg) => {
        /* arg ["key":string key ,"content": string content]  */
        console.log("setting.json overwrite!")
        let set = fs.readJSONSync(setting_json)
        set[arg["key"]] = arg["content"];
        fs.writeFileSync(setting_json, JSON.stringify(set));
        // console.log(set)
    });
    ipcMain.on("setting_open", (event, arg) => {
        console.log("setting json open request!");
        let set = fs.readJsonSync(setting_json)
        mainWindow.webContents.send("setting_openfile", //送信チャンネル名(自分で区別できるように)//
            {   //送信したいデータ一覧//
                dataText: JSON.stringify(set)
            });
    });
    ipcMain.on("file_select", (exent, arg) => {
        let file_path = dialog.showOpenDialogSync(null, {
            properties: ['openFile'],
            title: 'フォルダを開く',
            defaultPath: home_path,
        })??[0];
        console.log(file_path);
        mainWindow.webContents.send("file_selected", {
            dataText: file_path
        })

    })
}

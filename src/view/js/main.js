/**
 * 内容を増やしたければ、jsonとisbn_add_yaml()を変える
        "comment": ユーザーのコメント,
        "get_day": 買った/借りた日時,
        "isbn": ISBN,
        "title": タイトル,
        "title_kana": タイトル（カナ）,
        "publisher": 発行者,
        "pubdate": 発行日,
        "author": 著者,
        "author_kana": 著者カナ,
        "author_desc": 著者詳細,
        "descript": 内容詳細,
        "cover": 写真,
        "price": 値段,
        "lang": 言語,
        "page": ページ数
 *
 */

/****************************/
/*********** debug **********/

let debug_img_disabled = "disabled"  //enable => ""  画像をストップするか否か

/****************************/
/****************************/

let db = null
let setting_json = {};

let example_json = {
    /* 本の内容を登録するjson(形のみ) */
    "title": null,
    "title_kana": null,
    "author": null,
    "author_kana": null,
    "author_desc": null,

    "descript": "",
    "cover": null,
    "publisher": null,
    "pubdate": null,

    "price": null,
    "lang": null,
    "page": null,
    "isbn": null,
    "ndc":null,

    "get_day": "",
    "comment": "",
    "tags": null,

    "index":null
}
let jp_json = {
    /* 本の内容を登録するjson(形のみ) */
    "comment": "コメント",
    "get_day": "貸出/購入日",
    "isbn": "ISBN",
    "title": "タイトル",
    "title_kana": "タイトル(カナ読み)",
    "publisher": "発行元",
    "pubdate": "発行日",
    "author": "著者",
    "author_kana": "著者(カナ読み)",
    "author_desc": "著者紹介",
    "descript": "本の詳細",
    "cover": "表紙のファイル名",
    "price": "価格",
    "lang": "言語",
    "page": "ページ数",
    "ndc": "NDC分類",
    "tags": "タグ",
    "index": "登録番号"

}
let default_setting = {
    "ndl_search": false,
    "img_get_display": false,
    "ndc_display": true,
    "bg_img":"default"
}

let card_sort = "get_day";
let a2z = true;
function load() { /* カード読み込み Api -> Json -> card_set() */
    window.api.send("db_open", "Hey!"); // Send
    window.api.once("openfile", async(res_db) => {
        await window.api.send("setting_open", "Hey!"); // Send
        await window.api.once("setting_openfile", (arg2) => {/* setting file read */
            console.log(arg2["dataText"])
            setting_json = JSON.parse(arg2["dataText"]);
            for (let k of Object.keys(default_setting)) {
                if (setting_json[k] === undefined) { /*  if not setting => edit */
                    window.api.send("setting_json_overwrite", { "key": k, "content": default_setting[k] })
                    setting_json[k] = default_setting[k];
                }
            }
            if (setting_json["bg_img"] == "default") {
                document.body.style = "background:url('./img/bg/default.png');"
            } else {
                document.body.style = "background:url('" + setting_json["bg_img"] + "');"
            }

            db = JSON.parse(res_db.dataText);
            // console.log(db);
            /* Sort Html */
            $("#card_sort").html(``);
            for (let key of Object.keys(example_json)) {
                if (key == card_sort) {
                    $("#card_sort").append(`<option value="${key}" selected>${jp_json[key]}</option>`);
                } else {
                    $("#card_sort").append(`<option value="${key}">${jp_json[key]}</option>`);
                }
            }

            let true_selected = ""; let false_selected = "";
            if (a2z) {
                true_selected = "selected";
            } else {
                false_selected = "selected";
            }
            $("#a2z_sort").html(`
                <option value=1 ${true_selected}>昇順</option>
                <option value=0 ${false_selected}>降順</option>
            `);

            card_set();
        });
    });
}

/****************************************************************/
/********************                   *************************/
/********************      frontend      *************************/
/********************                   *************************/
/****************************************************************/

function card_set() {
    /* dbからカードに反映 */
    let sort_db = structuredClone(db);
    // console.log(sort_db);
    if ($("card_sort")) {
        card_sort = $("#card_sort").val();
        a2z = Boolean(Number($("#a2z_sort").val()));
    }
    // console.log("sort:" + card_sort);
    // console.log("sort: a to z:" + a2z);
    if (a2z) {
        sort_db.sort((a, b) => { if (a[card_sort] > b[card_sort]) { return 1; } else { return -1; } });//昇順
    } else {
        sort_db.sort((a, b) => { if (a[card_sort] < b[card_sort]) { return 1; } else { return -1; } });//降順
    }

    let box = $("div#book-box")
    box.html("");
    let book_tag = [];
    for (let i = 0; i < sort_db.length; i++) {
        book = sort_db[i];
        let tag_class = null;
        if (book.tags) {
            tag_class = (book.tags).replaceAll(new RegExp(/,|\s/g), " ");
            let tag_list = tag_class.split(" ");
            for (let tag of tag_list) {
                let exist = false;
                for (let j = 0; j < book_tag.length; j++) {
                    if (tag == book_tag[j]["name"]) {
                        book_tag[j]["num"]++ //数増やす
                        exist = true; //フラグ立てる
                        break;
                    }
                }
                if (!exist) { //どこにも存在しないなら
                    book_tag.push({ "name": tag, "num": 1 });
                }
            }
        }
        let img_class = ""
        if (!setting_json["img_get_display"]) { img_class = "none_img" }
        let ndc = ""
        if(setting_json["ndc_display"]){ndc = `<div class="ndc">NDC: ${(book.ndc)?.split(".")[0]}</div>`}
        box.append(
            `<div class='card ${tag_class} ${img_class} book${book.index}' id='db${book.index}' onclick="comment_show(${book.index})">
                ${ndc}
                <img src='${book.img_path}' onerror="this.src='img/no-cover.png'" width=200/>
                <h3>${book.title}</h3>
                <p>${book.author}</p>
                <p>isbn: ${book.isbn}</p>
                <p>貸出/購入日: ${book.get_day}</p>
            </div>`)
    }
    // console.log(book_tag);
    $("#sum").html(`<span id="select_num">${sort_db.length}</span>件/${sort_db.length}件`)
    $("#tag_list").html(``)
    book_tag.sort((a, b) => { if (a.num < b.num) { return 1; } else { return -1; } });//降順
    for (let tag of book_tag) {
        $("#tag_list").append(`
            <span class="journal_tag " id="${tag.name}" onclick="tag_select('${tag.name}')"> ${tag.name}:${tag.num}件 </span>
        `);
    }
    sort_db = null;
}
function tag_select(myid) { /* journal_tagで絞り込み */
    let option = $("#tag_select_option").val();
    console.log(option)
    $('#' + myid).toggleClass('select_tag');    //ボタンにフラグを立てる
    $('div#book-box div.card').css('display', 'none');//すべて消す

    let selected_tag = null;
    let show_class = null
    if (option === "or") {
        show_class = [];
        $('.journal_tag.select_tag').each(function() { //オブジェクトを選択、関数を回す。
            show_class.push('div#book-box div.card.' + $(this).attr("id"));//選択したボタンのIDをshow_classに代入
        });
        if(show_class.length == 0){show_class.push('div#book-box div.card')}
        selected_tag = $(show_class.join(", "));
    } else if (option === "and") {
        show_class = '';
        $('.journal_tag.select_tag').each(function() { //オブジェクトを選択、関数を回す。
            show_class += '.' + $(this).attr("id");//選択したボタンのIDをshow_classに代入
        });
        selected_tag = $('div#book-box div.card' + show_class);
    }
    selected_tag.css('display', 'inline-block');    //要素の表示 (ないなら、全て当てはまる)
    console.log(show_class);
    $("#select_num").html(selected_tag.length);

}
async function make_card() { /* 手動入力から情報作成 */
    let forms = $("div#input_form input, div#input_form textarea")
    let json = example_json;
    json["index"] = db.length;
    forms.each((index, elem) => {
        let key = $(elem).prop("id")
        json[key] = $(elem).val()
    })
    console.log(json);
    await window.api.send("yaml_add", json); // Send
    info_toast("本を追加しました。")
    load();
}
async function writer_view(e) { /* 内容編集のプロンプト */
    let book;
    for (let i of db) {
        if (i.index == e) {
            book = i;
            break;
        }
    }
    let keys = Object.keys(example_json)
    let html = "";
    for (let k of keys) {
        let style = ""
        if (Object.keys(book).indexOf(k) < 0 || !book[k]) { //bookにキーがないなら
            style = "background-color:#ff5a5a"
        }
        html += `<button style="${style}" onclick="write_content(${e},'${k}')">${jp_json[k]}</button>`
    }
    window_prompt("編集するものをクリック<br>"+html)
}
async function write_content(index, key) { /* 編集のinputプロンプト */
    let book;
    for (let i of db) {
        if (i.index == index) {
            book = i;
            break;
        }
    }
    let res = await window_prompt(`${jp_json[key]}を入力<br>`, { "textarea": true ,"input_value":book[key]})
    if (res) {
        book[key] = res.replaceAll("\n", "<br>");
        window.api.send("yaml_overwrite", { "index": index, "data": book }); // Send
        info_toast("保存しました。")
        load()
    }
}
function comment_show(e) { /* 詳細の表示 */
    let book;
    for (let i of db) {
        if (i.index == e) {
            book = i;
            break;
        }
    }
    if (book.descript) {
        book.descript = (book.descript).replaceAll("\n", "<br>")
    }
    // console.log(book);
    let img_class=""
    if(!setting_json["img_get_display"]){img_class = "none_img"}

    let desc_card = $("#desc_card");
    desc_card.html(`
                <button class="edit_button icon_button" onclick="writer_view(${e})"></button>
                <button class="remove_button icon_button" onclick="book_rm(${e})"></button>
                <div class='${img_class}' style="text-align:center;width:100%;">
                <img  src='${book.img_path}'  onerror="this.src='img/no-cover.png'" width=200/></div>
                <h2>${book.title} / ${book.title_kana}</h2>
                <p>自分のコメント：<br>${book.comment}</p>
                <p>貸出/購入日: ${book.get_day}</p><hr>
                <p>isbn: ${book.isbn}</p><hr>
                <p>${book.descript}</p><hr>
                <p>著者: ${book.author} (${book.author_kana})</p>
                <p>著者紹介: ${book.author_desc}</p><hr>
                <table>
                    <td>ページ数: ${book.page ?? ""}p</td>
                    <td>言語: ${book.lang ?? ""}</td>
                    <td>定価:￥${book.price ?? ""}</td>
                    <td>NDC:${book.ndc ?? ""}</td>
                </table>
                <p>Tags: ${book.tags}</p>
            `);
    desc_card.show()
    $("#back_black").show()
}
async function book_rm(index) {
    let book;
    for (let i of db) {
        if (i["index"] == index) {
            book = i;
            break;
        }
    }
    let result = await window_prompt(book.title + "を削除しますか？", { "Nobutton": true })
    if (result) {
        window.api.send("yaml_rm", index);
        load()
    }  else {/* 何もしない */}
}
function setting(){
        let desc_card = $("#desc_card");
    desc_card.html(`
        <h2>設定</h2>
        <p style="border-bottom:1px solid #aaa;">インターフェンス</p>
        <div class="other_input" style="width:80%;display:block;">
            <label>壁紙を変更する:
            <input class="other_button" style="background:#ddd;" type="text" id="bg_img_string" placeholder="初期値は\`default\`">
            <button style="width:fit-content;" class="other_button" id="bg_img">開く</button>
            </label>
        </div>
        <div class="other_input" style="width:80%;display:block;">
            <label>
            NDC(日本十進分類法)を表示する:
            <input type="checkbox" value="true" id="ndc_display"><br>
            数字3、4桁の書誌分類番号
            </label>
        </div>
        <p style="border-bottom:1px solid #aaa;">本の取得</p>
        <div class="other_input" style="width:80%;display:block;">
            <label>
            画像を取得・表示する: <b>${debug_img_disabled}</b>
            <input ${debug_img_disabled} type="checkbox" value="true" id="img_get_display"/>
            </label>
        </div>
        <div class="other_input" style="width:80%;display:block;">
            <label>
            NDL（国立国会図書館）APIを必ず使用する:
            <input type="checkbox" value="true" id="ndl_search"/><br>
            （通信時間が長くなります。Max 5-10s）
            </label>
        </div>
        <button id="submit" class="other_button">適用</button>
    `)
    desc_card.show()
    $("#back_black").show()

    $('#ndl_search').prop('checked', Boolean(setting_json["ndl_search"]));
    $('#img_get_display').prop('checked', Boolean(setting_json["img_get_display"]));
    $('#ndc_display').prop('checked', Boolean(setting_json["ndc_display"]));
    $("#bg_img_string").val(setting_json["bg_img"])

    $("#bg_img").click(async () => {
        console.log("file select")
        await window.api.send("file_select",{"name":"bg_img"});
        await window.api.once("file_selected",(arg)=>{
            console.log(arg["dataText"]);
            $("#bg_img_string").val(arg["dataText"]);
        })
    })
    $("#submit").click(() => {
        console.log("save...")
        window.api.send("setting_json_overwrite", {
            "key": "ndl_search", "content": $("#ndl_search").prop("checked")
        })
        window.api.send("setting_json_overwrite", {
            "key": "bg_img", "content": $("#bg_img_string").val()??"default"
        })
        window.api.send("setting_json_overwrite", {
            "key": "img_get_display", "content": $("#img_get_display").prop("checked")
        })
        window.api.send("setting_json_overwrite", {
            "key": "ndc_display", "content": $("#ndc_display").prop("checked")
        })
        info_toast("保存しました。");
        load();
    })
}
/****************************************************************/
/********************                   *************************/
/********************       toast       *************************/
/********************                   *************************/
/****************************************************************/
function error_toast(text){
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": true,
        "progressBar": false,
        "positionClass": "toast-top-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }
    toastr["error"](text, "エラー")
}
function info_toast(text){
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": true,
        "progressBar": false,
        "positionClass": "toast-top-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }
    toastr["info"](text, "情報");
}
function warn_toast(text){
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": true,
        "progressBar": false,
        "positionClass": "toast-top-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }
    toastr["warning"](text, "警告");
}
/****************************************************************/
/********************                   *************************/
/********************     user input    *************************/
/********************                   *************************/
/****************************************************************/

$("#card_sort").change(() => { card_set(); });
$("#a2z_sort").change(() => { card_set(); });
$("#back_black").click(() => {
    $("#desc_card").hide();
    $("#back_black").hide();
    $("#desc_card").html("");
})
$("#camera_button").click(() => {
    camera_isbn();
})
$('#isbn_button').click(() => {
    let html = "<div id='input_form'>"
    for (let key of Object.keys(example_json)) {
        if (key == "title") {
            html += `<label>${jp_json[key]}:<input class="other_input" required id="${key}"></label><br>`
        }else if (key == "index") {
        } else {
            html += `<label style="display: inline-flex;">${jp_json[key]}:<textarea class="other_input" id="${key}"></textarea></label><br>`
        }
    }
    html += "</div><button class='other_button' onclick='make_card()'>追加</button>"
    let desc_card = $("#desc_card");
    desc_card.html(`
    <div style="text-algin:center;">
        <h4>自動検索</h4>
        <p>ISBNを入力するか、ISBNが入ったCSVファイルをアップロードしてください。</p>
        <label style="display:block;">
            ISBN13:<input class="other_input" id="isbn_value" placeholder="9780000000000" type="number"/>
            <button class="other_button" onclick="isbn_button()" id="isbn_button">検索</button>
        </label>
        <label style="display:block;">CSV:<input class="other_input" accept=".csv" type="file" id="list"/></label>
        <label style="display:block;">事前にタグをつける：<input class="other_input" type="text" id="csv_taglist"/></label>
            <button class="other_button" onclick="csv_isbn_button()">抽出</button>
        <hr>
        <h4>手動で入力</h4>
        <p>各情報を入力してください。タイトルは必須</p>
        ${html}
    </div>
            `);
    desc_card.show()
    $("#back_black").show()

});
$("#export_button").click(async () => {
    let keys = Object.keys(example_json);
    let csv = "";
    for (let k of keys) {
        console.log(k)
        csv += jp_json[k] + ", ";
    } csv += "\n";
    for (let book of db) {
    for (let k of keys) {
        csv += "\""+book[k] + "\", ";
    }
    csv += "\n";
    }
    console.log(csv)
    await window.api.send("text_file_save", {
        "content": csv
    })
    await window.api.once("text_file_save_res", (arg) => {
        info_toast(`エクスポートしました。\n${arg["dataText"]}`)
    })
})
$("#all_display").click(() => {
    let display_elem = $("div#book-box div.card")
    display_elem.css('display', 'inline-block');
    $("#select_num").html(display_elem.length);
})
$("#string_search").change(() => {
    let search_text = $("#string_search").val()
    console.log(search_text);
    let fuse = new Fuse(db, {
        keys: ['title','title_kana', 'descript', 'tags', 'author','author_kana'],
        includeScore: true,   // 結果にscoreを含める
        ignoreLocation: true, // 文字列のどこに一致してもよい
        threshold: 0.3,       // 小さいほど厳しく、大きいほど広くヒットする
    });
    let search_res = fuse.search(search_text);
    console.log(search_res);

    $('div#book-box div.card').css('display', 'none');//すべて消す

    show_class = [];
    let show_class_string = "";
    $('.journal_tag.select_tag').each(function() {/* tagで絞り込み */
        show_class_string += "."+$(this).attr("id");
    });
    for(let s of search_res){/* book00などで絞り込み */
        show_class.push(`div#book-box div.card${show_class_string}.book` + s.item.index);
    }
    selected_tag = $(show_class.join(", "));
    console.log(show_class);
    selected_tag.css('display', 'inline-block');    //要素の表示 (ないなら、全て当てはまる)
    $("#select_num").html(selected_tag.length);


})
$("#setting_button").click(() => {
    setting()
})
window.api.once("setting_request", () => {
    setting();
})
/****************************************************************/
/********************                   *************************/
/********************      backend      *************************/
/********************                   *************************/
/****************************************************************/


/**
 * www.kinokuniya.co.jp/f/dsg-01-ISBN
 * https://api.openbd.jp/v1/get?isbn=ISBN&pretty
 * https://ndlsearch.ndl.go.jp/api/sru?operation=searchRetrieve&query=isbn=ISBN
 * https://ndlsearch.ndl.go.jp/api/opensearch?isbn=ISBN
 */
async function isbn_add_yaml(isbn,tags=null) {/* 引数のISBNをyamlに登録 */
    isbn = isbn.replaceAll("-", "");
    console.log("ISBN search start!");
    for (let book of db) {
        if (book["isbn"] == isbn) {
            warn_toast("すでに登録されています。")
            return;
        }
    }
    let json = structuredClone(example_json);
    let img_url = null
    /* OpenBD(book data)を叩く */
    console.log('https://api.openbd.jp/v1/get?isbn=' + isbn + '&pretty')
    let data = await fetch('https://api.openbd.jp/v1/get?isbn=' + isbn + '&pretty');
    data = await data.json()
    console.log(data)
    json["isbn"] = isbn;              //isbn
    if (data[0] != null) {
        json["title"] = data[0]["summary"]["title"]            //title
        json["title_kana"] = data[0]?.["onix"]?.["DescriptiveDetail"]?.["TitleDetail"]?.["TitleElement"]?.["TitleText"]?.["collationkey"]//titleカナ
        json["publisher"] = data[0]["summary"]["pubrisher"] + "  " + data[0]["summary"]["series"]   //発行元
        json["pubdate"] = data[0]["summary"]["pubdata"]        //発行日
        json["author"] = data[0]["summary"]["author"].replace(",", " ")          //著者

        json["author_desc"] = data[0] ?. ["onix"] ?. ["DescriptiveDetail"] ?. ["Contributor"] ?. [0] ?. ["BiographicalNote"];//著者 詳細
        json["author_kana"] = data[0]?.["onix"]?.["DescriptiveDetail"]?.["Contributor"]?.[0]?.["PersonName"]?.["collationkey"]?.replace(",", " "); //著者（カナ）

        json["price"] = data[0] ?. ["onix"] ?. ["ProductSupply"] ?. ["SupplyDetail"] ?. ["Price"] ?. [0] ?. ["PriceAmount"]; //金額
        json["lang"] = data[0] ?. ["onix"] ?. ["DescriptiveDetail"] ?. ["Language"] ?. [0] ?. ["CountryCode"];//言語
        json["page"] = data[0]?.["onix"]?.["DescriptiveDetail"]?.["Extent"]?.[0]?.["ExtentValue"] //ページ数
        let desc_data = data[0]?.["onix"]?.["CollateralDetail"]?.["TextContent"]; //本の詳細
        if (desc_data) {
            for (l of desc_data) {
                json["descript"] += l["Text"] + "<br>　"
            }
        }
        img_url = data[0]["summary"]["cover"];
    }
    if(data[0] == null || setting_json["ndl_search"] === true){
    //NDL叩く
        let text = await fetch("https://ndlsearch.ndl.go.jp/api/opensearch?isbn=" + isbn)
        text = await text.text()
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "text/xml");
        let doc = xml.getElementsByTagName("item")[0]
        if (doc) {
            json["title"] = doc.getElementsByTagName("title")[0].innerHTML;
            console.log(json["title"])
            json["title_kana"] = doc.getElementsByTagName("dcndl:titleTranscription")[0]?.innerHTML;
            json["author"] = doc.getElementsByTagName("author")[0]?.innerHTML;
            json["publisher"] = doc.getElementsByTagName("dc:publisher")[0]?.innerHTML;
            json["lang"] = doc.getElementsByTagName("dcndl:publicationPlace")[0]?.innerHTML;
            json["pubdate"] = doc.getElementsByTagName("dcterms:issued")[0]?.innerHTML;
            json["page"] = doc.getElementsByTagName("dc:extent")[0]?.innerHTML.replace("p", "");
            json["price"] = doc.getElementsByTagName("dcndl:price")[0]?.innerHTML.replace("円", "");

            const subjects = xml.getElementsByTagNameNS("http://purl.org/dc/elements/1.1/", "subject");
            for (let s of subjects) { if (s.getAttribute("xsi:type") === "dcndl:NDC10") { json["ndc"] = s.textContent } }

            json["descript"] += doc.getElementsByTagName(`link`)[0]?.innerHTML + "(国立国会図書館リンク)\n";
            console.log(json);
        }
    }
    if (json["title"] == null || json["title"] == "") {
        console.log(json["title"])
        console.log(typeof json["title"])
        error_toast("該当する本が見当たりませんでした。")
        return;
    }
    json["descript"] = json["descript"]?.replaceAll("\n", "<br>");
    json["tags"] = tags??""
    if (!img_url && setting_json["img_get_display"]) {
        /* ISBN13 to 10 */
        //https://www.kinokuniya.co.jp/images/goods/ar2/web/imgdata2/large/40410/4041067472.jpg
        //isbn10 の上五桁/１０桁
        /*    0 1 2 3 4 5 6 7 8 桁
         *   10 9 8 7 6 5 4 3 2
         */
        let isbn9 = isbn.split("").slice(3, 12)
        let isbn_5 = isbn.split("").slice(3, 8).join("");
        let sum = 0;
        for (let i = 10; i > 1; i--) {
            sum += Number(isbn9[10 - i]) * i;
        }
        console.log("sum:" + sum)
        let isbn10 = isbn9.join("") + String(11 - sum % 11)
        if(sum % 11 === 0){isbn10 = isbn9.join("") + "0"}
        console.log("isbn10: " + isbn10);
        img_url = `https://www.kinokuniya.co.jp/images/goods/ar2/web/imgdata2/large/${isbn_5}/${isbn10}.jpg`
        console.log("get img: "+img_url)
        /* 画像が取得できるなら、nodejsで取得後保存。 */
        console.log("img save")
        let url_split = img_url.split("/")
        let file_ext = url_split[url_split.length - 1].split(".")[1]
        await window.api.send("file_save", { "url": img_url, "filename": isbn + "." + file_ext ,"referer":"https://www.books.or.jp/" }); // Send
        console.log("img save...");
        await window.api.once("file_save_res", async (arg) => {
            console.log("img save ok");
            console.log(arg)
            json["cover"] = arg["dataText"];
            await window.api.send("yaml_add", json); // Send
            info_toast(`本を追加しました。(${json["title"]})`)
            json = null;
            load();
            return;
        });
    } else {
        await window.api.send("yaml_add", json); // Send
        info_toast(`本を追加しました。(${json["title"]})`)
        json = null;
        load()
    }
}
async function camera_isbn() {/* Web Camからisbn取得 */
    let desc_card = $("#desc_card");
    desc_card.html(`
<select id="camera_select" style="margin-block:0;" class="other_input"></select><br>
<label>事前にタグをつける:<input class="other_input" style="margin-block:0;" typa="text" id="camera_taglist"/></label>
<video style="width:90%;" class="camera_video" id="player" controls playsinline muted autoplay></video>
<canvas style="display:none;" id="canvasOutput"></canvas>
<span id="isbn_check"></span>
`)
    desc_card.show()
    $("#back_black").show()
    const video = document.getElementById('player');

    const devices = await navigator.mediaDevices.enumerateDevices();
    let cameras = []
    for (let d of devices) {
        if (d["kind"] == "videoinput") {
            $("#camera_select").append(`<option value="${d["deviceId"]}">${d["label"]}</option>`)
            cameras.push(d)
            console.log(d["label"])
        }
    }
    console.log(cameras)

    try {
        const constraints = {
            video: {
                deviceId: { exact: cameras[0]["deviceId"] }
            },
            audio: false
        };
        let stream = await navigator.mediaDevices.getUserMedia(constraints)
        video.srcObject = stream;

        $("camera_select").change(async () => {
            stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId:{ exact: $("camera_select").val }}, audio:false})
            video.srcObject = stream;
        })

        async function capture() {
            cap = new cv.VideoCapture(player);
            src = new cv.Mat(player.height, player.width, cv.CV_8UC4);
            dst = new cv.Mat();
            cap.read(src);
            cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
            cv.imshow('canvasOutput', dst);
            src.delete();

            let detector = new cv.barcode_BarcodeDetector();
            let text = detector.detectAndDecode(dst);
            if (String(text).indexOf("97") != -1) {
                console.log(text);
                $(`#isbn_check`).html(`<p class="p_markup">検出ISBN：${text}</p>`);
                info_toast("本を追加します。ISBN：" + text);
                let tags = $("camera_taglist").val
                isbn_add_yaml(text, tags);
                $("#back_black").click()
                return;
            }
            setTimeout(capture, 700);
        }
        player.addEventListener('canplay', () => {
            player.width = player.videoWidth; // width, heightを設定しないとcap.read(src)で失敗する。
            player.height = player.videoHeight;
            capture();
        })
    } catch (e){
        console.log(e);
        error_toast(e);
    }
}
function isbn_button() {/**単一でisbnの登録リクエスト */
    console.log("ISBN Search!");
    let isbn = $("#isbn_value").val()
    isbn = isbn.match(new RegExp("[0-9]{13}"))[0];
    if (!isbn) {
        error_toast("有効なISBNを入力してください。");
        return;
    } else {
        info_toast("本を登録します。")
    }
    console.log(isbn);
    try {
        isbn_add_yaml(isbn);
    } catch(e){
        error_toast("エラーが発生しました。<br>"+e)
    }
};
function csv_isbn_button() {/** isbnが含まれたcsvから、isbnを抽出、一つずつ検索かける */
    let tags = $("#csv_taglist").val
    let csv = $("#list")[0].files[0]
    if (csv) {
        const reader = new FileReader();
        // ファイル読み込みが完了した時のイベントハンドラ
        reader.onload = (event) => {
            const content = event.target.result; // ファイルの内容を取得
            console.log('ファイルの内容:', content);
            lines_csv = content.split("\n");
            console.log(lines_csv);
            isbn_list = []
            for (line of lines_csv) {
                line = line.split(",");
                for (l of line) { //,で区切った要素すべて見る
                    l = l.replaceAll("-", "") //ハイフンなくし
                    console.log(l)
                    let res = l.match(new RegExp("[0-9]{13}")); //数字13繰り返しにマッチか
                    let res2 = l.match( new RegExp("[0-9]{10}") );
                    if (res /*|| res2*/) {
                        isbn_list.push(l) //マッチならisbn_listに代入
                    }
                }
            }
            console.log(isbn_list);
            for (let n = 0; n < isbn_list.length; n++) {
                setTimeout(() => {
                    info_toast(`${n}/${isbn_list.length}件目の本を検索`)
                    isbn_add_yaml(isbn_list[n], tags);
                }, (n * 5000));
            }

        };
        reader.onerror = () => {
            error_toast('ファイルが正常に読み込めませんでした。');
        };
        reader.readAsText(csv, 'UTF-8'); // 第二引数で文字コードを指定可能
    } else {
        error_toast("ファイルを選択してください。");
    }
}

load()

/**
 * 作成者　HIIJII428
 */

async function window_prompt(str, setting = { "input": null, "textarea": null, "input_value": null, "subtitle": null, "Nobutton": false }) {
    /*
    Electronなど、window.promptが使用できないときに使用する関数
    第一引数にプロンプトに表示する文字列をString式で渡し、
    第二引数にsettingの辞書型を渡します。
    戻り値には true(OKが押されたとき) false(NOが押されたとき)　任意の文字列({"input":true}で入力された場合)

    settingに渡す辞書型は下記のものがあります。
    サブタイトル        "subtitle": subtitle[string]
    Nobuttonの有無      "Nobutton": true/false
    文字列入力の可否    "input": true/false
    複数行入力の可否    "textarea" true/false
        input/textareaがtrueのみ使用 初期状態に入力    input_value

    例
    window_prompt("文字列を入力してください",{"input":true})
    window_prompt("この内容でいいですか？",{"input":false})
    */

    let input_html="", subtitle="", nobutton="";
    if(setting["subtitle"]){subtitle = `<p>`+setting["subtitle"]+`</p>`}
    if(setting["Nobutton"]){nobutton = `<button id="prompt_NO">NO</button>`}
    if(setting["input"]){
        input_html=`<input type="input" value="${setting["input_value"]}" id="prompt_input">`;
        nobutton = `<button id="prompt_NO">NO</button>`;
    }
    if(setting["textarea"]){
        input_html=`<textarea id="prompt_input">${setting["input_value"]}</textarea>`;
        nobutton = `<button id="prompt_NO">NO</button>`;
    }
    let prompt = document.getElementById("tool_div");
    prompt.innerHTML = `
    <div id="window_prompt" class="window_prompt">
        <div class="prompt_content">
            <h3>`+str+`</h3>`+subtitle+input_html+`
            <div class="button_div">
                <button id="prompt_OK">OK</button>
                `+nobutton+`
            </div>
        </div>
    </div>`;

    let return_str = "";
    return await new Promise((resolve) => {
        document.getElementById("prompt_OK").addEventListener("click",function(){
            if(setting["input"] || setting["textarea"]){
                return_str = document.getElementById("prompt_input").value;//入力欄があったら入力値を返す
            }else{
                return_str = true;//入力欄がなかったらtrueを返す
            }
            document.getElementById("window_prompt").remove();
//            prompt.innerHTML="";//中身を消す
            resolve(return_str);
        });
        if( document.body.contains( document.getElementById("prompt_NO") ) ){
        document.getElementById("prompt_NO").addEventListener("click",function(){
            document.getElementById("window_prompt").remove();
//            prompt.innerHTML="";//中身を消す
            return_str = false;//falseを返す
            resolve(return_str);
        });
    }
    });
}

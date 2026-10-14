class DB_Bridge{
    open() {
        return new Promise(async (resolve, reject) => {
            try {
                window.api.send("db_open", "Hey!"); // Send
                window.api.once("openfile", async (res_db) => {
                    resolve(res_db);
                });
            } catch {
                reject("File Error!");
            }
        })
    }
    add(json) {
        return new Promise(async (resolve, reject) => {
            try {
                await window.api.send("yaml_add", json)
                resolve();
            } catch {
                reject("File Error!");
            }
        })
    }
    edit(index,book_data) {
        return new Promise(async (resolve, reject) => {
            try {
                window.api.send("yaml_overwrite", { "index": index, "data": book_data }); // Send
                resolve();
            } catch {
                reject("File Error!");
            }
        })
    }
    remove(index) {
        return new Promise(async (resolve, reject) => {
            try {
                window.api.send("yaml_rm", index);
                resolve();
            } catch {
                reject("File Error!");
            }
        })
    }

    setting_open() {
        return new Promise(async (resolve, reject) => {
            try {
                window.api.send("setting_open", "Hey!"); // Send
                window.api.once("setting_openfile", async (res_db) => {
                    resolve(res_db);
                });
            } catch {
                reject("File Error!");
            }
        })
    }
    setting_edit(key, data) {
        return new Promise(async (resolve, reject) => {
            try {
                window.api.send("setting_json_overwrite", { "key": key, "content": data });
                resolve()
            } catch {
                reject("File Error!");
            }
        })
    }
}
class tool{
    file_open() {
        return new Promise(async (resolve, reject) => {
            try {
                await window.api.send("file_select",{"name":"bg_img"});
                await window.api.once("file_selected",(arg)=>{
                    resolve(arg);
                })
            } catch {
                reject("File Error!");
            }
        })
    }
    file_download(file_data) {
        return new Promise(async (resolve, reject) => {
            try {
                await window.api.send("text_file_save", { "content": file_data })
                await window.api.once("text_file_save_res", (arg) => {
                    resolve(arg);
                })
            } catch {
                reject("File Error!");
            }
        })
    }
    binary_save(url, path) {
        return new Promise(async (resolve, reject) => {
            try {
                await window.api.send("file_save", { "url": url, "filename": path }); // Send
                await window.api.once("file_save_res", async (arg) => {
                    resolve(arg);
                });
            } catch {
                reject("File Error!");
            }
        })
    }
}

new Promise((resolve, reject) => {
    let a = 1
    if (a === 1){
        resolve("success")
    }else {
        reject("fail");
    }

}).then((res) => {
    console.log("then " + res);
}).catch(err => console.log(err)); // Error: Whoops!
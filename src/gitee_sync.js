var GiteeSync = (function () {
    function GiteeSync() {

    }

    GiteeSync.syncRemoteConfig = function (success, fail) {
        chrome.storage.local.get(null, function (allObj) {
            let giteeobj = allObj.gitee;
            if (!giteeobj) {
                return;
            }
            let token = giteeobj.token;
            let user = giteeobj.user;
            let repo = giteeobj.repo;
            let config = giteeobj.config;

            if (!(token && user && repo && config)) {
                return;
            }
            fetch(`https://gitee.com/api/v5/repos/${user}/${repo}/contents/${config}?access_token=${token}`, {
                method: 'get',
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8'
                },
            }).then((response) => response.json()).then((response) => {
                    let content = response.content;
                    let obj = []
                    obj = JSON.parse(Base64.decode(content))
                    if (typeof obj === "object") {
                        // 清除本地已有的
                        chrome.storage.local.clear()
                        obj.gitee = giteeobj;//把配置信息还原
                        chrome.storage.local.set(obj, function () {
                            if(success){
                                success();
                            }
                            console.log("sync from remote successfully")
                        });
                    }
                }
            ).catch(err => {
                if (fail) {
                    fail(err)
                }
            })
        })
    }
    GiteeSync.uploadConfig = function (gitee_config, success, fail) {
        chrome.storage.local.get(null, function (allObj) {
            let giteeobj = gitee_config ? gitee_config : allObj.gitee;
            if (!giteeobj) {
                return;
            }
            let token = giteeobj.token;
            let user = giteeobj.user;
            let repo = giteeobj.repo;
            let config = giteeobj.config;

            allObj.gitee = {}
            let rulesstr = JSON.stringify(allObj)

            if (!(token && user && repo && config)) {
                return;
            }
            fetch(`https://gitee.com/api/v5/repos/${user}/${repo}/contents/${config}?access_token=${token}`, {
                method: 'get',
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8'
                },
            }).then((response) => {
                if (response.status !== 200) {
                    return Promise.reject("code:" + response.status + ",message:" + response.statusText)
                } else {
                    return response.json()
                }
            }).then((response) => {
                let sha = response.sha;
                fetch(`https://gitee.com/api/v5/repos/${user}/${repo}/contents/${config}`, {
                    method: 'put',
                    headers: {
                        'Content-Type': 'application/json;charset=UTF-8'
                    },
                    body: JSON.stringify({
                        access_token: token,
                        content: Base64.encode(rulesstr),
                        sha: sha,
                        message: "custom blocker update"
                    })
                }).then((response) => {
                    if (response.status !== 200) {
                        return Promise.reject("code:" + response.status + ",message:" + response.statusText)
                    } else {
                        return response.json()
                    }
                }).then((response) => {
                    if (success) {
                        success()
                    }
                }).catch(error => {
                    if (fail) {
                        fail(error)
                    }
                })
            }).catch(error => {
                if (fail) {
                    fail(error)
                }
            })
        });
    }
    return GiteeSync;
}())

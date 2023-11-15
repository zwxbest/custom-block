window.onload = function () {
    CustomBlockerUtil.processPage();

    chrome.storage.local.get(null, function (allObj) {

        let gitobj = allObj["gitee"]
        document.getElementById("input-token").value = gitobj.token || "";
        document.getElementById("input-user").value = gitobj.user || "";
        document.getElementById("input-repo").value = gitobj.repo || "";
        document.getElementById("input-config").value = gitobj.config || "";
    })

    document.getElementById("btn-upload").addEventListener("click", function () {
        GiteeSync.uploadConfig(null, () => alert("上传成功"), (err) => alert("上传失败," + err));
    })

    document.getElementById("btn-download").addEventListener("click", function () {
        GiteeSync.syncRemoteConfig( () => alert("下载成功"), (err) => alert("下载失败," + err));
    })


    document.getElementById("btn-sync").addEventListener("click", function () {

        let repo = document.getElementById("input-repo").value;
        let user = document.getElementById("input-user").value;
        let token = document.getElementById("input-token").value;
        let config = document.getElementById("input-config").value;

        if (repo && user && token && config) {
            fetch(`https://gitee.com/api/v5/repos/${user}/${repo}/contents/${config}?access_token=${token}`, {
                method: 'get',
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8'
                },
            }).then((response) => {
                if (response.status !== 200) {
                    return Promise.reject("code:" + response.status + ",message:" + response.statusText)
                } else {
                    let syncobj = {
                        gitee: {
                            repo: repo, user: user, token: token, config: config
                        }
                    }
                    chrome.storage.local.set(syncobj, function () {
                        alert("保存成功");
                    });
                    return response.json()
                }
            }).catch(err => {
                alert("绑定失败，" + err)
            })

        }
    });
};


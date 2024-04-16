var PRESET_RULES = [
    {
        name: "虎扑论坛PC页面",
        url: "https://bbs.hupu.com/",
        rules: [{
            "title": "列表页面屏蔽",
            "search_block_by_css": true,
            "hide_block_by_css": true,
            "example_url" : "https://bbs.hupu.com/topic",
            "site_regexp": "https://bbs.hupu.com/(?!.*html).*",
            "specify_url_by_regexp": true,
            "hide_block_css": ".bbs-sl-web-post-body",
            "search_block_css": ".bbs-sl-web-post-body"
        }, {
            "title": "帖子详情页-主回复",
            "search_block_by_css": true,
            "hide_block_by_css": true,
            "site_regexp": "https://bbs.hupu.com/*.html",
            "example_url" : "https://bbs.hupu.com/1.html",
            "specify_url_by_regexp": true,
            "search_block_css": ".thread-content-detail",
            "hide_block_css": ".main-thread"
        }, {
            "title": "帖子详情页-楼中楼",
            "search_block_by_css": true,
            "hide_block_by_css": true,
            "site_regexp": "https://bbs.hupu.com/*.html",
            "example_url" : "https://bbs.hupu.com/1.html",
            "specify_url_by_regexp": true,
            "search_block_css": ".post-reply-list-content",
            "hide_block_css": ".post-reply-list-wrapper"
        }]
    },
    {
        name: "虎扑论坛手机页面",
        url: "https://m.hupu.com",
        rules: [{
            "title": "列表页面屏蔽",
            "search_block_by_css": true,
            "hide_block_by_css": true,
            "site_regexp": "https://m.hupu.com/zone/*",
            "example_url" : "https://m.hupu.com/zone/1",
            "specify_url_by_regexp": true,
            "hide_block_css": ".exposure",
            "search_block_css": ".exposure"
        }, {
            "title": "帖子详情页",
            "search_block_by_css": true,
            "hide_block_by_css": true,
            "site_regexp": "https://bbs.hupu.com/*.html",
            "example_url" : "https://bbs.hupu.com/1.html",
            "specify_url_by_regexp": true,
            "search_block_css": ".thread-content-detail",
            "hide_block_css": ".main-thread"
        }]
    },
    {
        name: "斗鱼",
        url: "https://www.douyu.com",
        rules: [{
            "title": "屏蔽主播",
            "search_block_by_css": true,
            "hide_block_by_css": true,
            "site_regexp": "https://www.douyu.com/*",
            "example_url" : "https://www.douyu.com/g_CF",
            "specify_url_by_regexp": true,
            "hide_block_css": ".layout-Cover-item",
            "search_block_css": ".layout-Cover-item .DyListCover-userName"
        }]
    },
    {
        name: "虎牙",
        url: "https://www.huya.com",
        rules: [{
            "title": "屏蔽主播",
            "search_block_by_css": true,
            "hide_block_by_css": true,
            "site_regexp": "https://www.huya.com/g/*",
            "example_url" : "https://www.huya.com/g/393",
            "specify_url_by_regexp": true,
            "hide_block_css": ".game-live-item",
            "search_block_css": ".game-live-item .txt .nick"
        }]
    },
    {
        name: "NGA",
        url: "https://nga.178.com",
        rules: [{
            "title": "列表页(注意屏蔽用户需要从第二个字符开始)",
            "search_block_by_css": true,
            "hide_block_by_css": true,
            "site_regexp": "https://nga.178.com/thread.php",
            "example_url" : "https://nga.178.com/thread.php?fid=-81981",
            "specify_url_by_regexp": false,
            "hide_block_css": ".topicrow",
            "search_block_css": ".topicrow"
        }, {
            "title": "帖子详情页",
            "search_block_by_css": true,
            "hide_block_by_css": true,
            "site_regexp": "https://nga.178.com/read.php",
            "example_url" : "https://nga.178.com/read.php?tid=11",
            "specify_url_by_regexp": false,
            "search_block_css": ".postcontent",
            "hide_block_css": ".postbox"
        }]
    }];
//# sourceMappingURL=preset_en.js.map
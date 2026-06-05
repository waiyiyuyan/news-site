const Parser = require("rss-parser");
const fs = require("fs");

const parser = new Parser();
const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));
const tpl = fs.readFileSync("./template.html", "utf8");

async function build() {
    let navBtnHtml = "";
    let allNewsHtml = "";
    let keyArr = [];

    // 循环抓取每一个rss
    for(let item of config){
        keyArr.push(`"${item.key}"`);
        const feed = await parser.parseURL(item.rssUrl);
        // 生成导航按钮，默认第一个active
        const activeClass = keyArr.length ===1 ? "active" : "";
        navBtnHtml += `<button data-key="${item.key}" class="${activeClass}">${item.name}</button>`;

        // 生成栏目新闻盒子，默认第一个显示
        const showClass = keyArr.length ===1 ? "show news-wrap" : "news-wrap";
        let listItem = "";
        feed.items.slice(0,20).forEach(art=>{
            listItem += `
            <li>
                <a href="${art.link}" target="_blank">${art.title}</a>
                <small>${art.contentSnippet||""}</small>
            </li>`
        })
        allNewsHtml += `
        <div class="${showClass}" data-key="${item.key}">
            <ul>${listItem}</ul>
        </div>`
    }

    // 替换占位符
    let finalHtml = tpl
        .replace("{{NAV_BTN}}", navBtnHtml)
        .replace("{{ALL_NEWS}}", allNewsHtml)
        .replace("{{KEY_LIST}}", `[${keyArr.join(",")}]`);

    fs.writeFileSync("index.html", finalHtml);
    console.log("生成完成 index.html");
}

build();

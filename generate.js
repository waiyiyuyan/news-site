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
		const activeClass = keyArr.length ===1 ? "active" : "";
		navBtnHtml += `<button data-key="${item.key}" class="${activeClass}">${item.name}</button>`;
		const showClass = keyArr.length ===1 ? "show news-wrap" : "news-wrap";
		let listItem = "";
		try{
			const feed = await parser.parseURL(item.rssUrl);
			feed.items.slice(0,20).forEach(art=>{
				let pubTime = art.pubDate || "暂无发布时间";
				listItem += `
				<li>
					<a href="${art.link}" target="_blank">${art.title}</a>
					<div style="color:#888;font-size:13px;margin:5px 0;">🕒 ${pubTime}</div>
					<small>${art.contentSnippet||""}</small>
				</li>`
			})
			allNewsHtml += `
			<div class="${showClass}" data-key="${item.key}">
				<ul>${listItem}</ul>
			</div>`
		}catch(e){
			console.log(item.name+"抓取失败");
			allNewsHtml += `<div class="${showClass}" data-key="${item.key}"><ul><li>栏目数据获取失败</li></ul></div>`
		}
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

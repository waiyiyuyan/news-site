const Parser = require("rss-parser");
const fs = require("fs");

const parser = new Parser({
  timeout: 8000,
  customFields: {
    item: [
      ['content:encoded', 'contentEncoded'],
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail']
    ]
  }
});
const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));
const tpl = fs.readFileSync("./template.html", "utf8");

// 从HTML中提取第一张图片的URL（解决耶路撒冷邮报这类不使用enclosure的媒体）
function extractFirstImage(html) {
  if (!html) return "";
  const imgMatch = html.match(/<img[^>]+src\s*=\s*["']?([^"'\s>]+)["']?/i);
							  
  return imgMatch ? imgMatch[1].trim() : "";
}

function getImage(item) {

    // 1. RSS标准封面（最高优先级）
    if (item.enclosure?.url) {
        return item.enclosure.url;
    }

    // 2. media:thumbnail
    if (item.mediaThumbnail) {
        if (Array.isArray(item.mediaThumbnail)) {
            return item.mediaThumbnail[0]?.$?.url || "";
        }
        return item.mediaThumbnail.$?.url || "";
    }

    // 3. media:content
    if (item.mediaContent) {
        if (Array.isArray(item.mediaContent)) {
            return item.mediaContent[0]?.$?.url || "";
        }
        return item.mediaContent.$?.url || "";
    }

    // 4. content（你这个 JPost 就在这里）
    let img =
        extractFirstImage(item.content) ||
        extractFirstImage(item["content:encoded"]);

    if (img) return img;

    // 5. description fallback
    img = extractFirstImage(item.description);
    if (img) return img;

    return "";
}

async function build() {
    let navBtnHtml = "";
    let allNewsHtml = "";
    let keyArr = [];

    for(let item of config){
		keyArr.push(`"${item.key}"`);
		const activeClass = keyArr.length ===1 ? "active" : "";
		navBtnHtml += `<button data-key="${item.key}" class="${activeClass}">${item.name}</button>`;
		const showClass = keyArr.length ===1 ? "show news-wrap" : "news-wrap";
		let listItem = "";
		try{
			const feed = await parser.parseURL(item.rssUrl);

			feed.items.slice(0,20).forEach(art=>{
				let pubTime =
					art.pubDate ||
					art.isoDate ||
					art["dc:date"] ||
					art.updated ||
					art.published;

				if(pubTime){
					pubTime = new Date(pubTime).toLocaleString("zh-CN",{
						timeZone:"Asia/Shanghai"
					});
				}else{
					pubTime = "暂无发布时间";
				}
				
				// 三级图片提取逻辑：优先enclosure标准封面 → 其次description内嵌图 → 最后content:encoded内嵌图
				let imgUrl = getImage(art);

				let fullContent =
				art.contentSnippet ||
				art.summary ||
				art.description ||
				"";
				// 彻底清理多余空标签、换行，根治同li多条新闻问题
				fullContent = fullContent.replace(/<p>\s*<\/p>/gi,"").replace(/(<br\s*\/?>){2,}/gi," ");
				// 正文内嵌图片全部删除，只保留我们提取的单独封面图
				fullContent = fullContent.replace(/<img.*?>/gi,"");

				// 严格按你要求的顺序：标题 → 时间 → 摘要 → 图片
				let imgHtml = "";
				if(imgUrl){
					imgHtml = `<img src="${imgUrl}" style="max-width:100%;max-height:240px;border-radius:6px;margin-top:10px;" onerror="this.style.display='none'">`;
				}

				listItem += `
<li>
	<a href="${art.link}" target="_blank">${art.title}</a>
	<div style="color:#888;font-size:13px;margin:5px 0;">🕒 ${pubTime}</div>
	<small>${fullContent}</small>
	${imgHtml}
</li>`;
			})
			allNewsHtml += `
			<div class="${showClass}" data-key="${item.key}">
				<ul>${listItem}</ul>
			</div>`
		}catch(e){
			console.log(item.name+"抓取失败",e.message);
			allNewsHtml += `<div class="${showClass}" data-key="${item.key}"><ul><li>栏目数据获取失败</li></ul></div>`
		}
	}

    let finalHtml = tpl
        .replace("{{NAV_BTN}}", navBtnHtml)
        .replace("{{ALL_NEWS}}", allNewsHtml)
        .replace("{{KEY_LIST}}", `[${keyArr.join(",")}]`);

    fs.writeFileSync("index.html", finalHtml);
    console.log("生成完成 index.html");
}

build().then(()=>{
    process.exit(0);
});

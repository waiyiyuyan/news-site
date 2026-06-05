const Parser = require("rss-parser");
const fs = require("fs");

const parser = new Parser();
const RSS_URL = "https://feeds.bbci.co.uk/news/world/rss.xml";

async function run() {
    const feed = await parser.parseURL(RSS_URL);

    let html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>全球新闻聚合</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: system-ui, sans-serif;
            max-width: 900px;
            margin: 0 auto;
            padding: 0 12px;
        }
        /* 顶部导航容器 */
        nav {
            background: #23529c;
            margin: 16px 0;
            border-radius: 6px;
            overflow: hidden;
        }
        /* 导航横向排列，手机自动换行 */
        .nav-wrap {
            display: flex;
            flex-wrap: wrap;
        }
        .nav-wrap a {
            color: #fff;
            padding: 14px 18px;
            text-decoration: none;
            font-size: 15px;
            display: block;
        }
        /* 当前选中栏目高亮 */
        .nav-wrap a.active {
            background: #193b70;
        }
        .nav-wrap a:hover {
            background: #3066bb;
        }

        h1 {
            font-size: 22px;
            margin-bottom: 18px;
            color: #222;
        }
        ul {
            list-style: none;
        }
        li {
            padding: 15px 8px;
            border-bottom: 1px solid #eee;
        }
        li a {
            font-size: 17px;
            color: #005fc5;
            text-decoration: none;
        }
        small {
            display: block;
            margin-top:7px;
            font-size:14px;
            color:#555;
            line-height:1.55;
        }
    </style>
</head>
<body>
    <!-- 横向导航栏，后续加新闻源在这里加a标签 -->
    <nav>
        <div class="nav-wrap">
            <a href="./index.html" class="active">BBC World新闻</a>
            <!-- 后续新增新闻源示例，建好对应html后放开：
            <a href="./reuters.html">路透新闻</a>
            <a href="./cnn.html">CNN新闻</a>
            -->
        </div>
    </nav>

    <h1>BBC World News</h1>
    <ul>
`;

    feed.items.slice(0, 20).forEach(item => {
       html += `
			<li>
			  <a href="${item.link}" target="_blank">${item.title}</a>
			  <small>${item.contentSnippet || ""}</small>
			</li>
			`;
    });

    html += `
    </ul>
</body>
</html>
`;

    fs.writeFileSync("index.html", html);
    console.log("生成index.html完成");
}

run();

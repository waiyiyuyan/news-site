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
    <!-- 手机适配核心标签，必须加 -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BBC News Feed</title>
    <style>
        /* 全局适配样式 */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: system-ui, sans-serif;
            padding: 12px;
            max-width: 800px;
            margin: 0 auto;
        }
        h1 {
            font-size: 22px;
            margin: 16px 0;
            color: #222;
        }
        ul {
            list-style: none;
        }
        li {
            padding: 14px 10px;
            border-bottom: 1px solid #eee;
        }
        a {
            font-size: 17px;
            color: #005fc5;
            text-decoration: none;
        }
        a:active {
            color: #003b7c;
        }
        small {
            font-size: 14px;
            color: #555;
            display: block;
            margin-top:6px;
            line-height:1.5;
        }
    </style>
</head>
<body>
    <h1>BBC World News</h1>
    <ul>
`;

    feed.items.slice(0, 20).forEach(item => {
       html += `
			<li>
			  <a href="${item.link}" target="_blank">${item.title}</a><br>
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
    console.log("生成完成：index.html");
}

run();

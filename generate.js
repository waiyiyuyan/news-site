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
    <title>BBC News Feed</title>
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
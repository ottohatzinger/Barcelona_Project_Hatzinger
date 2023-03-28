import puppeteer from "puppeteer";


function getQuotesFromPage(page){
    return page.evaluate( () => {
        const quoteList = document.querySelectorAll(".quote");

        return Array.from(quoteList).map(quote =>{
            const text=quote.querySelector(".text").innerText;
            const author=quote.querySelector(".author").innerText;
            const tagList = quote.querySelectorAll('.tags > .tag');
            let tags = Array.from(tagList).map(tag => tag.innerText);
            return { text, author, tags};
        });

    });

}
async function getQuotes() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });
    const page = await browser.newPage();
    await page.goto("http://quotes.toscrape.com/",{waitUntil:"domcontentloaded"});
    let quotes = await getQuotesFromPage(page);

    let loadMore = true;
    while (loadMore) {
        const selector = '.pager > .next > a';

        if ((await page.$(selector)) !== null) {
            await page.click(selector);
            quotes =[...quotes, ... await getQuotesFromPage(page)]
        } else {
            loadMore = false;
        }
    }

    quotes.sort((a, b) => {
        return a.author === b.author ? 0 : a.author < b.author ? -1 : 1;
    });
    console.log(quotes);
    await browser.close();
}
getQuotes();

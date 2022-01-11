const tress = require('tress');
const needle = require('needle');
const cheerio = require('cheerio');
const resolve = require('url').resolve;
const fs = require('fs');

let URL = 'https://autooem.ru/catalog/?page=1#filter';
let results = [];

// `tress` последовательно вызывает наш обработчик для каждой ссылки в очереди
let q = tress(function(url, callback){

    needle.get(url, function(err, res){
        if (err) throw err;

        //парсим DOM
        let $ = cheerio.load(res.body);
        console.log($)

        if($('#search_results > div:nth-child(2) > div.column.is-4 > h2 > a.has-text-black.is-hidden-touch').contents().eq(2).text().trim().slice(0, -1) === 'склад'){
            results.push({
                title: $('h1').text(),
                date: $('.b_infopost>.date').text(),
                href: url,
                size: $('.newsbody').text().length
            });
        }

        $('#search_results').each(function (){
            q.push($(this).attr('href'));
        })

        $('#app > div.hero-body > div > div > div.pager > button.right.button.is-black.is-outlined').each(function (){
            q.push($(this).attr('href'));
        });

        callback();
    });
}, 10); // запуск 10 параллельных потоков

// эта функция выполнится, когда в очереди закончатся ссылки
q.drain = function(){
    require('fs').writeFileSync('./data.json', JSON.stringify(results, null, 4));
}

// добавляем в очередь ссылку на первую страницу списка
q.push(URL);



// 1) создаешь цикл
// 2) в цикле делаеь запрос - https://autooem.ru/catalog/?page={i}#filter , обрати внимание на страницу в урле
// 3) через библиоткеу из статьи парсишь страницу, находишь список(я скрин кидал со списком), потом этот список через цикл парсишь каждыую позиццию
// 4) сохраняешь кудато данные,  csv или в гугл таблицу
// 5) цикл продолжается пока все сстраницы не обработаются



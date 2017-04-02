/**
 * Created by Lemniscate on 2017/4/1.
 */
const express = require('express');
const expressStatic = require('express-static');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const multer = require('multer');
const ejs = require('ejs');
const jade = require('jade');
const consolidate = require('consolidate');
const mysql = require('mysql');
const utils = require('./libs/common');

const db = mysql.createPool({host:'localhost',user:'root',password:'1234',database:'blog'});


var server = express();
server.listen(3000);

/**
 * 1.解析cookie
 * 2.解析session
 * 3.post等数据
 * 4.static数据
 */
var keysarr = [];
for (var i= 0;i<100000;i++) {
    keysarr.push('keys_' + Math.random() + 'qwertyuiop');
}
server.use(cookieParser('qwertyuiopasdfghjklzxcvbnm')); //req.cookies
server.use(cookieSession({name:'sess',keys:keysarr,maxAge:20*3600*1000,httpOnly:true}));
server.use(bodyParser.urlencoded({extended:false}));
server.use(multer({dest:'./www/upload'}).any());



server.set('view engine','html');
server.set('views', './template');
server.engine('html', consolidate.ejs);

// server.use('/', function (req, res,next) { //get req.query  post req.body
//     console.log(req.query, req.body, req.files,req.cookies, req.session);
// });
server.get('/', (req,res,next)=> {
    db.query('select * from banner_table', (err, data)=> {
        if(err) {
            console.log(err);
            res.status(500).send('db error').end();
        }else {
            res.banners = data;
            next();
            // res.render('index.ejs',{banners:data});
        }
    });
});
server.get('/', (req,res,next)=> {
    db.query('select id,title,summary from article_table', (err, data)=> {
        if(err) {
            console.log(err);
            res.status(500).send('db error').end();
        }else {
            res.articles = data;
            next();
        }
    });
});
server.get('/', (req,res)=> {
    res.render('index.ejs', {banners: res.banners, articles: res.articles});
});
server.get('/article', (req,res)=> {
    if(req.query.id){
        db.query('select * from article_table where id=?', [req.query.id], (err, data)=> {
            if (err) {
                console.log(err);
                res.status(500).send('参数错误').end();
                return;
            }
            if (data.length<=0) {
                console.log(data);
                res.status(500).send('文章不存在').end();
                return;
            }
            data[0].post_time = utils.time2date(data[0].post_time);
            data[0].content = data[0].content.replace(/^/gm, '<p>').replace(/$/gm, '</p>');
            res.render('conText.ejs', {article_data:data[0]});
        });
    }else {
        res.status(404).send('您请求的文章不存在').end();
    }

});

server.use(expressStatic('./www'));
"use strict";
//加载所需要的模块
var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');
var cp = require('child_process');
const zlib = require("zlib");

//创建服务
var httpServer = http.createServer(processRequest);
// 这是端口号
var port = 8081;

//指定一个监听的接口
httpServer.listen(port, function() {
    console.log(`app is running at port:${port}`);
    console.log(`url: http://localhost:${port}`);
    cp.exec(`explorer http://localhost:${port}`, function () {
    });
});

//响应请求的函数
function processRequest (request, response) {
    // 处理 pathname，"/" 时默认读取 "/index.html"
    var { pathname } = url.parse(request.url, true);
    pathname = pathname !== "/" ? pathname : "/index.html";

    // 获取读取文件的绝对路径
    var p = path.join(__dirname, pathname);

    // 查看路径是否合法
    fs.access(p, err => {
        // 路径不合法则直接中断连接
        if (err) return response.end("Not Found");

        // 获取浏览器支持的压缩格式
        var encoding = request.headers["accept-encoding"];

        // 创建可读流
        var rs = fs.createReadStream(p);

        // 支持 gzip 使用 gzip 压缩，支持 deflate 使用 deflate 压缩
        if (encoding && encoding.match(/\bgzip\b/)) {
            var compress = zlib.createGzip();
            var compressType = "gzip";
        } else if (encoding && encoding.match(/\bdeflate\b/)) {
            var compress = zlib.createDeflate();
            var compressType = "deflate";
        } else {
            // 否则直接返回可读流
            return rs.pipe(response);
        }

        // 将压缩流返回并设置响应头
        response.setHeader("Content-Encoding",compressType);
        rs.pipe(compress).pipe(response);
    })



}





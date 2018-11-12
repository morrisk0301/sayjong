var imageDataURI = require('image-data-uri');
var imagemin = require('imagemin');
var imageminPngquant = require('imagemin-pngquant');
var imageminJpegRecompress = require('imagemin-jpeg-recompress');

encodeImage = function(dataURI, callback){
    if(!dataURI) return callback(null, null);
    var file_size = Buffer(dataURI.substr(22), 'base64').toString('binary');
    console.log("파일크기는 ", file_size.length,"바이트 입니다");

    if(file_size>1048576) return callback('file size error', null);

    var encImg = imageDataURI.decode(dataURI);

    imagemin.buffer(encImg.dataBuffer, {
        plugins: [
            imageminJpegRecompress(),
            imageminPngquant({quality: '65-80'})
        ]
    }).then(outBuffer => {
        var imageType = encImg.imageType;
        return callback(null, imageDataURI.encode(outBuffer, imageType));
    });
};


module.exports = encodeImage;
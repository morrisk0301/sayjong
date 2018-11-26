var imageDataURI = require('image-data-uri');
var imagemin = require('imagemin');
var imageminPngquant = require('imagemin-pngquant');
var imageminJpegRecompress = require('imagemin-jpeg-recompress');
var sharp = require('sharp');

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

        sharp(outBuffer)
            .resize({
                height: 100,
                weight: 100
            })
            .toBuffer()
            .then(resize_data => {
                var img_full = imageDataURI.encode(outBuffer, imageType);
                var img_desize = imageDataURI.encode(resize_data, imageType);

                return callback(null, {img_full: img_full, img_desize: img_desize});
            });
    });
};


module.exports = encodeImage;
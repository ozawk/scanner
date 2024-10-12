import { PDFDocument } from "pdf-lib";
import QRCode from "qrcode";
//PDFビューア
const pdfViewerUrl = "viewer.scan.ozwk.net/";
const pdfSaverUrl = "https://viewer.scan.ozwk.net/save/";
let fileId = "";
let fileIdLength = 8;
const fileIdChars = "23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"; //除外:01iloIO
let qrCodeText;

// 出力に関係ない画像の設定
const StreamVideoRequiredIdealWidth = 1920;
const StreamVideoRequiredIdealHeight = 1080;
const PrevStreamVideoWidth = 1920;
const PrevStreamVideoHeight = 1080;
let isStreamVideoStreaming = false;
let isEnableConvertImageGrayscale = true;
let convertImageGrayscaleIncreaseBrightness = 60;

// 画像処理用Canvas
const ImageProcessCanvas = document.createElement("canvas");
ImageProcessCanvas.width = PrevStreamVideoWidth;
ImageProcessCanvas.height = PrevStreamVideoHeight;
let ImageProcessCanvasContext = ImageProcessCanvas.getContext("2d");

let FinalOutputImages = [];
let pdfDataUri;

// 画像ヘッダ
let isEnableInsertImageHeader = true;
const ImageHeaderHeight = 60;
let ImageHeaderTitle = "            ";
let ImageHeaderPageTitle = "P,71";
let ImageHeaderPageCount = 71;
// const ImageHeaderFontData = new FontFace(
//     "KosugiMaru",
//     "url('./KosugiMaru-Regular.ttf')",
// );
// let ImageHeaderTextFont;
// ImageHeaderFontData.load().then((font) => {
//     ImageHeaderTextFont = font;
// });

function streamVideo() {
    createFileData();
    streamVideo = document.getElementById("imgPrevVideo");
    navigator.mediaDevices
        .getUserMedia({
            audio: false,
            video: {
                width: { ideal: StreamVideoRequiredIdealWidth },
                height: { ideal: StreamVideoRequiredIdealHeight },
                facingMode: { ideal: "environment" },
            },
        })
        .then((stream) => {
            streamVideo.srcObject = stream;
            streamVideo.play();
        })
        .catch((err) => {
            console.error(`An error occurred: ${err}`);
        });
    streamVideo.addEventListener(
        "canplay",
        () => {
            if (!isStreamVideoStreaming) {
                streamVideo.setAttribute("width", PrevStreamVideoWidth);
                streamVideo.setAttribute("height", PrevStreamVideoHeight);
                isStreamVideoStreaming = true;
            }
        },
        false,
    );
}

function confirmStreamVideo() {
    ImageProcessCanvasContext.drawImage(
        streamVideo,
        0,
        0,
        PrevStreamVideoWidth,
        PrevStreamVideoHeight,
    );

    if (isEnableConvertImageGrayscale) {
        convertImageGrayscale();
    }
    if (isEnableInsertImageHeader) {
        insertImageHeader();
    }
    const dataURL = ImageProcessCanvas.toDataURL("image/jpeg");
    const imgConfirmed = document.getElementById("imgConfirmed");
    imgConfirmed.src = dataURL;
    FinalOutputImages.push(imgConfirmed.src);
}

function insertImageHeader() {
    // document.fonts.add(ImageHeaderTextFont);
    ImageProcessCanvasContext.fillStyle = "white";
    ImageProcessCanvasContext.fillRect(
        0,
        0,
        PrevStreamVideoWidth,
        ImageHeaderHeight,
    );

    ImageProcessCanvasContext.fillStyle = "black";
    ImageProcessCanvasContext.font = "40px sans-serif";
    ImageProcessCanvasContext.fillText(
        ImageHeaderTitle + "     " + "P." + ImageHeaderPageCount,
        20,
        ImageHeaderHeight * 0.7,
    );
    ImageHeaderPageCount = ImageHeaderPageCount + 2;

    ImageProcessCanvasContext.beginPath();
    ImageProcessCanvasContext.moveTo(
        PrevStreamVideoWidth - ImageHeaderHeight * 2,
        ImageHeaderHeight / 2,
    );
    ImageProcessCanvasContext.lineTo(
        PrevStreamVideoWidth - 800 - ImageHeaderHeight * 2,
        ImageHeaderHeight / 2,
    );
    ImageProcessCanvasContext.stroke();

    ImageProcessCanvasContext.font = "20px sans-serif";
    ImageProcessCanvasContext.fillText(
        qrCodeText,
        PrevStreamVideoWidth - 800 - ImageHeaderHeight * 2,
        ImageHeaderHeight / 2 - 5,
    );
    ImageProcessCanvasContext.font = "20px sans-serif";
    let dataText;
    if (isEnableConvertImageGrayscale) {
        dataText = "グレースケール";
    } else {
        dataText = "Rawデータ";
    }
    ImageProcessCanvasContext.fillText(
        "  " +
            new Date().toString() +
            "  " +
            PrevStreamVideoWidth +
            "*" +
            PrevStreamVideoHeight +
            "  " +
            dataText,
        PrevStreamVideoWidth - 800 - ImageHeaderHeight * 2,
        ImageHeaderHeight - 5,
    );
    QRCode.toCanvas(
        document.createElement("canvas"),
        qrCodeText,
        {
            width: ImageHeaderHeight * 2,
            height: ImageHeaderHeight * 2,
            colorDark: "black",
            colorLight: "white",
            errorCorrectionLevel: "L",
        },
        function (error, qrCanvas) {
            if (error) console.error(error);
            ImageProcessCanvasContext.drawImage(
                qrCanvas,
                PrevStreamVideoWidth - ImageHeaderHeight * 2,
                0,
            );
        },
    );
}

function createFileData() {
    let array = new Uint8Array(fileIdLength);
    crypto.getRandomValues(array);
    for (var i = 0; i < fileIdLength; i++) {
        fileId += fileIdChars.charAt(
            Math.floor((array[i] / 256) * fileIdChars.length),
        );
    }
    qrCodeText = pdfViewerUrl + fileId;
}

function convertImageGrayscale() {
    const imageData = ImageProcessCanvasContext.getImageData(
        0,
        0,
        PrevStreamVideoWidth,
        PrevStreamVideoHeight,
    );
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg + convertImageGrayscaleIncreaseBrightness;
        data[i + 1] = avg + convertImageGrayscaleIncreaseBrightness;
        data[i + 2] = avg + convertImageGrayscaleIncreaseBrightness;
    }
    ImageProcessCanvasContext.putImageData(imageData, 0, 0);
}

async function createDownloadPdfFile() {
    let pdfDoc = await PDFDocument.create();

    for (let i = 0; i < FinalOutputImages.length; i++) {
        let page = pdfDoc.addPage([
            PrevStreamVideoWidth,
            PrevStreamVideoHeight + ImageHeaderHeight,
        ]);
        page.drawImage(await pdfDoc.embedJpg(FinalOutputImages[i]), {
            x: 0,
            y: 0,
            width: PrevStreamVideoWidth,
            height: PrevStreamVideoHeight + ImageHeaderHeight,
        });
    }

    const pdfDataUr = await pdfDoc.save();
    uploadFile(pdfDataUr);
    const pdfDataUri = URL.createObjectURL(
        new Blob([await pdfDoc.save()], { type: "application/pdf" }),
    );
    const DownloadDummyElement = document.createElement("a");
    DownloadDummyElement.href = pdfDataUri;
    DownloadDummyElement.download = "test.pdf";
    await DownloadDummyElement.click();
}

// async function uploadFile(pdfDataUri) {
//     const formData = new FormData();
//     formData.append(
//         "file",
//         new Blob([pdfDataUri], {
//             type: "application/pdf",
//         }),
//         "test.pdf",
//     );
//     try {
//         const response = await fetch(pdfSaverUrl + fileId, {
//             method: "POST",
//             body: formData,
//         });

//         if (response.ok) {
//             console.log(response.statusText);
//         } else {
//             console.error(response.statusText);
//         }
//     } catch (error) {
//         console.error(error);
//     }
// }

function uploadFile(pdfDataUri) {
    const formData = new FormData();
    formData.append(
        "file",
        new Blob([pdfDataUri], {
            type: "application/pdf",
        }),
        fileId + ".pdf",
    );
    const xhr = new XMLHttpRequest();
    xhr.open("POST", pdfSaverUrl + fileId, true);
    xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
            console.log("upload progress:", event.loaded / event.total);
        }
    });
    xhr.onload = function () {
        if (xhr.status === 200) {
            console.log("OK", xhr.responseText);
        } else {
            console.error("ERR", xhr.statusText);
        }
    };
    xhr.onerror = function () {
        console.error("ERR", xhr.statusText);
    };
    xhr.send(formData);
}

export { streamVideo, confirmStreamVideo, createDownloadPdfFile };

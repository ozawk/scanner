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
const videoRequiredIdealWidth = 1920;
const videoRequiredIdealHeight = 1080;
const OutputVideoImageWidth = 1920;
const OutputVideoImageHeight = 1080;
let isimgPrevVideoElemStreaming = false;
let isEnableConvertImageGrayscale = true;
let convertImageGrayscaleIncreaseBrightness = 60;

// 画像処理用Canvas
let imgPrevVideoElem;
const ImageProcessCanvas = document.createElement("canvas");
ImageProcessCanvas.width = OutputVideoImageWidth;
ImageProcessCanvas.height = OutputVideoImageHeight;
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
createFileData();

async function getCameraData() {
    const devices = (await navigator.mediaDevices.enumerateDevices()).filter(
        (device) => device.kind === "videoinput",
    );
    let deviceIds = [],
        deviceLabels = [];
    for (let i = 0; i < devices.length; i++) {
        deviceIds.push(devices[i].deviceId);
        deviceLabels.push(devices[i].label);
    }
    let detectedCamerasList = [];
    for (let i = 0; i < deviceIds.length; i++) {
        detectedCamerasList.push({
            value: deviceIds[i],
            label: deviceLabels[i],
        });
    }
    const firstCameraId = detectedCamerasList[0].value;
    return [detectedCamerasList, firstCameraId];
}

function streamVideo(deviceId) {
    imgPrevVideoElem = document.getElementById("imgPrevVideo");
    navigator.mediaDevices
        .getUserMedia({
            audio: false,
            video: {
                deviceId: deviceId,
                // facingMode: { ideal: "environment" },
                width: { ideal: videoRequiredIdealWidth },
                height: { ideal: videoRequiredIdealHeight },
            },
        })
        .then((stream) => {
            imgPrevVideoElem.srcObject = stream;
            imgPrevVideoElem.play();
        })
        .catch((err) => {
            console.error("Video Stream Error: ", err);
        });
    imgPrevVideoElem.addEventListener(
        //これいらない気がする
        "canplay",
        () => {
            if (!isimgPrevVideoElemStreaming) {
                imgPrevVideoElem.setAttribute("width", OutputVideoImageWidth);
                imgPrevVideoElem.setAttribute("height", OutputVideoImageHeight);
                isimgPrevVideoElemStreaming = true;
            }
        },
        false,
    );
    return;
}

function confirmStreamVideo() {
    ImageProcessCanvasContext.drawImage(
        imgPrevVideoElem,
        0,
        0,
        OutputVideoImageWidth,
        OutputVideoImageHeight,
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
        OutputVideoImageWidth,
        ImageHeaderHeight,
    );

    ImageProcessCanvasContext.fillStyle = "black";
    ImageProcessCanvasContext.font = "40px sans-serif";
    ImageProcessCanvasContext.fillText(
        ImageHeaderTitle + "P." + ImageHeaderPageCount,
        20,
        ImageHeaderHeight * 0.7,
    );
    ImageHeaderPageCount = ImageHeaderPageCount + 2;

    ImageProcessCanvasContext.beginPath();
    ImageProcessCanvasContext.moveTo(
        OutputVideoImageWidth - ImageHeaderHeight * 2,
        ImageHeaderHeight / 2,
    );
    ImageProcessCanvasContext.lineTo(
        OutputVideoImageWidth - 800 - ImageHeaderHeight * 2,
        ImageHeaderHeight / 2,
    );
    ImageProcessCanvasContext.stroke();

    ImageProcessCanvasContext.font = "20px sans-serif";
    ImageProcessCanvasContext.fillText(
        qrCodeText,
        OutputVideoImageWidth - 800 - ImageHeaderHeight * 2,
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
            OutputVideoImageWidth +
            "*" +
            OutputVideoImageHeight +
            "  " +
            dataText,
        OutputVideoImageWidth - 800 - ImageHeaderHeight * 2,
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
                OutputVideoImageWidth - ImageHeaderHeight * 2,
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
        OutputVideoImageWidth,
        OutputVideoImageHeight,
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

async function takeImageConfirmAndEnd(
    isDownloadPdf,
    isUploadCloud,
    downloadPdfFileName,
) {
    //FinalOutputImagesからPDFを作成
    let pdfDoc = await PDFDocument.create();
    for (let i = 0; i < FinalOutputImages.length; i++) {
        let page = pdfDoc.addPage([
            OutputVideoImageWidth,
            OutputVideoImageHeight + ImageHeaderHeight,
        ]);
        page.drawImage(await pdfDoc.embedJpg(FinalOutputImages[i]), {
            x: 0,
            y: 0,
            width: OutputVideoImageWidth,
            height: OutputVideoImageHeight + ImageHeaderHeight,
        });
    }
    const pdfData = await pdfDoc.save();

    if (isDownloadPdf) {
        const pdfDataUri = URL.createObjectURL(
            new Blob([pdfData], { type: "application/pdf" }),
        );
        const DownloadDummyElement = document.createElement("a");
        DownloadDummyElement.href = pdfDataUri;
        DownloadDummyElement.download = downloadPdfFileName + ".pdf";
        await DownloadDummyElement.click();
    }
    if (isUploadCloud) {
        uploadFile(pdfData);
    }
    // window.location.reload();
}

// function uploadFile(pdfData) {
//     const formData = new FormData();
//     formData.append(
//         "file",
//         new Blob([pdfData], {
//             type: "application/pdf",
//         }),
//         fileId + ".pdf",
//     );
//     const xhr = new XMLHttpRequest();
//     xhr.open("POST", pdfSaverUrl + fileId, true);
//     xhr.upload.addEventListener("progress", (event) => {
//         if (event.lengthComputable) {
//             console.log(event.loaded, event.total);
//         }
//     });
//     xhr.onload = function () {
//         if (xhr.status === 200) {
//             console.log(xhr.responseText);
//         } else {
//             console.error(xhr.statusText);
//         }
//     };
//     xhr.onerror = function () {
//         console.error(xhr.statusText);
//     };
//     xhr.send(formData);
// }

export {
    streamVideo,
    confirmStreamVideo,
    takeImageConfirmAndEnd,
    getCameraData,
};

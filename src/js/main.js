import { PDFDocument } from "pdf-lib";
import QRCode from "qrcode";
import {
    isEnableGrayScaleImage,
    isEnableOriginalImage,
    isEnableInsertHeader,
    headerText,
    isEnableddFirstOddPageNum,
    isEnabledInOrderPageNum,
    isEnabledNonePageNum,
    firstPageNum,
    increasePageNum,
    firstOddPageNum,
    lastOddPageNum,
    turnstileToken,
} from "../App.tsx";

//クラウド
const pdfViewerUrl = "https://viewer.scan.ozwk.net/";
const pdfSaverUrl = "https://viewer.scan.ozwk.net/save/";
let fileId = "";
let fileIdLength = 8;
const fileIdChars = "23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"; //除外:01iloIO
let qrCodeText;

//画像
const videoRequiredIdealWidth = 1920;
const videoRequiredIdealHeight = 1080;
const OutputVideoImageWidth = 1920;
const OutputVideoImageHeight = 1080;
let isimgPrevVideoElemStreaming = false;
let convertImageGrayscaleIncreaseBrightness = 60;
let FinalOutputImages = [];

// 画像処理用Canvas
let imgPrevVideoElem;
const ImageProcessCanvas = document.createElement("canvas");
ImageProcessCanvas.width = OutputVideoImageWidth;
ImageProcessCanvas.height = OutputVideoImageHeight;
let ImageProcessCanvasContext = ImageProcessCanvas.getContext("2d");

// 画像ヘッダ
const ImageHeaderHeight = 60;
let nowImageHeaderPageCount = null;

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
        ImageHeaderHeight,
        OutputVideoImageWidth,
        OutputVideoImageHeight,
    );

    if (isEnableGrayScaleImage) {
        convertImageGrayscale();
    }
    if (isEnableInsertHeader) {
        insertImageHeader();
    }
    const dataURL = ImageProcessCanvas.toDataURL("image/jpeg");
    const imgConfirmed = document.getElementById("imgConfirmed");
    imgConfirmed.src = dataURL;
    if (isEnableddFirstOddPageNum === false) {
        FinalOutputImages.push(imgConfirmed.src);
    } else {
        if (nowImageHeaderPageCount % 2) {
            FinalOutputImages.push(imgConfirmed.src);
        } else {
            Array.prototype.splice.apply(
                FinalOutputImages,
                [nowImageHeaderPageCount - firstOddPageNum, 0].concat(
                    imgConfirmed.src,
                ),
            );
        }
    }
}

function deleteOnePageImage() {
    FinalOutputImages.pop();
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
    decideImageHeaderPageCount();
    ImageProcessCanvasContext.fillText(
        headerText + "     P." + nowImageHeaderPageCount,
        20,
        ImageHeaderHeight * 0.7,
    );

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
        "                                                                      " +
            qrCodeText,
        OutputVideoImageWidth - 800 - ImageHeaderHeight * 2,
        ImageHeaderHeight / 2 - 5,
    );
    ImageProcessCanvasContext.font = "20px sans-serif";
    let dataText;
    if (isEnableGrayScaleImage) {
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

function decideImageHeaderPageCount() {
    if (isEnabledInOrderPageNum) {
        if (nowImageHeaderPageCount === null) {
            nowImageHeaderPageCount = firstPageNum;
        } //初回
        else {
            nowImageHeaderPageCount = increasePageNum + nowImageHeaderPageCount;
        }
    } else if (isEnableddFirstOddPageNum) {
        if (nowImageHeaderPageCount === null) {
            nowImageHeaderPageCount = firstOddPageNum;
        } //初回
        else if (lastOddPageNum === nowImageHeaderPageCount) {
            nowImageHeaderPageCount = firstOddPageNum + 1;
        } else {
            nowImageHeaderPageCount = 2 + nowImageHeaderPageCount;
        }
    } else {
        nowImageHeaderPageCount = "";
    }
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

function uploadFile(pdfData) {
    if (!turnstileToken) {
        console.log("Turnstileが未解決です");
        return;
    }
    const formData = new FormData();
    formData.append("token", turnstileToken);
    formData.append(
        "file",
        new Blob([pdfData], {
            type: "application/pdf",
        }),
        fileId + ".pdf",
    );
    const xhr = new XMLHttpRequest();
    xhr.open("POST", pdfSaverUrl + fileId, true);
    xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
            console.log(event.loaded, event.total);
        }
    });
    xhr.onload = function () {
        if (xhr.status === 200) {
            console.log(xhr.responseText);
        } else {
            console.error(xhr.statusText);
        }
    };
    xhr.onerror = function () {
        console.error(xhr.statusText);
    };
    xhr.send(formData);
}

export {
    streamVideo,
    confirmStreamVideo,
    takeImageConfirmAndEnd,
    getCameraData,
    deleteOnePageImage,
};

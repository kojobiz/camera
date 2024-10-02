
const videoElement = document.getElementById('videoElement');
const switchButton = document.getElementById('switchButton');
let currentStream = null;
let useFrontCamera = true;

// 初期カメラをインカメラで起動する
startCamera();

// カメラ切り替えボタンをクリックしたときのイベント
switchButton.addEventListener('click', () => {
  useFrontCamera = !useFrontCamera; // カメラの向きを切り替える
  startCamera();
});

// カメラを起動する関数
function startCamera() {
  // 既存のストリームを停止してリソースを解放
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }

  // インカメラか外カメラを指定する
  const constraints = {
    video: { facingMode: useFrontCamera ? "user" : "environment" }
  };

  // 新しいカメラを起動
  navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
      currentStream = stream;
      videoElement.srcObject = stream;
    })
    .catch(error => {
      console.error("カメラの起動に失敗しました:", error);
    });
}


// DOM Elements
const startCameraButton = document.getElementById('start-camera');
const captureButton = document.getElementById('capture');
const processButton = document.getElementById('process');
const downloadCsvButton = document.getElementById('download-csv');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const capturedImage = document.getElementById('captured-image');
const ocrResult = document.getElementById('ocr-result');

// Global Variables
let capturedText = '';

// Step 1: Start Camera
startCameraButton.onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  captureButton.disabled = false;
};

// Step 2: Capture Image from Camera
captureButton.onclick = () => {
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  capturedImage.src = canvas.toDataURL('image/png');
  capturedImage.style.display = 'block';
  processButton.disabled = false;
};

// Step 3: Process OCR with Tesseract.js
processButton.onclick = () => {
  Tesseract.recognize(
    capturedImage.src,
    'eng',
    { logger: m => console.log(m) }
  ).then(({ data: { text } }) => {
    ocrResult.value = text;
    capturedText = text;
    downloadCsvButton.disabled = false;
  });
};

// Step 4: Convert Data to CSV and Download
downloadCsvButton.onclick = () => {
  const csvData = `Data\n${capturedText}`;
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, 'business-card-data.csv');
};

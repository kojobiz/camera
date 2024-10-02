// DOM Elements
const startCameraButton = document.getElementById('start-camera');
const captureButton = document.getElementById('capture');
const processButton = document.getElementById('process');
const downloadCsvButton = document.getElementById('download-csv');
const videoElement = document.getElementById('videoElement');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const capturedImage = document.getElementById('captured-image');
const ocrResult = document.getElementById('ocr-result');
const switchButton = document.getElementById('switchButton');

// Global Variables
let currentStream = null;
let useFrontCamera = true;

// Step 1: Start Camera
startCameraButton.onclick = async () => {
  await startCamera();
  captureButton.disabled = false;
};

// カメラを起動する関数
async function startCamera() {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }

  const constraints = {
    video: { facingMode: useFrontCamera ? "user" : "environment" }
  };

  try {
    currentStream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElement.srcObject = currentStream;
  } catch (error) {
    console.error("カメラの起動に失敗しました:", error);
  }
}

// カメラ切り替えボタンをクリックしたときのイベント
switchButton.addEventListener('click', () => {
  useFrontCamera = !useFrontCamera; // カメラの向きを切り替える
  startCamera(); // カメラを再起動
});

// Step 2: Capture Image from Camera
captureButton.onclick = () => {
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
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
    downloadCsvButton.disabled = false;
  }).catch(err => {
    console.error("OCR処理中にエラーが発生しました:", err);
  });
};

// Step 4: Convert Data to CSV and Download
downloadCsvButton.onclick = () => {
  const csvData = `Data\n${ocrResult.value}`;
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, 'business-card-data.csv');
};

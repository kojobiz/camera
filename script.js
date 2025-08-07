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

// 画像の前処理（コントラストとシャープネスを改善）
function preprocessImage(ctx, width, height) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  // グレースケール変換とコントラスト強調
  for (let i = 0; i < data.length; i += 4) {
    // グレースケール化
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    
    // コントラスト強調（1.5倍）
    const contrast = 1.5;
    const adjustedGray = ((gray / 255 - 0.5) * contrast + 0.5) * 255;
    
    // 値を0-255の範囲にクリップ
    const finalValue = Math.max(0, Math.min(255, adjustedGray));
    
    data[i] = finalValue;     // R
    data[i + 1] = finalValue; // G
    data[i + 2] = finalValue; // B
    // data[i + 3] はアルファチャンネル（変更しない）
  }
  
  ctx.putImageData(imageData, 0, 0);
}

// Step 2: Capture Image from Camera
captureButton.onclick = () => {
  // ビデオの実際のサイズを取得してアスペクト比を維持
  const videoWidth = videoElement.videoWidth;
  const videoHeight = videoElement.videoHeight;
  
  // canvasのサイズをビデオと同じに設定（高解像度でキャプチャ）
  canvas.width = videoWidth;
  canvas.height = videoHeight;
  
  // ビデオをcanvasに描画（アスペクト比を維持）
  ctx.drawImage(videoElement, 0, 0, videoWidth, videoHeight);
  
  // 画像の前処理を適用
  preprocessImage(ctx, videoWidth, videoHeight);
  
  // キャプチャした画像を表示
  capturedImage.src = canvas.toDataURL('image/png');
  capturedImage.style.display = 'block';
  processButton.disabled = false;
};

// Step 3: Process OCR with Tesseract.js
processButton.onclick = () => {
  // 処理中の表示
  ocrResult.value = "処理中...";
  
  Tesseract.recognize(
    capturedImage.src,
    'jpn+eng', // 日本語と英語両方をサポート
    { 
      logger: m => console.log(m),
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン一二三四五六七八九十百千万億株式会社様御中殿氏名前後東西南北市区町村県府都道路番地号室階ビル建物営業部課係長主任代表取締役社長専務常務監査役顧問相談役電話携帯TELFAX〒@.-()（）「」『』・、。！？',
      preserve_interword_spaces: '1'
    }
  ).then(({ data: { text } }) => {
    ocrResult.value = text;
    downloadCsvButton.disabled = false;
  }).catch(err => {
    console.error("OCR処理中にエラーが発生しました:", err);
    ocrResult.value = "エラーが発生しました: " + err.message;
  });
};

// Step 4: Convert Data to CSV and Download
downloadCsvButton.onclick = () => {
  // BOM付きUTF-8でCSVを作成（Excelで文字化けを防ぐ）
  const BOM = '\uFEFF';
  const csvHeader = '"名刺データ"\n';
  const csvContent = ocrResult.value
    .split('\n')
    .map(line => '"' + line.replace(/"/g, '""') + '"')
    .join('\n');
  
  const csvData = BOM + csvHeader + csvContent;
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  
  // ファイル名に日時を追加
  const now = new Date();
  const timestamp = now.getFullYear() + 
    ('0' + (now.getMonth() + 1)).slice(-2) + 
    ('0' + now.getDate()).slice(-2) + '_' +
    ('0' + now.getHours()).slice(-2) +
    ('0' + now.getMinutes()).slice(-2);
  
  saveAs(blob, `business-card-data_${timestamp}.csv`);
};

## インカメラで起動させる方法
https://kojobiz.github.io/camera/

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Business Card OCR App</title>
  <link rel="stylesheet" href="style.css">
  <script src="https://cdn.jsdelivr.net/npm/tesseract.js@2.1.1/dist/tesseract.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
</head>
<body>
  <h1>Business Card OCR App</h1>
  
  <div>
    <button id="start-camera">Start Camera</button>
    <button id="capture" disabled>Capture Image</button>
    <button id="process" disabled>Process OCR</button>
    <button id="download-csv" disabled>Download CSV</button>
  </div>

  <div>
    <video id="video" width="300" height="200" autoplay></video>
    <canvas id="canvas" width="300" height="200"></canvas>
    <img id="captured-image" style="display:none" alt="Captured Image">
  </div>

  <div>
    <h3>OCR Result:</h3>
    <textarea id="ocr-result" rows="6" cols="50"></textarea>
  </div>

  <script src="script.js"></script>
</body>
</html>

## アウトカメラで起動させる方法

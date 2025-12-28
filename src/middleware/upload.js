const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 업로드 디렉토리 생성
const uploadDir = path.join(__dirname, '../../uploads/community');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 파일 저장 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 파일명: 타임스탬프_랜덤숫자.확장자
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `post-${uniqueSuffix}${ext}`);
  }
});

// 파일 필터 (이미지만 허용)
const fileFilter = (req, file, cb) => {
  console.log('파일 필터 체크:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    fieldname: file.fieldname
  });
  
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname || '').toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype || '');

  // MIME 타입이 올바르면 확장자 없어도 허용 (웹에서 UUID 파일명으로 올 수 있음)
  if (mimetype) {
    console.log('파일 허용됨 (MIME 타입 기반)');
    return cb(null, true);
  } else if (extname) {
    console.log('파일 허용됨 (확장자 기반)');
    return cb(null, true);
  } else {
    console.log('파일 거부됨:', { extname, mimetype });
    cb(new Error('이미지 파일만 업로드 가능합니다. (jpeg, jpg, png, gif, webp)'));
  }
};

// multer 설정
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 제한
  }
});

// 여러 이미지 업로드 (최대 5개)
const uploadPostImages = upload.array('images', 5);

module.exports = {
  uploadPostImages,
  upload
};


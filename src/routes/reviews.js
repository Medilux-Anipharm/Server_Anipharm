/**
 * 약국/병원 리뷰 라우터
 */

const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/MapReviewController');
const { authenticate, authenticateOptional } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 리뷰 미디어 업로드 디렉토리 설정
const reviewUploadDir = path.join(__dirname, '../../uploads/reviews');
if (!fs.existsSync(reviewUploadDir)) {
  fs.mkdirSync(reviewUploadDir, { recursive: true });
}

// 리뷰 미디어 파일 저장 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, reviewUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `review-${uniqueSuffix}${ext}`);
  }
});

// 파일 필터 (이미지와 비디오 허용)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi/;
  const extname = allowedTypes.test(path.extname(file.originalname || '').toLowerCase());
  const mimetype = file.mimetype && (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/'));

  if (mimetype || extname) {
    return cb(null, true);
  } else {
    cb(new Error('이미지 또는 비디오 파일만 업로드 가능합니다.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB 제한 (비디오 고려)
  }
});

// 리뷰 미디어 업로드 미들웨어 (최대 5개)
const uploadReviewMedia = upload.array('mediaFiles', 5);

// ===== 약국 리뷰 라우트 =====

// 약국 리뷰 목록 조회 (인증 선택)
router.get('/pharmacies/:pharmacyId', authenticateOptional, reviewController.getReviewList);

// 약국 리뷰 요약 조회 (인증 불필요)
router.get('/pharmacies/:pharmacyId/summary', reviewController.getReviewSummary);

// 약국 리뷰 작성 (인증 필수)
router.post('/pharmacies/:pharmacyId', authenticate, uploadReviewMedia, reviewController.createReview);

// ===== 병원 리뷰 라우트 =====

// 병원 리뷰 목록 조회 (인증 선택)
router.get('/hospitals/:hospitalId', authenticateOptional, reviewController.getReviewList);

// 병원 리뷰 요약 조회 (인증 불필요)
router.get('/hospitals/:hospitalId/summary', reviewController.getReviewSummary);

// 병원 리뷰 작성 (인증 필수)
router.post('/hospitals/:hospitalId', authenticate, uploadReviewMedia, reviewController.createReview);

// ===== 개별 리뷰 라우트 =====

// 리뷰 상세 조회 (인증 선택)
router.get('/:reviewId', authenticateOptional, reviewController.getReviewDetail);

// 리뷰 수정 (인증 필수)
router.put('/:reviewId', authenticate, uploadReviewMedia, reviewController.updateReview);

// 리뷰 삭제 (인증 필수)
router.delete('/:reviewId', authenticate, reviewController.deleteReview);

// ===== 리뷰 좋아요 라우트 =====

// 리뷰 좋아요 추가 (인증 필수)
router.post('/:reviewId/like', authenticate, reviewController.addLike);

// 리뷰 좋아요 취소 (인증 필수)
router.delete('/:reviewId/like', authenticate, reviewController.removeLike);

module.exports = router;

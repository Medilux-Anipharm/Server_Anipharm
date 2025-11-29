const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validation');

router.post('/register', validateRegister, authController.register.bind(authController));
router.post('/login', validateLogin, authController.login.bind(authController));

// TODO: 인증 관련 라우트 구현
// POST /api/auth/logout - 로그아웃
// POST /api/auth/refresh - 토큰 갱신
// POST /api/auth/social/kakao - 카카오 로그인
// POST /api/auth/social/naver - 네이버 로그인
// POST /api/auth/social/google - 구글 로그인

module.exports = router;


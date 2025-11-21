const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegister } = require('../middleware/validation');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: 회원가입
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - passwordConfirm
 *               - nickname
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *                 description: 이메일 주소
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: Password123!
 *                 description: 비밀번호 (최소 8자, 영문+숫자+특수문자)
 *               passwordConfirm:
 *                 type: string
 *                 example: Password123!
 *                 description: 비밀번호 확인
 *               nickname:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 20
 *                 example: 사용자닉네임
 *                 description: 닉네임 (2-20자, 한글/영문/숫자/언더스코어)
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 회원가입이 완료되었습니다.
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         userId:
 *                           type: integer
 *                         email:
 *                           type: string
 *                         nickname:
 *                           type: string
 *       400:
 *         description: 입력값 검증 실패
 *       409:
 *         description: 이미 사용 중인 이메일 또는 닉네임
 *       500:
 *         description: 서버 오류
 */
router.post('/register', validateRegister, authController.register.bind(authController));

// TODO: 인증 관련 라우트 구현
// POST /api/auth/login - 로그인
// POST /api/auth/logout - 로그아웃
// POST /api/auth/refresh - 토큰 갱신
// POST /api/auth/social/kakao - 카카오 로그인
// POST /api/auth/social/naver - 네이버 로그인
// POST /api/auth/social/google - 구글 로그인

module.exports = router;


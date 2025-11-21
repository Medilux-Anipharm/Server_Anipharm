const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: 내 프로필 조회 (인증 필요)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *       - basicAuth: []
 *     responses:
 *       200:
 *         description: 프로필 조회 성공
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
 *                   example: 프로필 조회 성공
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         userId:
 *                           type: integer
 *                           example: 1
 *                         email:
 *                           type: string
 *                           example: user@example.com
 *                         nickname:
 *                           type: string
 *                           example: 사용자닉네임
 *       401:
 *         description: 인증 실패
 */
router.get('/profile', authenticate, (req, res) => {
  res.json({
    success: true,
    message: '프로필 조회 성공',
    data: {
      user: req.user
    }
  });
});

// TODO: 사용자 관련 라우트 구현
// PUT /api/users/profile - 프로필 수정
// GET /api/users/:userId - 사용자 정보 조회

module.exports = router;


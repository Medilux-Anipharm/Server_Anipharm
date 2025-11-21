const authService = require('../services/authService');
const logger = require('../utils/logger');

class AuthController {
  /**
   * 회원가입
   * POST /api/auth/register
   */
  async register(req, res) {
    try {
      const { email, password, passwordConfirm, nickname } = req.body;

      // 서비스를 통한 회원가입 처리
      const user = await authService.register({
        email,
        password,
        nickname
      });

      return res.status(201).json({
        success: true,
        message: '회원가입이 완료되었습니다.',
        data: {
          user
        }
      });
    } catch (error) {
      logger.error('회원가입 컨트롤러 에러:', error);

      // 에러 타입에 따른 응답
      if (error.message.includes('이미 사용 중인')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: '회원가입 중 오류가 발생했습니다.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new AuthController();


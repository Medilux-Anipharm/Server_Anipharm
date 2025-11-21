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

  /**
   * 로그인
   * POST /api/auth/login
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // 서비스를 통한 로그인 처리
      const { token, user } = await authService.login({
        email,
        password
      });

      return res.status(200).json({
        success: true,
        message: '로그인에 성공했습니다.',
        data: {
          token,
          user
        }
      });
    } catch (error) {
      logger.error('로그인 컨트롤러 에러:', error);

      // 에러 타입에 따른 응답
      if (error.message.includes('일치하지 않습니다') || error.message.includes('비활성화')) {
        return res.status(401).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: '로그인 중 오류가 발생했습니다.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new AuthController();


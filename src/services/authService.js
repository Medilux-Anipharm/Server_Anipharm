const bcrypt = require('bcryptjs');
const { User } = require('../models');
const logger = require('../utils/logger');

class AuthService {
  /**
   * 회원가입
   * @param {Object} userData - 사용자 데이터
   * @param {string} userData.email - 이메일
   * @param {string} userData.password - 비밀번호
   * @param {string} userData.nickname - 닉네임
   * @returns {Promise<Object>} 생성된 사용자 정보
   */
  async register(userData) {
    try {
      const { email, password, nickname } = userData;

      // 비밀번호 해싱
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // 사용자 생성
      const user = await User.create({
        email,
        passwordHash,
        nickname,
        isEmailVerified: false,
        isActive: true
      });

      // 비밀번호 해시는 응답에서 제외
      const userResponse = {
        userId: user.userId,
        email: user.email,
        nickname: user.nickname,
        profileImageUrl: user.profileImageUrl,
        profileShape: user.profileShape,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
      };

      logger.info(`새 사용자 가입: ${email} (userId: ${user.userId})`);

      return userResponse;
    } catch (error) {
      logger.error('회원가입 실패:', error);
      
      // Sequelize 에러 처리
      if (error.name === 'SequelizeUniqueConstraintError') {
        const field = error.errors[0]?.path;
        if (field === 'email') {
          throw new Error('이미 사용 중인 이메일입니다.');
        } else if (field === 'nickname') {
          throw new Error('이미 사용 중인 닉네임입니다.');
        }
      }
      
      throw error;
    }
  }

  /**
   * 이메일 중복 체크
   * @param {string} email - 이메일
   * @returns {Promise<boolean>} 중복 여부
   */
  async checkEmailExists(email) {
    const user = await User.findOne({ where: { email } });
    return !!user;
  }

  /**
   * 닉네임 중복 체크
   * @param {string} nickname - 닉네임
   * @returns {Promise<boolean>} 중복 여부
   */
  async checkNicknameExists(nickname) {
    const user = await User.findOne({ where: { nickname } });
    return !!user;
  }
}

module.exports = new AuthService();


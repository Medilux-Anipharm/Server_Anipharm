const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Pharmacy } = require('../models');
const logger = require('../utils/logger');

/**
 * Bearer Token 인증
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '인증 토큰이 필요합니다.'
      });
    }

    // 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // 사용자 조회
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 토큰입니다.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: '비활성화된 계정입니다.'
      });
    }

    // req.user에 사용자 정보 추가
    req.user = {
      userId: user.userId,
      email: user.email,
      nickname: user.nickname
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '토큰이 만료되었습니다.'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 토큰입니다.'
      });
    }

    logger.error('토큰 인증 실패:', error);
    return res.status(500).json({
      success: false,
      message: '인증 처리 중 오류가 발생했습니다.'
    });
  }
};

/**
 * Basic Auth 인증 (Swagger 테스트용)
 */
const authenticateBasic = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({
        success: false,
        message: '인증 정보가 필요합니다.'
      });
    }

    // Basic Auth 디코딩
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [email, password] = credentials.split(':');

    if (!email || !password) {
      return res.status(401).json({
        success: false,
        message: '이메일과 비밀번호가 필요합니다.'
      });
    }

    // 사용자 조회
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 일치하지 않습니다.'
      });
    }

    // 계정 활성화 상태 확인
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: '비활성화된 계정입니다.'
      });
    }

    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 일치하지 않습니다.'
      });
    }

    // req.user에 사용자 정보 추가
    req.user = {
      userId: user.userId,
      email: user.email,
      nickname: user.nickname
    };

    logger.info(`Basic Auth 로그인: ${email} (userId: ${user.userId})`);

    next();
  } catch (error) {
    logger.error('Basic Auth 인증 실패:', error);
    return res.status(500).json({
      success: false,
      message: '인증 처리 중 오류가 발생했습니다.'
    });
  }
};

/**
 * 통합 인증 미들웨어 (Bearer Token 또는 Basic Auth)
 * Swagger 테스트 시 편의성을 위해 두 가지 방식 모두 지원
 */
const authenticate = async (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: '인증이 필요합니다.'
    });
  }

  // Bearer Token 방식
  if (authHeader.startsWith('Bearer ')) {
    return authenticateToken(req, res, next);
  }

  // Basic Auth 방식
  if (authHeader.startsWith('Basic ')) {
    return authenticateBasic(req, res, next);
  }

  return res.status(401).json({
    success: false,
    message: '지원하지 않는 인증 방식입니다.'
  });
};

/**
 * 선택적 인증 미들웨어
 * 토큰이 있으면 인증하고, 없으면 그냥 통과
 * 게시글 조회 등 로그인 선택적인 기능에 사용
 */
const authenticateOptional = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // 토큰이 없으면 그냥 통과 (req.user는 undefined)
      return next();
    }

    // Bearer Token인 경우에만 검증
    if (!authHeader.startsWith('Bearer ')) {
      return next();
    }

    try {
      // 토큰 검증
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

      // 사용자 조회
      const user = await User.findByPk(decoded.userId);

      if (user && user.isActive) {
        // 유효한 사용자면 req.user에 추가
        req.user = {
          userId: user.userId,
          email: user.email,
          nickname: user.nickname
        };
      }
    } catch (error) {
      // 토큰 검증 실패해도 그냥 통과 (로그만 남김)
      logger.debug('Optional auth - invalid token:', error.message);
    }

    next();
  } catch (error) {
    logger.error('Optional auth error:', error);
    next(); // 에러가 있어도 통과
  }
};
/**
 * Pharmacy 전용 Bearer Token 인증
 */
const authenticatePharmacy = async (req, res, next) => {
  try {
    logger.info('[authenticatePharmacy] 약국 인증 시작');
    logger.info('[authenticatePharmacy] 요청 URL:', req.originalUrl);

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    logger.info('[authenticatePharmacy] Authorization 헤더 존재:', !!authHeader);
    logger.info('[authenticatePharmacy] 토큰 존재:', !!token);

    if (!authHeader || !authHeader.startsWith('Bearer ') || !token) {
      logger.error('[authenticatePharmacy] 토큰 없음 또는 형식 오류');
      return res.status(401).json({
        success: false,
        message: '약국 인증 토큰이 필요합니다.'
      });
    }

    // 토큰 검증
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    );

    logger.info('[authenticatePharmacy] 토큰 디코딩 성공:', JSON.stringify(decoded));

    // 타입 검증 (⭐ 핵심)
    if (decoded.type !== 'pharmacy') {
      logger.error('[authenticatePharmacy] 약국 토큰이 아님. type:', decoded.type);
      return res.status(403).json({
        success: false,
        message: '약국 전용 토큰이 아닙니다.'
      });
    }

    // 약국 조회
    logger.info('[authenticatePharmacy] 약국 조회 시작. pharmacyId:', decoded.pharmacyId);
    const pharmacy = await Pharmacy.findByPk(decoded.pharmacyId);

    if (!pharmacy) {
      logger.error('[authenticatePharmacy] 약국을 찾을 수 없음. pharmacyId:', decoded.pharmacyId);
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 약국 토큰입니다.'
      });
    }

    logger.info('[authenticatePharmacy] 약국 찾음:', pharmacy.name);

    if (!pharmacy.isActive) {
      logger.error('[authenticatePharmacy] 비활성화된 약국:', pharmacy.pharmacyId);
      return res.status(403).json({
        success: false,
        message: '비활성화된 약국 계정입니다.'
      });
    }

    // req.pharmacy에 주입
    req.pharmacy = {
      pharmacyId: pharmacy.pharmacyId,
      name: pharmacy.name
    };

    logger.info('[authenticatePharmacy] 인증 성공. req.pharmacy:', JSON.stringify(req.pharmacy));
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.error('[authenticatePharmacy] 토큰 만료됨');
      return res.status(401).json({
        success: false,
        message: '토큰이 만료되었습니다.'
      });
    }

    logger.error('[authenticatePharmacy] 인증 실패:', error.message);
    logger.error('[authenticatePharmacy] 에러 스택:', error.stack);
    return res.status(401).json({
      success: false,
      message: '약국 인증에 실패했습니다.'
    });
  }
};

module.exports = {
  authenticate,
  authenticateToken,
  authenticateBasic,
  authenticateOptional,
  authenticatePharmacy,
};


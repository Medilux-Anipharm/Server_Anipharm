const { body, validationResult } = require('express-validator');
const { User } = require('../models');

// 에러 포맷팅
const formatValidationErrors = (errors) => {
  return errors.array().map(err => ({
    field: err.path,
    message: err.msg,
    value: err.value
  }));
};

// 검증 결과 처리 미들웨어
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: '입력값 검증 실패',
      errors: formatValidationErrors(errors)
    });
  }
  next();
};

// 회원가입 검증 규칙
const validateRegister = [
  // 이메일 검증
  body('email')
    .trim()
    .notEmpty()
    .withMessage('이메일을 입력해주세요.')
    .isEmail()
    .withMessage('올바른 이메일 형식이 아닙니다.')
    .normalizeEmail()
    .custom(async (email) => {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error('이미 사용 중인 이메일입니다.');
      }
      return true;
    }),

  // 비밀번호 검증
  body('password')
    .trim()
    .notEmpty()
    .withMessage('비밀번호를 입력해주세요.')
    .isLength({ min: 8 })
    .withMessage('비밀번호는 최소 8자 이상이어야 합니다.')
    .matches(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/)
    .withMessage('비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.'),

  // 비밀번호 확인 검증
  body('passwordConfirm')
    .trim()
    .notEmpty()
    .withMessage('비밀번호 확인을 입력해주세요.')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('비밀번호가 일치하지 않습니다.');
      }
      return true;
    }),

  // 닉네임 검증
  body('nickname')
    .trim()
    .notEmpty()
    .withMessage('닉네임을 입력해주세요.')
    .isLength({ min: 2, max: 20 })
    .withMessage('닉네임은 2자 이상 20자 이하여야 합니다.')
    .matches(/^[가-힣a-zA-Z0-9_]+$/)
    .withMessage('닉네임은 한글, 영문, 숫자, 언더스코어(_)만 사용 가능합니다.')
    .custom(async (nickname) => {
      const existingUser = await User.findOne({ where: { nickname } });
      if (existingUser) {
        throw new Error('이미 사용 중인 닉네임입니다.');
      }
      return true;
    }),

  handleValidationErrors
];

// 로그인 검증 규칙
const validateLogin = [
  // 이메일 검증
  body('email')
    .trim()
    .notEmpty()
    .withMessage('이메일을 입력해주세요.')
    .isEmail()
    .withMessage('올바른 이메일 형식이 아닙니다.')
    .normalizeEmail(),

  // 비밀번호 검증
  body('password')
    .trim()
    .notEmpty()
    .withMessage('비밀번호를 입력해주세요.'),

  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  handleValidationErrors
};


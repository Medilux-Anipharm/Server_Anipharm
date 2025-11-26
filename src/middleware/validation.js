const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const { VALID_HEALTH_CONCERNS, MAX_HEALTH_CONCERNS } = require('../constants/petHealthConcerns');

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

// 반려동물 등록 검증 규칙
const validateCreatePet = [
  // 이름 검증
  body('name')
    .trim()
    .notEmpty()
    .withMessage('반려동물 이름을 입력해주세요.')
    .isLength({ max: 10 })
    .withMessage('이름은 최대 10자까지 입력 가능합니다.'),

  // 종 검증
  body('species')
    .trim()
    .notEmpty()
    .withMessage('반려동물 종을 선택해주세요.')
    .isIn(['강아지', '고양이'])
    .withMessage('종은 강아지 또는 고양이만 선택 가능합니다.'),

  // 생년월일 검증
  body('birthDate')
    .notEmpty()
    .withMessage('생년월일을 입력해주세요.')
    .isDate()
    .withMessage('올바른 날짜 형식이 아닙니다. (YYYY-MM-DD)')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      if (birthDate > today) {
        throw new Error('생년월일은 오늘 이전 날짜여야 합니다.');
      }
      return true;
    }),

  // 건강 고민 검증
  body('healthConcerns')
    .optional()
    .isArray()
    .withMessage('건강 고민은 배열 형식이어야 합니다.')
    .custom((concerns) => {
      if (concerns.length > MAX_HEALTH_CONCERNS) {
        throw new Error(`건강 고민은 최대 ${MAX_HEALTH_CONCERNS}개까지 선택 가능합니다.`);
      }
      for (const concern of concerns) {
        if (!VALID_HEALTH_CONCERNS.includes(concern)) {
          throw new Error(`유효하지 않은 건강 고민입니다: ${concern}`);
        }
      }
      return true;
    }),

  // 품종 검증 (선택)
  body('breed')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('품종은 최대 50자까지 입력 가능합니다.'),

  // 성별 검증 (선택)
  body('gender')
    .optional()
    .isIn(['male', 'female', 'neutered_male', 'neutered_female'])
    .withMessage('올바른 성별 형식이 아닙니다.'),

  // 체중 검증 (선택)
  body('weight')
    .optional()
    .isFloat({ min: 0, max: 999.99 })
    .withMessage('체중은 0~999.99 사이의 숫자여야 합니다.'),

  handleValidationErrors
];

// 반려동물 수정 검증 규칙
const validateUpdatePet = [
  // 이름 검증 (선택)
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('반려동물 이름을 입력해주세요.')
    .isLength({ max: 10 })
    .withMessage('이름은 최대 10자까지 입력 가능합니다.'),

  // 종 검증 (선택)
  body('species')
    .optional()
    .trim()
    .isIn(['강아지', '고양이'])
    .withMessage('종은 강아지 또는 고양이만 선택 가능합니다.'),

  // 생년월일 검증 (선택)
  body('birthDate')
    .optional()
    .isDate()
    .withMessage('올바른 날짜 형식이 아닙니다. (YYYY-MM-DD)')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      if (birthDate > today) {
        throw new Error('생년월일은 오늘 이전 날짜여야 합니다.');
      }
      return true;
    }),

  // 건강 고민 검증 (선택)
  body('healthConcerns')
    .optional()
    .isArray()
    .withMessage('건강 고민은 배열 형식이어야 합니다.')
    .custom((concerns) => {
      if (concerns.length > MAX_HEALTH_CONCERNS) {
        throw new Error(`건강 고민은 최대 ${MAX_HEALTH_CONCERNS}개까지 선택 가능합니다.`);
      }
      for (const concern of concerns) {
        if (!VALID_HEALTH_CONCERNS.includes(concern)) {
          throw new Error(`유효하지 않은 건강 고민입니다: ${concern}`);
        }
      }
      return true;
    }),

  // 품종 검증 (선택)
  body('breed')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('품종은 최대 50자까지 입력 가능합니다.'),

  // 성별 검증 (선택)
  body('gender')
    .optional()
    .isIn(['male', 'female', 'neutered_male', 'neutered_female'])
    .withMessage('올바른 성별 형식이 아닙니다.'),

  // 체중 검증 (선택)
  body('weight')
    .optional()
    .isFloat({ min: 0, max: 999.99 })
    .withMessage('체중은 0~999.99 사이의 숫자여야 합니다.'),

  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateCreatePet,
  validateUpdatePet,
  handleValidationErrors
};


const express = require('express');
const router = express.Router();

// Swagger 패키지가 설치되어 있는지 확인
let swaggerUi, swaggerJsdoc;
try {
  swaggerUi = require('swagger-ui-express');
  swaggerJsdoc = require('swagger-jsdoc');
} catch (error) {
  // Swagger 패키지가 없으면 기본 라우트만 제공
  router.get('/', (req, res) => {
    res.status(503).json({
      error: 'Swagger UI is not available',
      message: 'Please install swagger-ui-express and swagger-jsdoc packages',
      install: 'npm install swagger-ui-express swagger-jsdoc'
    });
  });
  module.exports = router;
  return;
}

// Swagger 설정
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Anipharm API',
      version: '1.0.0',
      description: '펫케어 앱 백엔드 API 문서',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '개발 서버',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT 토큰 인증 (로그인 후 받은 토큰 입력)',
        },
        basicAuth: {
          type: 'http',
          scheme: 'basic',
          description: 'Basic 인증 (Swagger 테스트용 - 이메일/비밀번호 입력)',
        },
      },
    },
    security: [
      { bearerAuth: [] },
      { basicAuth: [] },
    ],
  },
  apis: [
    './src/routes/*.js', // 라우트 파일에서 주석을 읽어옴
    './src/swagger/**/*.js' // Swagger 정의 파일
  ],
};

const swaggerSpec = swaggerJsdoc(options);

// Swagger UI 제공
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Anipharm API 문서',
}));

// JSON 형식으로도 제공
router.get('/json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

module.exports = router;


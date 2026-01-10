const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cron = require('node-cron');
require('dotenv').config();

const sequelize = require('./config/database');
const logger = require('./utils/logger');

// 라우트 임포트
const docsRoutes = require('./routes/docs');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const petRoutes = require('./routes/pets');
const pharmacyRoutes = require('./routes/pharmacies');
const hospitalRoutes = require('./routes/hospitals');
const medicationRoutes = require('./routes/medications');
const chatbotRoutes = require('./routes/chatbot');
const healthChatbotRoutes = require('./routes/healthChatbot');
const healthRoutes = require('./routes/health');
const communityRoutes = require('./routes/community');
const messageRoutes = require('./routes/messages');
const notificationRoutes = require('./routes/notifications');
const mapRoutes = require('./routes/map');
const reviewRoutes = require('./routes/reviews');
const pickupRoutes = require('./routes/pickup');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 설정
const corsOptions = {
  origin: function (origin, callback) {
    // 개발 환경에서는 모든 origin 허용
    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
      return;
    }
    
    // origin이 없는 경우 (모바일 앱, Postman 등) 허용
    if (!origin) {
      callback(null, true);
      return;
    }
    
    // 프로덕션에서는 허용된 origin만
    const allowedOrigins = [
      'http://localhost:8081',  // React Native Web
      'http://localhost:19006', // Expo Web
      'http://localhost:3000',
      'http://127.0.0.1:8081',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:19006', // Expo Web
      'http://127.0.0.1:3000',
      'http://192.168.0.53:8081',  // 모바일에서 접근
      'http://192.168.0.57:8081',  // 현재 사용 중인 IP
      'http://192.168.0.57:19006', // Expo Web
      'http://192.168.0.57:3000'   // 백엔드 서버
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // 개발 환경이 아닌 경우에만 CORS 오류
      console.warn('CORS 차단된 origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// 미들웨어
// CORS를 먼저 적용 (helmet보다 먼저)
app.use(cors(corsOptions));

// helmet 설정 (CORS와 충돌 방지)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // 개발 환경에서는 비활성화
}));
app.use(compression());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 정적 파일 서빙
app.use('/uploads', express.static('uploads'));

// 헬스 체크
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 문서 (Swagger)
app.use('/api-docs', docsRoutes);

// API 라우트
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/chatbot', healthChatbotRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/pickup', pickupRoutes);

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 데이터베이스 연결 및 서버 시작
const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('데이터베이스 연결 성공');

    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: false });
      logger.info('데이터베이스 동기화 완료');
    }

    // 자동 취소 스케줄러 설정 (매일 자정 실행)
    cron.schedule('0 0 * * *', async () => {
      logger.info('[Scheduler] 픽업 자동 취소 스케줄러 실행');
      try {
        const pickupService = require('./services/pickupService');
        const canceledCount = await pickupService.autoCancel();
        logger.info(`[Scheduler] ${canceledCount}건의 픽업 요청이 자동 취소되었습니다.`);
      } catch (error) {
        logger.error('[Scheduler] 자동 취소 실행 오류:', error);
      }
    });
    logger.info('픽업 자동 취소 스케줄러 설정 완료 (매일 00:00 실행)');

    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`서버가 포트 ${PORT}에서 실행 중입니다. (0.0.0.0:${PORT})`);
    });
  } catch (error) {
    logger.error('서버 시작 실패:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;



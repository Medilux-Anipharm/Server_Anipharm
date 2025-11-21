const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
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
const chatbotRoutes = require('./routes/chatbot');
const healthRoutes = require('./routes/health');
const communityRoutes = require('./routes/community');
const messageRoutes = require('./routes/messages');
const notificationRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(helmet());
app.use(cors());
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
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

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

    app.listen(PORT, () => {
      logger.info(`서버가 포트 ${PORT}에서 실행 중입니다.`);
    });
  } catch (error) {
    logger.error('서버 시작 실패:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;


const { Sequelize } = require('sequelize');
const path = require('path');

// .env 파일 경로 명시적으로 지정
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'anipharm_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: false
    }
  }
);

module.exports = sequelize;


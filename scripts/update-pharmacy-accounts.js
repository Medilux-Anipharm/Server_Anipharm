/**
 * 기존 약국 데이터에 계정 정보 추가 스크립트
 * 비밀번호: Password123!
 * 사업자번호: 각 약국마다 고유값 생성
 */

const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');
require('dotenv').config();

// 데이터베이스 연결
const sequelize = new Sequelize(
  process.env.DB_NAME || 'anipharm_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log
  }
);

// 고유 사업자번호 생성 (XXX-XX-XXXXX 형식)
function generateBusinessNumber(index) {
  const part1 = String(100 + index).padStart(3, '0');
  const part2 = String(10 + (index % 90)).padStart(2, '0');
  const part3 = String(10000 + index).padStart(5, '0');
  return `${part1}-${part2}-${part3}`;
}

async function updatePharmacyAccounts() {
  try {
    console.log('데이터베이스 연결 중...');
    await sequelize.authenticate();
    console.log('데이터베이스 연결 성공!');

    // 비밀번호 해시 생성 (Password123!)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash('Password123!', saltRounds);
    console.log('비밀번호 해시 생성 완료:', passwordHash);

    // 모든 약국 데이터 조회
    const [pharmacies] = await sequelize.query(
      'SELECT pharmacy_id, name FROM pharmacies ORDER BY pharmacy_id'
    );

    console.log(`\n총 ${pharmacies.length}개의 약국 데이터 발견\n`);

    // 각 약국에 계정 정보 추가
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < pharmacies.length; i++) {
      const pharmacy = pharmacies[i];
      const pharmacyId = pharmacy.pharmacy_id;
      const pharmacyName = pharmacy.name;

      // 이메일 생성 (pharmacy{id}@anipharm.com)
      const pharmacyEmail = `pharmacy${pharmacyId}@anipharm.com`;

      // 사업자번호 생성
      const businessNumber = generateBusinessNumber(i);

      try {
        // 계정 정보 업데이트
        await sequelize.query(
          `UPDATE pharmacies
           SET pharmacy_email = :email,
               password_hash = :passwordHash,
               business_number = :businessNumber,
               is_active = true
           WHERE pharmacy_id = :pharmacyId`,
          {
            replacements: {
              email: pharmacyEmail,
              passwordHash: passwordHash,
              businessNumber: businessNumber,
              pharmacyId: pharmacyId
            }
          }
        );

        successCount++;
        console.log(`✓ [${successCount}/${pharmacies.length}] ${pharmacyName} (ID: ${pharmacyId})`);
        console.log(`  - 이메일: ${pharmacyEmail}`);
        console.log(`  - 사업자번호: ${businessNumber}`);
        console.log(`  - 비밀번호: Password123!`);
      } catch (error) {
        failCount++;
        console.error(`✗ [실패] ${pharmacyName} (ID: ${pharmacyId}): ${error.message}`);
      }
    }

    console.log('\n=== 업데이트 완료 ===');
    console.log(`성공: ${successCount}개`);
    console.log(`실패: ${failCount}개`);
    console.log(`\n모든 약국의 비밀번호: Password123!`);

  } catch (error) {
    console.error('스크립트 실행 중 오류 발생:', error);
  } finally {
    await sequelize.close();
    console.log('\n데이터베이스 연결 종료');
  }
}

// 스크립트 실행
updatePharmacyAccounts();

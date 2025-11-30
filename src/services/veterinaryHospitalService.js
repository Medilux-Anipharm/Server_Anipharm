/**
 * 동물병원 서비스
 * - CSV 파일에서 동물병원 데이터를 읽어 DB에 저장
 * - 네이버 지도 API 연동을 위한 데이터 제공
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const db = require('../models');

class VeterinaryHospitalService {
  constructor() {
    this.VeterinaryHospital = db.VeterinaryHospital;
  }

  /**
   * CSV 파일을 읽어서 DB에 저장
   */
  async importFromCSV() {
    const csvFilePath = path.join(__dirname, '../../data/csv/동물병원.csv');
    const results = [];

    return new Promise((resolve, reject) => {
      console.log('CSV 파일 경로:', csvFilePath);

      // 파일 존재 확인
      if (!fs.existsSync(csvFilePath)) {
        return reject(new Error(`CSV 파일을 찾을 수 없습니다: ${csvFilePath}`));
      }

      let rowCount = 0;

      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => {
          rowCount++;

          // 첫 번째 행 로깅 (디버깅용)
          if (rowCount === 1) {
            console.log('CSV 컬럼명:', Object.keys(data));
            console.log('첫 번째 데이터:', data);
          }

          // CSV 데이터를 DB 모델 형식으로 변환
          const hospitalData = {
            name: data['상호명'],
            address: data['도로명주소'],
            phone: data['대표전화'] || null,
            operatingHours: data['운영시간'] || null,
            website: data['홈페이지'] || null,
            latitude: parseFloat(data['위도']) || 0,
            longitude: parseFloat(data['경도']) || 0,
            is24h: this._check24Hours(data['상호명'], data['운영시간']) || false,
            isEmergency: this._checkEmergency(data['상호명']) || false
          };

          // 필수 필드 검증
          if (hospitalData.name && hospitalData.address && hospitalData.latitude && hospitalData.longitude) {
            results.push(hospitalData);
          } else {
            console.warn(`행 ${rowCount}: 필수 데이터 누락 -`, hospitalData);
          }
        })
        .on('end', async () => {
          try {
            console.log(`총 ${rowCount}개 행을 읽었고, ${results.length}개의 유효한 데이터를 처리했습니다.`);

            if (results.length === 0) {
              return reject(new Error('처리할 유효한 데이터가 없습니다.'));
            }

            // DB에 bulk insert
            await this.VeterinaryHospital.bulkCreate(results, {
              updateOnDuplicate: ['name', 'address', 'phone', 'operatingHours', 'website', 'latitude', 'longitude', 'is24h', 'isEmergency']
            });

            console.log('동물병원 데이터 저장 완료!');
            resolve({ success: true, count: results.length });
          } catch (error) {
            console.error('DB 저장 중 오류:', error);
            reject(error);
          }
        })
        .on('error', (error) => {
          console.error('CSV 파일 읽기 오류:', error);
          reject(error);
        });
    });
  }

  /**
   * 24시간 운영 여부 체크
   */
  _check24Hours(name, operatingHours) {
    if (!name && !operatingHours) return false;

    const nameCheck = name && name.includes('24시');
    const hoursCheck = operatingHours && operatingHours.includes('00:00 - 24:00');

    return nameCheck || hoursCheck;
  }

  /**
   * 응급 병원 여부 체크
   */
  _checkEmergency(name) {
    if (!name) return false;

    const keywords = ['응급', '메디컬센터', '센터', '종합'];
    return keywords.some(keyword => name.includes(keyword));
  }

  /**
   * 위치 기반 동물병원 검색 (네이버 지도 API용)
   * @param {number} latitude - 위도
   * @param {number} longitude - 경도
   * @param {number} radiusKm - 반경 (km)
   */
  async findNearbyHospitals(latitude, longitude, radiusKm = 5) {
    try {
      // Haversine 공식을 사용한 거리 계산
      const hospitals = await this.VeterinaryHospital.findAll({
        attributes: {
          include: [
            [
              db.sequelize.literal(`(
                6371 * acos(
                  cos(radians(${latitude})) *
                  cos(radians(latitude)) *
                  cos(radians(longitude) - radians(${longitude})) +
                  sin(radians(${latitude})) *
                  sin(radians(latitude))
                )
              )`),
              'distance'
            ]
          ]
        },
        having: db.sequelize.literal(`distance < ${radiusKm}`),
        order: [[db.sequelize.literal('distance'), 'ASC']],
        limit: 50
      });

      return hospitals;
    } catch (error) {
      console.error('주변 병원 검색 오류:', error);
      throw error;
    }
  }

  /**
   * 키워드로 동물병원 검색
   */
  async searchByKeyword(keyword, limit = 20) {
    try {
      const hospitals = await this.VeterinaryHospital.findAll({
        where: {
          [db.Sequelize.Op.or]: [
            { name: { [db.Sequelize.Op.like]: `%${keyword}%` } },
            { address: { [db.Sequelize.Op.like]: `%${keyword}%` } }
          ]
        },
        limit,
        order: [['ratingAverage', 'DESC']]
      });

      return hospitals;
    } catch (error) {
      console.error('키워드 검색 오류:', error);
      throw error;
    }
  }

  /**
   * 특정 동물병원 상세 정보 조회
   */
  async getHospitalDetail(hospitalId) {
    try {
      const hospital = await this.VeterinaryHospital.findByPk(hospitalId, {
        include: [
          { model: db.FacilityPhoto, as: 'photos' },
          { model: db.FacilityReview, as: 'reviews' }
        ]
      });

      return hospital;
    } catch (error) {
      console.error('병원 상세 정보 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 네이버 지도 API용 마커 데이터 생성
   */
  async getMarkersForMap(latitude, longitude, radiusKm = 5) {
    try {
      const hospitals = await this.findNearbyHospitals(latitude, longitude, radiusKm);

      // 네이버 지도 마커 형식으로 변환
      const markers = hospitals.map(hospital => ({
        id: hospital.hospitalId,
        position: {
          lat: parseFloat(hospital.latitude),
          lng: parseFloat(hospital.longitude)
        },
        title: hospital.name,
        address: hospital.address,
        phone: hospital.phone,
        is24h: hospital.is24h,
        isEmergency: hospital.isEmergency,
        rating: hospital.ratingAverage,
        reviewCount: hospital.reviewCount
      }));

      return markers;
    } catch (error) {
      console.error('마커 데이터 생성 오류:', error);
      throw error;
    }
  }

  /**
   * 24시간 운영 병원만 조회
   */
  async get24HourHospitals() {
    try {
      const hospitals = await this.VeterinaryHospital.findAll({
        where: { is24h: true },
        order: [['ratingAverage', 'DESC']]
      });

      return hospitals;
    } catch (error) {
      console.error('24시간 병원 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 평점 높은 병원 조회
   */
  async getTopRatedHospitals(limit = 10) {
    try {
      const hospitals = await this.VeterinaryHospital.findAll({
        where: {
          reviewCount: { [db.Sequelize.Op.gte]: 5 } // 최소 5개 이상의 리뷰
        },
        order: [['ratingAverage', 'DESC']],
        limit
      });

      return hospitals;
    } catch (error) {
      console.error('평점 높은 병원 조회 오류:', error);
      throw error;
    }
  }
}

module.exports = new VeterinaryHospitalService();
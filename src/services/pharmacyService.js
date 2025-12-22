/**
 * 동물약국 서비스
 * - CSV 파일에서 동물약국 데이터를 읽어 DB에 저장
 * - 네이버 지도 API 연동을 위한 데이터 제공
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const geolib = require('geolib');
const db = require('../models');

class PharmacyService {
  constructor() {
    this.Pharmacy = db.Pharmacy;
  }

  /**
   * CSV 파일을 읽어서 DB에 저장
   */
  async importFromCSV() {
    const csvFilePath = path.join(__dirname, '../../data/csv/동물약국.csv');
    const results = [];

    return new Promise((resolve, reject) => {
      console.log('CSV 파일 경로:', csvFilePath);

      // 파일 존재 확인
      if (!fs.existsSync(csvFilePath)) {
        return reject(new Error(`CSV 파일을 찾을 수 없습니다: ${csvFilePath}`));
      }

      let rowCount = 0;

      fs.createReadStream(csvFilePath)
        .pipe(csv({
          skipEmptyLines: true,
          skipLinesWithError: true
        }))
        .on('data', (data) => {
          rowCount++;

          // 첫 번째 행 로깅 (디버깅용)
          if (rowCount === 1) {
            console.log('CSV 컬럼명:', Object.keys(data));
            console.log('첫 번째 데이터:', data);
          }

          // 실제 CSV 파일 형식에 맞춰 데이터 추출
          // CSV 헤더: 상호명,도로명주소,운영시간,대표전화,홈페이지,위도,경도
          const name = data['상호명'] || null;
          const address = data['도로명주소'] || null;
          const phone = data['대표전화'] || null;
          const operatingHours = data['운영시간'] || null;
          const website = data['홈페이지'] || null;
          const latitudeStr = data['위도'] || null;
          const longitudeStr = data['경도'] || null;

          // 문자열이면 trim, 아니면 그대로 사용
          const nameTrimmed = name && typeof name === 'string' ? name.trim() : name;
          const addressTrimmed = address && typeof address === 'string' ? address.trim() : address;
          
          // 위도/경도 파싱
          const latitude = latitudeStr ? parseFloat(latitudeStr) : null;
          const longitude = longitudeStr ? parseFloat(longitudeStr) : null;

          // 필수 필드 검증 (name, address, latitude, longitude가 모두 유효해야 함)
          if (!nameTrimmed || !addressTrimmed || 
              latitude === null || longitude === null || 
              isNaN(latitude) || isNaN(longitude) ||
              latitude === 0 || longitude === 0) {
            // 처음 10개와 1000개마다만 경고 출력
            if (rowCount <= 10 || rowCount % 1000 === 0) {
              console.warn(`행 ${rowCount}: 필수 데이터 누락 - 건너뜀`, {
                name: nameTrimmed,
                address: addressTrimmed,
                latitude,
                longitude
              });
            }
            return;
          }

          // CSV 데이터를 DB 모델 형식으로 변환
          const pharmacyData = {
            name: nameTrimmed,
            address: addressTrimmed,
            phone: phone && typeof phone === 'string' ? phone.trim() : phone,
            operatingHours: operatingHours && typeof operatingHours === 'string' ? operatingHours.trim() : operatingHours,
            website: website && typeof website === 'string' ? website.trim() : website,
            latitude: latitude,
            longitude: longitude,
        
          };

          // 최종 검증 후 추가
          results.push(pharmacyData);
        })
        .on('end', async () => {
          try {
            console.log(`총 ${rowCount}개 행을 읽었고, ${results.length}개의 유효한 데이터를 처리했습니다.`);

            if (results.length === 0) {
              return reject(new Error('처리할 유효한 데이터가 없습니다.'));
            }

            // DB에 bulk insert
            await this.Pharmacy.bulkCreate(results, {
              updateOnDuplicate: ['name', 'address', 'phone', 'operatingHours', 'website', 'latitude', 'longitude']
            });

            console.log('동물약국 데이터 저장 완료!');
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
   * 응급 약국 여부 체크
   */
  _checkEmergency(name) {
    if (!name) return false;

    const keywords = ['응급', '메디컬센터', '센터', '종합'];
    return keywords.some(keyword => name.includes(keyword));
  }

  /**
   * 위치 기반 동물약국 검색 (네이버 지도 API용)
   * @param {number} latitude - 위도
   * @param {number} longitude - 경도
   * @param {number} radiusKm - 반경 (km)
   */
  async findNearbyPharmacies(latitude, longitude, radiusKm = 10) {
    try {
      // 모든 약국 데이터를 가져온 후 JavaScript에서 거리 계산 및 필터링
      const allPharmacies = await this.Pharmacy.findAll({
        attributes: ['pharmacyId', 'name', 'phone', 'address', 'addressDetail', 'operatingHours', 'website',
          'latitude', 'longitude', 'ratingAverage', 'reviewCount']
      });

      // 기준 위치
      const centerPoint = { latitude, longitude };
      const radiusMeters = radiusKm * 1000; // km를 미터로 변환

      // 거리 계산 및 필터링
      const pharmaciesWithDistance = allPharmacies
        .map(pharmacy => {
          // 좌표가 유효한지 확인
          if (!pharmacy.latitude || !pharmacy.longitude) {
            return null;
          }

          const pharmacyPoint = {
            latitude: parseFloat(pharmacy.latitude),
            longitude: parseFloat(pharmacy.longitude)
          };

          // 거리 계산 (미터 단위)
          const distanceMeters = geolib.getDistance(centerPoint, pharmacyPoint);
          const distanceKm = distanceMeters / 1000; // km로 변환

          // 반경 내에 있는지 확인
          if (distanceKm <= radiusKm) {
            const pharmacyData = pharmacy.toJSON();
            // 운영시간 기반으로 24시간 여부 계산
            pharmacyData.is24h = this._check24Hours(pharmacy.name, pharmacy.operatingHours);
            pharmacyData.isEmergency = this._checkEmergency(pharmacy.name);
            pharmacyData.distance = distanceKm; // km 단위로 저장
            
            return pharmacyData;
          }
          return null;
        })
        .filter(pharmacy => pharmacy !== null) // null 제거
        .sort((a, b) => a.distance - b.distance) // 거리순 정렬
        .slice(0, 50); // 최대 50개만 반환

      return pharmaciesWithDistance;
    } catch (error) {
      console.error('주변 약국 검색 오류:', error);
      throw error;
    }
  }

  /**
   * 키워드로 동물약국 검색
   */
  async searchByKeyword(keyword, limit = 20) {
    try {
      const pharmacies = await this.Pharmacy.findAll({
        where: {
          [db.Sequelize.Op.or]: [
            { name: { [db.Sequelize.Op.like]: `%${keyword}%` } },
            { address: { [db.Sequelize.Op.like]: `%${keyword}%` } }
          ]
        },
        limit,
        order: [['ratingAverage', 'DESC']]
      });

      return pharmacies;
    } catch (error) {
      console.error('키워드 검색 오류:', error);
      throw error;
    }
  }

  /**
   * 특정 동물약국 상세 정보 조회
   */
  async getPharmacyDetail(pharmacyId) {
    try {
      const pharmacy = await this.Pharmacy.findByPk(pharmacyId);

      return pharmacy;
    } catch (error) {
      console.error('약국 상세 정보 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 줌 레벨에 따른 반경 계산
   * @param {number} zoomLevel - 지도 줌 레벨 (기본값: 14)
   * @returns {number} 반경 (km)
   */
  _calculateRadiusFromZoom(zoomLevel = 14) {
    // 줌 레벨에 따른 반경 계산
    // 줌 레벨이 낮을수록 (줌 아웃) 더 넓은 범위
    if (zoomLevel <= 10) {
      return 50; // 매우 넓은 범위
    } else if (zoomLevel <= 12) {
      return 30; // 넓은 범위
    } else if (zoomLevel <= 14) {
      return 15; // 중간 범위
    } else if (zoomLevel <= 16) {
      return 10; // 좁은 범위
    } else {
      return 5; // 매우 좁은 범위
    }
  }

  /**
   * 네이버 지도 API용 마커 데이터 생성
   * @param {number} latitude - 위도
   * @param {number} longitude - 경도
   * @param {number} radiusKm - 반경 (km, 기본값: 10)
   * @param {number} zoomLevel - 지도 줌 레벨 (기본값: 14)
   */
  async getMarkersForMap(latitude, longitude, radiusKm = 10, zoomLevel = 14) {
    try {
      // 줌 레벨이 제공된 경우 반경 자동 계산
      const effectiveRadius = zoomLevel ? this._calculateRadiusFromZoom(zoomLevel) : radiusKm;

      // 반경에 따라 최대 반환 개수 조정
      const maxResults = effectiveRadius >= 30 ? 100 : effectiveRadius >= 15 ? 50 : 30;

      const pharmacies = await this.findNearbyPharmacies(latitude, longitude, effectiveRadius);

      // 최대 개수만큼만 반환
      const limitedPharmacies = pharmacies.slice(0, maxResults);

      // 네이버 지도 마커 형식으로 변환
      const markers = limitedPharmacies.map(pharmacy => {
        // 운영시간 기반으로 24시간 여부 계산
        const is24h = this._check24Hours(pharmacy.name, pharmacy.operatingHours);
        const isEmergency = this._checkEmergency(pharmacy.name);
        
        return {
          id: pharmacy.pharmacyId,
          position: {
            lat: parseFloat(pharmacy.latitude),
            lng: parseFloat(pharmacy.longitude)
          },
          title: pharmacy.name,
          address: pharmacy.address,
          addressDetail: pharmacy.addressDetail,
          phone: pharmacy.phone,
          operatingHours: pharmacy.operatingHours,
          website: pharmacy.website,
          is24h: is24h,
          isEmergency: isEmergency,
          rating: pharmacy.ratingAverage,
          reviewCount: pharmacy.reviewCount,
          distance: pharmacy.distance // 거리 정보 추가
        };
      });

      return markers;
    } catch (error) {
      console.error('마커 데이터 생성 오류:', error);
      throw error;
    }
  }

  /**
   * 24시간 운영 약국만 조회
   */
  async get24HourPharmacies() {
    try {
      // 모든 약국을 가져온 후 운영시간 기반으로 필터링
      const allPharmacies = await this.Pharmacy.findAll({
        attributes: ['pharmacyId', 'name', 'phone', 'address', 'addressDetail', 'operatingHours', 'website',
          'latitude', 'longitude', 'ratingAverage', 'reviewCount'],
        order: [['ratingAverage', 'DESC']]
      });

      // 운영시간 기반으로 24시간 약국 필터링
      const pharmacies24h = allPharmacies.filter(pharmacy => 
        this._check24Hours(pharmacy.name, pharmacy.operatingHours)
      );

      return pharmacies24h;
    } catch (error) {
      console.error('24시간 약국 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 평점 높은 약국 조회
   */
  async getTopRatedPharmacies(limit = 10) {
    try {
      const pharmacies = await this.Pharmacy.findAll({
        where: {
          reviewCount: { [db.Sequelize.Op.gte]: 5 } // 최소 5개 이상의 리뷰
        },
        order: [['ratingAverage', 'DESC']],
        limit
      });

      return pharmacies;
    } catch (error) {
      console.error('평점 높은 약국 조회 오류:', error);
      throw error;
    }
  }
}

module.exports = new PharmacyService();


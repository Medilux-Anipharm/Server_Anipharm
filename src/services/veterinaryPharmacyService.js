// 동물약국 csv 파일을 읽어서 동물약국 데이터를 생성하는 서비스

const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const geolib = require("geolib");
const proj4 = require("proj4");
const db = require("../models");

// EPSG:5174 (한국 국가 좌표계) 정의
// EPSG:5174는 Korea 2000 / Central Belt 2010 좌표계
// 공식 정의: +proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=200000 +y_0=500000 +ellps=GRS80 +units=m +no_defs +towgs84=0,0,0,0,0,0,0
proj4.defs("EPSG:5174", "+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=200000 +y_0=500000 +ellps=GRS80 +units=m +no_defs +towgs84=0,0,0,0,0,0,0");
proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");

class VeterinaryPharmacyService {
    constructor() {
        this.Pharmacy = db.Pharmacy;
    }

    async importFromCSV() {
        const csvFilePath = path.join(__dirname, "../../data/csv/동물약국.csv");
        const results = [];

        return new Promise((resolve, reject) => {

            if(!fs.existsSync(csvFilePath)) {
                return reject(new Error(`CSV 파일을 찾을 수 없습니다: ${csvFilePath}`));
            }

            let rowCount = 0;

            fs.createReadStream(csvFilePath)
                .pipe(csv())
                .on("data", (data) => {
                    rowCount++;

                // 첫 번째 행 로깅 (디버깅용)
                if(rowCount === 1) {
                    console.log("CSV 컬럼명:", Object.keys(data));
                    console.log("첫 번째 데이터:", data);
                }

                // EPSG:5174 좌표 추출
                const epsgX = parseFloat(data["좌표정보x(epsg5174)"]);
                const epsgY = parseFloat(data["좌표정보y(epsg5174)"]);

                // EPSG:5174를 WGS84 (위경도)로 변환
                let latitude, longitude;
                if (!isNaN(epsgX) && !isNaN(epsgY) && epsgX !== 0 && epsgY !== 0) {
                    const wgs84Coords = this._convertEPSG5174ToWGS84(epsgX, epsgY);
                    latitude = wgs84Coords.latitude;
                    longitude = wgs84Coords.longitude;
                } else {
                    // 좌표가 유효하지 않은 경우
                    console.warn(`행 ${rowCount}: 유효하지 않은 좌표 -`, { epsgX, epsgY });
                    latitude = null;
                    longitude = null;
                }

                // CSV 데이터를 DB 모델 형식으로 변환
                const pharmacyData = {
                    name: data["사업장명"],
                    address: data["도로명전체주소"],
                    phone: data["소재지전화"],
                    addressDetail: data["소재지전체주소"],
                    latitude: latitude,
                    longitude: longitude,
                    isLateNight: this._checkLateNight(data["사업장명"], data["운영시간"]) || false,
                };

                // 필수 필드 검증
                if(pharmacyData.name && pharmacyData.address && pharmacyData.latitude && pharmacyData.longitude) {
                    results.push(pharmacyData);
                } else {
                    console.warn(`행 ${rowCount}: 필수 데이터 누락 -`, pharmacyData);
                }
            })
            .on("end", async () => {
                try {
                    console.log(`총 ${rowCount}개 행을 읽었고, ${results.length}개의 유효한 데이터를 처리했습니다.`);

                    if(results.length === 0) {
                        return reject(new Error("처리할 유효한 데이터가 없습니다."));
                    }

                    // DB에 bulk insert
                    await this.Pharmacy.bulkCreate(results, {
                        updateOnDuplicate: ["name", "address", "phone", "addressDetail", "latitude", "longitude", "isLateNight"]
                    });

                    console.log("동물약국 데이터 저장 완료!");
                    resolve({ success: true, count: results.length });
                } catch (error) {
                    console.error("DB 저장 중 오류:", error);
                    reject(error);
                }
            })
            .on("error", (error) => {
                console.error("CSV 파일 읽기 오류:", error);
                reject(error);
            });     
        })
    }// end importFromCSV method

    _checkLateNight(name, operatingHours) {
        if(operatingHours && operatingHours.includes("24시간")) {
            return true;
        }
        return false;
    }// end _checkLateNight method

    /**
     * EPSG:5174 좌표를 WGS84 (위경도)로 변환
     * @param {number} x - EPSG:5174 X 좌표
     * @param {number} y - EPSG:5174 Y 좌표
     * @returns {Object} {latitude, longitude} WGS84 좌표
     */
    _convertEPSG5174ToWGS84(x, y) {
        try {
            // EPSG:5174에서 WGS84로 변환
            // proj4는 [longitude, latitude] 순서로 반환
            const result = proj4("EPSG:5174", "EPSG:4326", [x, y]);
            const longitude = result[0];
            const latitude = result[1];
            
            // 변환 결과 검증 (한국 범위: 위도 33-38, 경도 124-132)
            if (latitude < 33 || latitude > 38 || longitude < 124 || longitude > 132) {
                console.warn(`변환된 좌표가 한국 범위를 벗어남: 위도 ${latitude}, 경도 ${longitude} (원본: X=${x}, Y=${y})`);
            }
            
            return {
                latitude: parseFloat(latitude.toFixed(8)),
                longitude: parseFloat(longitude.toFixed(8))
            };
        } catch (error) {
            console.error('좌표 변환 오류:', error, { x, y });
            throw new Error(`좌표 변환 실패: ${error.message}`);
        }
    }// end _convertEPSG5174ToWGS84 method

    /**
     * 위치 기반 동물약국 검색
     * @param {number} latitude - 위도
     * @param {number} longitude - 경도
     * @param {number} radiusKm - 반경 (km)
     */
    async findNearbyPharmacies(latitude, longitude, radiusKm = 5) {
        try {
            // 모든 약국 데이터를 가져온 후 JavaScript에서 거리 계산 및 필터링
            const allPharmacies = await this.Pharmacy.findAll({
                attributes: ['pharmacyId', 'name', 'phone', 'address', 'addressDetail', 'latitude', 'longitude', 'isLateNight']
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
                        return {
                            ...pharmacy.toJSON(),
                            distance: distanceKm // km 단위로 저장
                        };
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
    }// end findNearbyPharmacies method

    /**
     * 네이버 지도 API용 마커 데이터 생성
     */
    async getMarkersForMap(latitude, longitude, radiusKm = 5) {
        try {
            const pharmacies = await this.findNearbyPharmacies(latitude, longitude, radiusKm);

            // 네이버 지도 마커 형식으로 변환
            const markers = pharmacies.map(pharmacy => ({
                id: pharmacy.pharmacyId,
                position: {
                    lat: parseFloat(pharmacy.latitude),
                    lng: parseFloat(pharmacy.longitude)
                },
                title: pharmacy.name,
                address: pharmacy.address,
                phone: pharmacy.phone,
                isLateNight: pharmacy.isLateNight
            }));

            return markers;
        } catch (error) {
            console.error('마커 데이터 생성 오류:', error);
            throw error;
        }
    }// end getMarkersForMap method
}// end VeterinaryPharmacyService class

module.exports = new VeterinaryPharmacyService();


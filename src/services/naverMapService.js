const axios = require('axios')
const geolib = require('geolib');

class NaverMapService {
    constructor() {
    // 네이버 클라우드 플랫폼에서 발급받은 API 인증 정보
    // .env 파일에서 환경 변수로 관리하여 보안을 유지
    this.geocodeClientId = process.env.NAVER_GEOCODE_CLIENT_ID;
    this.geocodeClientSecret = process.env.NAVER_GEOCODE_CLIENT_SECRET;
    this.searchClientId = process.env.NAVER_SEARCH_CLIENT_ID;
    this.searchClientSecret = process.env.NAVER_SEARCH_CLIENT_SECRET;

    // 네이버 지역 검색 API 기본 URL
    this.searchApiUrl = "https://openapi.naver.com/v1/search/local.json";

    // 카테고리별 검색 키워드 매핑
    // 사용자가 요청한 카테고리를 네이버 검색에 적합한 키워드로 변환
    // 가능한 카테고리 : 동물병원, 반려동물, 반려동물 > 반려동물미용, 반려동물물품
    this.categoryKeywords = {
      hospital: "동물병원", // 동물병원 검색
      pharmacy: "동물약국", // 동물약국 검색
      petshop: "애완용품", // 애완용품점 검색
      hotel: "애완동물호텔", // 펫호텔 검색
      grooming: "애완동물미용", // 펫 미용실 검색
    };
}

    async geocode(address){
        try {
            if (!this.geocodeClientId || !this.geocodeClientSecret) {
                throw new Error('네이버 Geocoding API 인증 정보가 설정되지 않았습니다.');
            }

            const response = await axios.get(
              "https://maps.apigw.ntruss.com/map-geocode/v2/geocode",
              {
                params: { query: address },
                headers: {
                  "x-ncp-apigw-api-key-id": this.geocodeClientId,
                  "x-ncp-apigw-api-key": this.geocodeClientSecret,
                },
              }
            );

            const result = response.data.addresses[0]
            if(!result){
                throw new Error('주소를 찾을 수 없습니다.')
            }

          return {
            latitude: parseFloat(result.y), // 위도 (y좌표)
            longitude: parseFloat(result.x), // 경도 (x좌표)
            roadAddress: result.roadAddress, // 도로명 주소
            jibunAddress: result.jibunAddress, // 지번 주소
        };
         }
        catch(error){
            throw error;
        }
    }// end geocode(address)

    async searchByCategory(category, options ={}){
        try{
            // API 인증 정보 확인
            if (!this.searchClientId || !this.searchClientSecret) {
                throw new Error('네이버 검색 API 인증 정보가 설정되지 않았습니다.');
            }

            const keyword = this.categoryKeywords[category]
            if(!keyword){
                throw new Error(`지원하지 않는 카테고리 입니다. ${category}`)
            }

            const query = options.region ? `${options.region} ${keyword}` : keyword;

            const response = await axios.get(this.searchApiUrl, {
                params: {
                    query: query,
                    display: options.display || 20,
                    start: options.start || 1,
                    sort : 'random',
                },
                headers: {
                    "X-Naver-Client-Id": this.searchClientId,
                    "X-Naver-Client-Secret": this.searchClientSecret,
                }
            })

            // 응답 데이터 검증
            if (!response.data) {
                throw new Error('네이버 검색 API 응답 데이터가 없습니다.');
            }

            const items = response.data.items || [];

            const places = items.map((i) => {
                return {
                    id: i.link || `place_${Date.now()}_${Math.random()}`,
                    name: this._removeHtmlTags(i.title || ''),
                    category: i.category || '',
                    address: this._removeHtmlTags(i.address || ''),
                    roadAddress: this._removeHtmlTags(i.roadAddress || ''),
                    telephone: i.telephone || '',
                    latitude : i.mapy ? parseFloat(i.mapy) / 10000000 : null,
                    longitude : i.mapx ? parseFloat(i.mapx) / 10000000 : null,
                    description : this._removeHtmlTags(i.description || ''),
                    link : i.link || ''
                }
            })

            if (options.latitude && options.longitude) {
                places.sort((a, b) => {
                    // 각 장소의 좌표가 유효한지 확인
                    if (!a.latitude || !a.longitude) return 1;
                    if (!b.latitude || !b.longitude) return -1;
                    
                    // 기준점으로부터의 거리 계산
                    const distanceA = this._calculateDistance(
                        options.latitude,
                        options.longitude,
                        a.latitude,
                        a.longitude
                    );
                    const distanceB = this._calculateDistance(
                        options.latitude,
                        options.longitude,
                        b.latitude,
                        b.longitude
                    );
                    
                    // 거리 기준 오름차순 정렬 (가까운 순서대로)
                    return distanceA - distanceB;
                });
            }

            return places;
        } catch (error) {
            // 에러 메시지 개선
            if (error.response) {
                // API 응답 에러
                const status = error.response.status;
                const errorData = error.response.data;
                
                if (status === 401) {
                    throw new Error('네이버 검색 API 인증에 실패했습니다. API 키를 확인해주세요.');
                } else if (status === 403) {
                    throw new Error('네이버 검색 API 접근 권한이 없습니다.');
                } else if (status === 400) {
                    throw new Error(`잘못된 요청입니다: ${errorData.errorMessage || '알 수 없는 오류'}`);
                } else {
                    throw new Error(`네이버 검색 API 오류 (${status}): ${errorData.errorMessage || error.message}`);
                }
            } else if (error.request) {
                // 요청은 보냈지만 응답을 받지 못한 경우
                throw new Error('네이버 검색 API 서버에 연결할 수 없습니다.');
            } else {
                // 기타 에러
                throw error;
            }
        }
    }// end searchByCategory(category, options)

  _calculateDistance(lat1, lon1, lat2, lon2){
    return geolib.getDistance(
        {latitude : lat1, longitude : lon1},
        {latitude : lat2, longitude : lon2}
    )
  }// end _calculateDistance(lat1, lon1, lat2, lon2)

  _isWithinRadius(lat1, lon1, lat2, lon2, radius){
    return geolib.isPointWithinRadius(
        {latitude : lat1, longitude : lon1},
        {latitude : lat2, longitude : lon2},
        radius
    )

  }// end _isWithinRadius(lat1, lon1, lat2, lon2, radius)
  _removeHtmlTags(str) {
    if (!str) return "";
    return str.replace(/<[^>]*>/g, "");
  }

}// end NaverMapService

module.exports = NaverMapService;
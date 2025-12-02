const veterinaryPharmacyService = require('../services/veterinaryPharmacyService');

exports.importCSVData = async (req, res) => {
    try {
        const result = await veterinaryPharmacyService.importFromCSV();
        res.status(200).json({
            success: true,
            message: '동물약국 데이터를 성공적으로 저장했습니다.',
            data: result
        });
    } catch (error) {
        console.error('CSV import 오류:', error);
        res.status(500).json({
            success: false,
            message: 'CSV 데이터 import 중 오류가 발생했습니다.',
            error: error.message
        });
    }
    }// end importCSVData method

exports.findNearby = async (req, res) => {
    try{
        const {latitude, longitude, radius = 5} = req.query;

        if(!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message : '위도와 경도를 입력해주시요'
            });
        }

    const pharmacies = await veterinaryPharmacyService.findNearbyPharmacies(
        parseFloat(latitude),
        parseFloat(longitude),
        parseFloat(radius)
    );

    res.status(200).json({
        success: true,
        data: pharmacies
    });
} catch (error) {
    console.error('주변 약국 검색 오류:', error);
    res.status(500).json({
        success: false,
        message: '주변 약국 검색 중 오류가 발생했습니다.',
        error: error.message
    });
}
}//end findNearby method

/**
 * 네이버 지도 API용 마커 데이터 조회
 */
exports.getMapMarkers = async (req, res) => {
    try {
        const { latitude, longitude, radius = 5 } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: '위도와 경도를 입력해주세요.'
            });
        }

        const markers = await veterinaryPharmacyService.getMarkersForMap(
            parseFloat(latitude),
            parseFloat(longitude),
            parseFloat(radius)
        );

        res.status(200).json({
            success: true,
            data: markers
        });
    } catch (error) {
        console.error('마커 데이터 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '마커 데이터 조회 중 오류가 발생했습니다.',
            error: error.message
        });
    }
};//end getMapMarkers method




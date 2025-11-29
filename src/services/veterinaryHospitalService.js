// 동물병원 csv 파일을 읽어서 동물병원 데이터를 생성하는 서비스
// 1. csv파일을 읽어온다.
// 2. csv파일을 파싱한다.
// 3. 파싱된 데이터를 동물병원 데이터로 변환한다.
// 4. 동물병원 데이터를 데이터베이스에 저장한다.
// 5. 지도api에 위도 경도 넣고 마크를 그린다.
// 6. 동물병원 데이터를 반환한다.
// 7. 동물병원 데이터를 조회한다.

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const VeterinaryHospital = require('../models/VeterinaryHospital');

class VeterinaryHospitalService {
    constructor() {
        this.veterinaryHospitalData = [];
    }


}  
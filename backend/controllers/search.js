const express = require("express");
const dotenv = require("dotenv").config();
const Search = require("../models/search");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

exports.insertWord =  (req, res, next) => {
    let { keyword } = req.body;
    const date = new Date();
    keyword = keyword.trim();
    if(keyword === "") {
        return next();
    }
    Search.insert(keyword, date)
    .then(([rows]) => {
        return next();
    })
    .catch(err => console.log(err));
    
}


// 랭킹 재조정, 이전 검색 기록 삭제 
exports.deleteWord = () => {
    
    let date = new Date();
    console.log('search controllers에서 실행' + date);

    Search.delete(date)
    .then(([rows]) => {
        console.log('삭제 완료');
    })
    .catch(err => console.log(err));
}

exports.rank = (req, res) => {

    // 상위 10개만 가져오기 
    Search.setRank()
    .then(([rows]) => {
        console.log('검색어 가져오기 완료');
        console.log(rows);
        return res.send({
            success: true,
            message: '상위 10개 검색어 가져오기 성공',
            data: rows
        })
    })
    .catch(err => console.log(err));
}
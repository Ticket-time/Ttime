const db = require("../util/db2");
const qrcode = require("qrcode");

exports.getQR = async(req, res) => {
    const { userid, showid } = req.body;
    let qrStr = JSON.stringify({userid: userid, showid: showid});
    db.query("select * from shows where showid = ?", [showid],
        (err, rows) => {
            if (err) {
                console.log(err);
                throw err;
            }

            if (rows.length === 0) {
                console.log("공연 정보 없음");
                return res.send({success : true, message: "공연정보 없음"});
            }

            
            qrcode.toDataURL(qrStr, function(err, url) {
                if (err) {
                    console.error(err);
                    throw err;
                }
        
                return res.send({success: true, data: rows, url: url});
            })

        }
    );
}
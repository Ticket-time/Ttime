const db = require("./db");

const createNewUser = async(data) => {
    try {
        const { id, email, password } = data;

        // email 중복 확인 
        db.query(
            "select user_email from users where user_id = ?",
            [id],
            (err, result) => {
                let checkid = new Object();
                checkid.isAvailable = false;  // id 사용가능한 id?
    
                if(result[0] == undefined){
                    throw Error("이미 가입된 이메일입니다.")
                }
        });

        db.query(
            "insert into users(user_id, user_pwd, user_email) values(?, ?, ?)",
            [id, password, email],
            (err, result) => {
                if (error) throw error;
                console.log(result);
            }
        )
    } catch (error) {
        throw error;
    }
}
module.exports = { createNewUser }
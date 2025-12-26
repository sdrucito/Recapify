import crypto from "crypto";
import sqlite from "sqlite3";

const db = new sqlite.Database('./database.sqlite', (err) => {
    if (err) throw err;
    else console.log("Successfully connected to the database");
});

export const getUser = (email, password) => {
    return new Promise ((res, rej) => {
        const sql = 'SELECT * FROM users WHERE email=?';
        db.get(sql,[email], (err, row) => {
            if (err){
                rej(err);
            }else if(row === undefined){
                res(false);
            }else{
                const user = {id: row.id, email: row.email, username: row.username};
                crypto.scrypt(password, row.password_salt, 32, function (err, hashedPassword) {
                    if (err) {
                        rej(err);
                    }
                    if(!crypto.timingSafeEqual(Buffer.from(row.password_hash, 'hex'), hashedPassword)){
                        res(false);
                    }else{
                        res(user);
                    }
                });
            }
        });
    });
};
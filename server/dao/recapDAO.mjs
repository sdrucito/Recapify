import sqlite from 'sqlite3';
import { Recap, RecapPage, RecapText, Background } from "../models/recap.mjs";

const db = new sqlite.Database('../database.sqlite', (err) => {
    if (err) throw err;
    else console.log("Successfully connected to the database");
});

// get all public recaps (for homepage)
export const getAllPublicRecaps = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT r.id, r.title, r.theme_id, t.name, u.id AS authorId, u.username AS authorUsername,
                            r.derived_from_recap_id, r.created_at
                            FROM recap r JOIN themes t ON t.id = r.theme_id LEFT JOIN users u ON u.id = r.author_id
                            WHERE r.is_template = 0 AND r.visibility = 'public'`;

        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else{
                const Recaps = rows.map(r => new Recap(
                    r.id,
                    r.title,
                    r.theme_id,
                    r.name,
                    r.authorId,
                    r.authorUsername,
                    'public',
                    r.derived_from_recap_id, //TODO da controllare in futuro
                    r.created_at,
                    false,
                    []
                ));
                resolve(Recaps);
            }
        });
    });
}


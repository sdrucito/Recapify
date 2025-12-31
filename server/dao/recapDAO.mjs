import sqlite from 'sqlite3';
import {Recap, RecapPage, RecapText, Background} from "../models/recap.mjs";
import dayjs from "dayjs";

const db = new sqlite.Database('./database.sqlite', (err) => {
    if (err) throw err;
    else console.log("Successfully connected to the database");
});

/**** QUERY FOR VIEWER ****/
// get all public recaps (for homepage)
// NOTE: it doesn't return pages, must be used only for recap's previews.
export const getAllPublicRecaps = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT r.id, r.title, r.theme_id, t.name, u.id AS authorId, u.username AS authorUsername,
                            r.derived_from_recap_id, r.created_at
                            FROM recaps r JOIN themes t ON t.id = r.theme_id LEFT JOIN users u ON u.id = r.author_id
                            WHERE r.is_template = 0 AND r.visibility = 'public'`;

        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else {
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

// get all recaps for a single user (for personal area)
// NOTE: it doesn't return pages, must be used only for recap's previews.
export const getAllRecapsByUserId = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT r.id, r.title, r.theme_id, t.name, u.id AS authorId, u.username AS authorUsername,
                            r.visibility, r.derived_from_recap_id, r.created_at
                            FROM recaps r JOIN themes t ON t.id = r.theme_id LEFT JOIN users u ON u.id = r.author_id
                            WHERE r.is_template = 0 AND r.author_id = ?`;

        db.all(sql, [userId], (err, rows) => {
            if (err) reject(err);
            else {
                const Recaps = rows.map(r => new Recap(
                    r.id,
                    r.title,
                    r.theme_id,
                    r.name,
                    r.authorId,
                    r.authorUsername,
                    r.visibility,
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

// get recap by id
export const getRecap = (recapId) => {
    return new Promise((resolve, reject) => {
        // recap
        const recapSql = `SELECT r.id, r.title, r.theme_id, t.name, r.author_id, u.username, r.visibility,
                                r.derived_from_recap_id, r.created_at, r.is_template
                                FROM recaps r JOIN themes t ON t.id = r.theme_id LEFT JOIN users u ON u.id = r.author_id
                                WHERE r.id = ?`;
        db.get(recapSql, [recapId], (err, recapRow) => {
            if (err) return reject(err);
            if (!recapRow) return resolve(null);

            const recap = new Recap(
                recapRow.id,
                recapRow.title,
                recapRow.theme_id,
                recapRow.name,
                recapRow.author_id,
                recapRow.username,
                recapRow.visibility,
                recapRow.derived_from_recap_id,
                recapRow.created_at,
                !!recapRow.is_template,
                []
            );

            // pages
            const pagesSql = `SELECT id, recap_id, page_index, background_id
                                    FROM recap_pages WHERE recap_id = ?
                                    ORDER BY page_index`;
            db.all(pagesSql, [recapId], (err, pageRows) => {
                if (err) reject(err);

                const pagesMap = new Map();
                const backgroundIds = [];

                pageRows.forEach(p => {
                    const page = new RecapPage(p.id, p.recap_id, p.page_index, null, []);
                    pagesMap.set(p.id, page);
                    backgroundIds.push(p.background_id);
                });

                // background
                const bgSql = `SELECT id, theme_id, image_path, slots, layout_json
                                    FROM backgrounds WHERE id IN (${backgroundIds.map(() => '?').join(',')})`;
                db.all(bgSql, backgroundIds, (err, bgRows) => {
                    if (err) reject(err);
                    const bgMap = new Map();
                    bgRows.forEach(b => {
                        bgMap.set(b.id, new Background(b.id, b.theme_id, b.image_path, b.slots, b.layout_json));
                    });
                    pageRows.forEach(p => {
                        pagesMap.get(p.id).background = bgMap.get(p.background_id);
                    });

                    // texts
                    const textSql = `SELECT id, page_id, slot_index, content
                                          FROM recap_texts WHERE page_id IN (${pageRows.map(() => '?').join(',')})
                                          ORDER BY slot_index ASC`;

                    const pageIds = pageRows.map(p => p.id);

                    db.all(textSql, pageIds, (err, textRows) => {
                        if (err) reject(err);

                        textRows.forEach(t => {
                            const text = new RecapText(t.id, t.page_id, t.slot_index, t.content);
                            pagesMap.get(t.page_id).texts.push(text);
                        });

                        recap.pages = Array.from(pagesMap.values());

                        resolve(recap);
                    });
                });
            });
        });
    });
};

// change the visibility of a recap
export const updateRecapVisibility = (recapId, visibility) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE recaps SET visibility = ? WHERE id = ?`; //TODO: visibility è controllato al livello superiore, ma sarebbe da controllare anche qui
        db.run(sql, [visibility, recapId], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
};

/**** QUERY FOR EDITOR ****/
// create a new Recap in db
export const addRecap = (recap, userId) => {
    return new Promise((resolve, reject) => {

        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            const dateNow = dayjs().format('YYYY-MM-DD');
            const recapSql = `INSERT INTO recaps (title, theme_id, author_id, visibility, 
                                    derived_from_recap_id, created_at, is_template)
                                    VALUES (?, ?, ?, ?, ?, ?, 0)`;

            db.run(recapSql, [recap.title, recap.theme_id, userId, recap.visibility,
                    recap.derived_from_recap_id ?? null, dateNow], function (err) {
                    if (err) {
                        db.run('ROLLBACK');
                        return reject(err);
                    }

                    const recapId = this.lastID;
                    const pageSql = `INSERT INTO recap_pages (recap_id, page_index, background_id)
                                            VALUES (?, ?, ?)`;
                    const textSql = `INSERT INTO recap_texts (page_id, slot_index, content)
                                            VALUES (?, ?, ?)`;
                    let pageCount = recap.pages.length;
                    let completedPages = 0;

                    recap.pages.forEach(page => {
                        db.run(pageSql, [recapId, page.page_index, page.background_id], function (err) {
                                if (err) {
                                    db.run('ROLLBACK');
                                    return reject(err);
                                }

                                const pageId = this.lastID;

                                page.texts.forEach(text => {
                                    db.run(textSql,[pageId, text.slot_index, text.content],err => {
                                            if (err) {
                                                db.run('ROLLBACK');
                                                return reject(err);
                                            }
                                        }
                                    );
                                });

                                completedPages++;
                                if (completedPages === pageCount) {
                                    db.run('COMMIT');
                                    resolve(recapId);
                                }
                            }
                        );
                    });
                }
            );
        });
    });
};



// get all templates by themeId
export const getTemplatesByTheme = (themeId) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT r.id,
                         r.title,
                         r.theme_id,
                         t.name AS themeName,
                         b.image_path AS previewImage
                     FROM recaps r
                              JOIN themes t ON t.id = r.theme_id
                              JOIN recap_pages p ON p.recap_id = r.id AND p.page_index = 0
                              JOIN backgrounds b ON b.id = p.background_id
                     WHERE r.is_template = 1
                       AND r.theme_id = ?
        `;
        db.all(sql, [themeId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

//get all backgrounds by themeId
export const getBackgroundsByTheme = (themeId) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT id, theme_id, image_path, slots, layout_json
                            FROM backgrounds WHERE theme_id = ?`;
        db.all(sql, [themeId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

//get all themes
export const getAllThemes = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM themes`;
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

import sqlite from 'sqlite3';
import { Recap, RecapPage, RecapText, Background } from "../models/recap.mjs";

const db = new sqlite.Database('./database.sqlite', (err) => {
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

// get recap by id
export const getRecap = (recapId) => {
    return new Promise((resolve, reject) => {

        /* -------------------------
           1) RECUPERO RECAP BASE
        -------------------------- */
        const recapSql = `
            SELECT
                r.id,
                r.title,
                r.theme_id,
                t.name,
                r.author_id,
                u.username,
                r.visibility,
                r.derived_from_recap_id,
                r.created_at,
                r.is_template
            FROM recap r
            JOIN themes t ON t.id = r.theme_id
            LEFT JOIN users u ON u.id = r.author_id
            WHERE r.id = ?
        `;

        db.get(recapSql, [recapId], (err, recapRow) => {
            if (err) {
                reject(err);
                return;
            }

            if (!recapRow) {
                resolve(null);
                return;
            }

            const recap = new Recap(
                recapRow.id,
                recapRow.title,
                recapRow.theme_id,
                recapRow.name,              // themeName
                recapRow.author_id,
                recapRow.username,
                recapRow.visibility,
                recapRow.derived_from_recap_id,
                recapRow.created_at,
                !!recapRow.is_template,
                []                           // pages (per ora vuoto)
            );

            /* -------------------------
               2) RECUPERO PAGINE
            -------------------------- */
            const pagesSql = `
                SELECT
                    id,
                    recap_id,
                    page_index,
                    background_id
                FROM recap_pages
                WHERE recap_id = ?
                ORDER BY page_index ASC
            `;

            db.all(pagesSql, [recapId], (err, pageRows) => {
                if (err) {
                    reject(err);
                    return;
                }

                // Mappa page_id -> RecapPage
                const pagesMap = new Map();
                const backgroundIds = [];

                pageRows.forEach(p => {
                    const page = new RecapPage(
                        p.id,
                        p.recap_id,
                        p.page_index,
                        null,   // background (per ora)
                        []      // texts
                    );

                    pagesMap.set(p.id, page);
                    backgroundIds.push(p.background_id);
                });

                /* -------------------------
                   3) RECUPERO BACKGROUND
                -------------------------- */
                const bgSql = `
                    SELECT
                        id,
                        theme_id,
                        image_path,
                        slots,
                        layout_json
                    FROM backgrounds
                    WHERE id IN (${backgroundIds.map(() => '?').join(',')})
                `;

                db.all(bgSql, backgroundIds, (err, bgRows) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    // Mappa background_id -> Background
                    const bgMap = new Map();
                    bgRows.forEach(b => {
                        bgMap.set(
                            b.id,
                            new Background(
                                b.id,
                                b.theme_id,
                                b.image_path,
                                b.slots,
                                b.layout_json
                            )
                        );
                    });

                    // Assegna background alle pagine
                    pageRows.forEach(p => {
                        pagesMap.get(p.id).background = bgMap.get(p.background_id);
                    });

                    /* -------------------------
                       4) RECUPERO TESTI
                    -------------------------- */
                    const textSql = `
                        SELECT
                            id,
                            page_id,
                            slot_index,
                            content
                        FROM recap_texts
                        WHERE page_id IN (${pageRows.map(() => '?').join(',')})
                        ORDER BY slot_index ASC
                    `;

                    const pageIds = pageRows.map(p => p.id);

                    db.all(textSql, pageIds, (err, textRows) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        textRows.forEach(t => {
                            const text = new RecapText(
                                t.id,
                                t.page_id,
                                t.slot_index,
                                t.content
                            );
                            pagesMap.get(t.page_id).texts.push(text);
                        });

                        /* -------------------------
                           5) ASSEMBLAGGIO FINALE
                        -------------------------- */
                        recap.pages = Array.from(pagesMap.values());

                        resolve(recap);
                    });
                });
            });
        });
    });
};

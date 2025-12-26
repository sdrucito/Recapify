import {Recap, RecapPreview} from "./models/recap.mjs";
import {SERVER_URL} from "./config.js";


// GET /api/recaps
const getAllPublicRecapPreviews = async () => {
    const recaps = await fetch(`${SERVER_URL}/api/recaps`);
    if (recaps.ok) {
        const recapsJson = await recaps.json();
        return recapsJson.map(r => new RecapPreview(r.id, r.title, r.themeName,r.authorUsername, r.createdAt));
    }else{
        throw new Error("Internal Server Error");
    }
};

// GET /api/recaps/:id
const getRecap = async (id) => {
    const response = await fetch(`${SERVER_URL}/api/recaps/${id}`);
    if (response.ok) {
        const r = await response.json();
        return new Recap(
            r.id,
            r.title,
            r.themeId,
            r.themeName,
            r.authorId,
            r.authorUsername,
            r.visibility,
            r.derivedFromRecapId,
            r.createdAt,
            r.isTemplate,
            r.pages
        );
    } else {
        throw new Error("Failed to fetch recap");
    }
};
const API = {getAllPublicRecapPreviews, getRecap};
export default API;
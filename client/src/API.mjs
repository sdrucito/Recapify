import {RecapPreview} from "./models/recap.mjs";

const SERVER_URL = "http://localhost:3001";

// GET /api/recaps
const getAllPublicRecapPreviews = async () => {
    const recaps = await fetch(SERVER_URL + "/api/recaps");
    if (recaps.ok) {
        const recapsJson = await recaps.json();
        return recapsJson.map(r => new RecapPreview(r.id, r.title, r.themeName,r.authorUsername, r.createdAt));
    }else{
        throw new Error("Internal Server Error");
    }
}

const API = {getAllPublicRecapPreviews};
export default API;
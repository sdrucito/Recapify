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

// GET /api/recaps/myrecaps
const getMyRecapPreviews = async () => {
    const response = await fetch(`${SERVER_URL}/api/recaps/myrecaps`, {
        credentials: "include"
    });
    if (response.ok) {
        const recapsJson = await response.json();
        return recapsJson.map(r =>
            new RecapPreview(r.id, r.title, r.themeName, r.authorUsername, r.createdAt, r.visibility)
        );
    }else if (response.status === 401) {
        throw new Error("Not authenticated");
    }else
        throw new Error("Failed to load user recaps");
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

/* AUTHENTICATION */
const login = async(credentials)=>{
    const response = await fetch(SERVER_URL+"/api/sessions",{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify(credentials)
    });
    if (response.ok) {
        const user=await response.json();
        return user;
    }else{
        const errDetails = await response.text();
        throw errDetails;
    }
}

const getUserInfo = async () => {
    const response = await fetch(`${SERVER_URL}/api/sessions/current`, {
        credentials: "include",
    });
    const user = await response.json();
    if(response.ok) {
        return user;
    }else{
        throw user; //TODO da controllare questo errore
    }
}

const logout = async()=>{
    const response = await fetch(`${SERVER_URL}/api/sessions/current`, {
        method: "DELETE",
        credentials: "include"
    });
    if(response.ok) {
        return null;
    }
}

const API = {getAllPublicRecapPreviews, getMyRecapPreviews, getRecap, login, getUserInfo, logout};
export default API;
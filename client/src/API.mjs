import {Recap, RecapPreview} from "./models/recap.mjs";
import {SERVER_URL} from "./constants.js";


// GET /api/recaps
const getAllPublicRecapPreviews = async () => {
    const recaps = await fetch(`${SERVER_URL}/api/recaps`);
    if (recaps.ok) {
        const recapsJson = await recaps.json();
        return recapsJson.map(r => new RecapPreview(r.id, r.title, r.themeName,r.authorUsername, r.createdAt, r.visibility, r.previewImage));
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
            new RecapPreview(r.id, r.title, r.themeName, r.authorUsername, r.createdAt, r.visibility, r.previewImage)
        );
    }else if (response.status === 401) {
        throw new Error("Not authenticated");
    }else
        throw new Error("Failed to load user recaps");
};

// GET /api/recaps/:id
const getRecap = async (id) => {
    const response = await fetch(
        `${SERVER_URL}/api/recaps/${id}`,
        {credentials: "include"}
    );
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
// GET /api/recaps/:id/derived-from
async function getDerivedFromInfo(recapId) {
    const response = await fetch(`${SERVER_URL}/api/recaps/${recapId}/derived-from`, {
        credentials: 'include'
    });

    if (!response.ok)
        throw new Error("Cannot load derived-from info");

    return await response.json();
}

// PATCH /api/recaps/:id/visibility
const updateRecapVisibility = async (recapId, visibility) => {
    const response = await fetch(
        `${SERVER_URL}/api/recaps/${recapId}/visibility`,
        {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ visibility: visibility })
        }
    );

    if (response.ok)
        return true;
    if (response.status === 401) {
        throw new Error("Not authenticated");
    }
    if (response.status === 403) {
        throw new Error("Not authorized");
    }
    throw new Error("Failed to update visibility");
};

// POST /api/recaps
const createRecap = async (recap) => {
    const response = await fetch(`${SERVER_URL}/api/recaps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(recap)
    });

    if (response.ok) {
        return await response.json(); // { id }
    } else {
        throw await response.json();
    }
};

// GET /api/themes
const getAllThemes = async () => {
    const response = await fetch(`${SERVER_URL}/api/themes`, {
        credentials: 'include'
    });

    if (response.ok) {
        return await response.json();
    } else {
        throw await response.json();
    }
};
// GET /api/templates?themeId=:themeId
const getTemplatesByTheme = async (themeId) => {
    const response = await fetch(
        `${SERVER_URL}/api/templates?themeId=${themeId}`,
        { credentials: 'include' }
    );

    if (response.ok) {
        return await response.json();
    } else {
        throw await response.json();
    }
};
// GET /api/backgrounds?themeId=:themeId
const getBackgroundsByTheme = async (themeId) => {
    const response = await fetch(
        `${SERVER_URL}/api/backgrounds?themeId=${themeId}`,
        { credentials: 'include' }
    );

    if (response.ok) {
        return await response.json();
    } else {
        throw await response.json();
    }
};
// GET /api/recaps?themeId=:themeId
const getPublicRecapsByTheme = async (themeId) => {
    const response = await fetch(
        `${SERVER_URL}/api/recaps?themeId=${themeId}`
    );

    if (response.ok) {
        const recaps = await response.json();
        return recaps.map(r =>
            new RecapPreview(
                r.id,
                r.title,
                r.themeName,
                r.authorUsername,
                r.createdAt,
                r.visibility,
                r.previewImage
            )
        );
    } else {
        throw new Error('Cannot load recaps');
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
        throw user;
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

const API = {getAllPublicRecapPreviews, getMyRecapPreviews, getRecap, getDerivedFromInfo,
    updateRecapVisibility, createRecap, getAllThemes, getTemplatesByTheme, getBackgroundsByTheme,
    getPublicRecapsByTheme, login, getUserInfo, logout};
export default API;
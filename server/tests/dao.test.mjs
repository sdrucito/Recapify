import {getAllPublicRecaps} from "../dao/recapDAO.mjs";

async function testGetAllPublicRecaps() {
    try {
        const recaps = await getAllPublicRecaps();
        console.log(recaps);
    } catch (err) {
        console.error("❌ Test failed with error:", err);
    }
}

testGetAllPublicRecaps();
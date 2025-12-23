import {getAllPublicRecaps, getRecap} from "../dao/recapDAO.mjs";

async function testGetAllPublicRecaps() {
    try {
        const recaps = await getAllPublicRecaps();
        console.log(recaps);
    } catch (err) {
        console.error("❌ Test failed with error:", err);
    }
}
async function testGetRecap(){
    try {
        const recap = await getRecap(1);
        console.log(recap);
    } catch (err) {
        console.error("❌ Test failed with error:", err);
    }
}

testGetAllPublicRecaps();
testGetRecap()
import {Button, Container} from "react-bootstrap";
import RecapPreviews from "./RecapPreviews.jsx";
import {useEffect, useState} from "react";
import dayjs from "dayjs";
import API from "../API.mjs";

function RecapHomePage(){
    const [recapPreviews, setRecapPreviews] = useState([]);
    const [sortMode, setSortMode] = useState("desc");
    useEffect(() => {
        const getRecapPreviews = async () => {
            const recapPreviews = await API.getAllPublicRecapPreviews();
            setRecapPreviews(recapPreviews);
        }
        getRecapPreviews();
    }, []);
    const toggleSort = () =>{
        setSortMode(sortMode=== "desc" ? "asc": "desc");
    }
    let sortedRecaps = [...recapPreviews];

    switch(sortMode){
        case "asc":
            sortedRecaps.sort((a,b) => dayjs(a.createdAt).diff(dayjs(b.createdAt)));
            break;
        case "desc":
            sortedRecaps.sort((a,b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)));
            break;
        default:
            break;
    }
    return (
        <Container>
            <div className="position-relative mb-3">
                <h4 className="text-center mb-0">Community Recaps</h4>
                <Button className="position-absolute top-50 end-0 translate-middle-y" variant="primary" onClick={toggleSort}>
                    <i className={sortMode ==="asc" ? "bi bi-sort-up" : "bi bi-sort-down"}></i>
                </Button>
            </div>
            <RecapPreviews recapPreviews={sortedRecaps}/>
        </Container>
    );
}

export default RecapHomePage;
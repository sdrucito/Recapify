import {useEffect, useState} from "react";
import API from "../API.mjs";
import dayjs from "dayjs";
import {Button, Container} from "react-bootstrap";
import RecapPreviews from "./RecapPreviews.jsx";

function MyRecaps() {
    const [recapPreviews, setRecapPreviews] = useState([]);
    const [sortMode, setSortMode] = useState("none");
    useEffect(() => {
        const getRecapPreviews = async () => {
            const recapPreviews = await API.getMyRecapPreviews();
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
            <div className="d-flex justify-content-end mb-3">
                <h4 className="position-absolute start-50 translate-middle-x mb-0 d-none d-md-block">
                    My Recaps
                </h4>
                <h4 className="position-absolute start-0 ps-4 mb-0 d-block d-md-none">My Recaps</h4> {/*TODO: da sistemare meglio*/}
                <div className="d-flex gap-2">
                    <Button variant="primary">Create new recap</Button>
                    <Button variant="outline-secondary" onClick={toggleSort}>
                        <i className={sortMode === "asc" ? "bi bi-sort-up" : "bi bi-sort-down"} />
                    </Button>
                </div>
            </div>

            <RecapPreviews recapPreviews={sortedRecaps}/>
        </Container>


    );
}

export default MyRecaps;
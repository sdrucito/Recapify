import {useEffect, useState} from "react";
import API from "../API.mjs";
import dayjs from "dayjs";
import {Button, Container, Modal} from "react-bootstrap";
import RecapPreviews from "./RecapPreviews.jsx";
import {Link} from "react-router";

function MyRecaps(props) {
    const [recapPreviews, setRecapPreviews] = useState([]);
    const [sortMode, setSortMode] = useState("none");
    const [updatingRecapId, setUpdatingRecapId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedRecap, setSelectedRecap] = useState(null);

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

    //TODO: forse da rifattorizzare
    const updateVisibility = async () => {
        if (!selectedRecap) return;

        const newVisibility = selectedRecap.visibility === "private" ? "public" : "private";
        try {
            setUpdatingRecapId(selectedRecap.id);
            await API.updateRecapVisibility(selectedRecap.id, newVisibility);
            setRecapPreviews(old =>
                old.map(r => {
                    if (r.id === selectedRecap.id)
                        return { ...r, visibility: newVisibility }
                    else
                        return r

                })
            );
        } catch (err) {
            console.error(err);
        } finally {
            setUpdatingRecapId(null);
            closeVisibilityModal();
        }
    }
    const openVisibilityModal = (recap) => {
        setSelectedRecap(recap);
        setShowModal(true);
    };

    const closeVisibilityModal = () => {
        setShowModal(false);
        setSelectedRecap(null);
    };

    return (
        <Container>
            <div className="d-flex justify-content-end mb-3">
                <h4 className="position-absolute start-50 translate-middle-x mb-0 d-none d-md-block">
                    My Recaps
                </h4>
                <h4 className="position-absolute start-0 ps-4 mb-0 d-block d-md-none">My Recaps</h4> {/*TODO: da sistemare meglio*/}
                <div className="d-flex gap-2">
                    <Link to="/myrecaps/create" className="btn bg-gradient">Create new recap</Link>
                    <Button className="bg-gradient" onClick={toggleSort}>
                        <i className={sortMode === "asc" ? "bi bi-sort-up" : "bi bi-sort-down"} />
                    </Button>
                </div>
            </div>
            {sortedRecaps.length > 0 ?
            <RecapPreviews recapPreviews={sortedRecaps} loggedIn={props.loggedIn}
                           updatingRecapId={updatingRecapId} onUpdateVisibility={openVisibilityModal}/>
                : <p>You haven't any recap yet.</p>
            }
            <Modal show={showModal} onHide={closeVisibilityModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Change visibility</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {selectedRecap && (
                        <>
                            <p>
                                Do you want to make <strong>{selectedRecap.title}</strong>{" "}
                                {selectedRecap.visibility === "private" ? "public" : "private"}?
                            </p>
                        </>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={closeVisibilityModal}>
                        Cancel
                    </Button>
                    <Button
                        variant={selectedRecap?.visibility === "private" ? "success" : "warning"}
                        onClick={updateVisibility}
                        disabled={updatingRecapId !== null}
                    >Confirm</Button>
                </Modal.Footer>
            </Modal>

        </Container>
    );
}

export default MyRecaps;
import {createContext, useContext, useEffect, useState} from "react";
import {Modal, Button} from "react-bootstrap";
// pattern reference: https://medium.com/@ignatovich.dm/how-to-create-a-custom-hook-for-unsaved-changes-alerts-in-react-b1441f0ae712
const UnsavedChangesContext = createContext(null);

export function useUnsavedChanges() {
    return useContext(UnsavedChangesContext);
}

export function UnsavedChangesProvider({ children }) {
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);

    const requestNavigation = (action) => {
        if (hasUnsavedChanges) {
            setPendingAction(() => action);
            setShowConfirm(true);
        } else {
            action();
        }
    };

    const handleConfirm = async () => {
        setShowConfirm(false);
        setHasUnsavedChanges(false);
        if (pendingAction) {
            await pendingAction();
            setPendingAction(null);
        }
    };

    const handleCancel = () => {
        setShowConfirm(false);
        setPendingAction(null);
    };

    useEffect(() => {
        const handler = (e) => {
            if (!hasUnsavedChanges) return;
            e.preventDefault();
            e.returnValue = "";
        };
        //Reference: https://developer.mozilla.org/en-US/docs/Web/API/BeforeUnloadEvent
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [hasUnsavedChanges]);

    return (
        <UnsavedChangesContext.Provider value={{ hasUnsavedChanges, setHasUnsavedChanges, requestNavigation }}>
            {children}
            <Modal show={showConfirm} onHide={handleCancel} centered backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>Unsaved changes</Modal.Title>
                </Modal.Header>
                <Modal.Body>You have unsaved changes. Are you sure you want to leave?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCancel}>Stay</Button>
                    <Button variant="danger" onClick={handleConfirm}>Leave anyway</Button>
                </Modal.Footer>
            </Modal>
        </UnsavedChangesContext.Provider>
    );
}

export { UnsavedChangesContext };
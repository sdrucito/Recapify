import {createContext, useContext} from "react";

const UnsavedChangesContext = createContext();

export function useUnsavedChanges() {
    return useContext(UnsavedChangesContext);
}
export default UnsavedChangesContext;
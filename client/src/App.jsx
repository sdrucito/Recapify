import 'bootswatch/dist/cyborg/bootstrap.min.css'
//import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css';

import './App.css'
import {Navigate, Route, Routes} from "react-router";
import DefaultLayout from "./component/DefaultLayout.jsx";
import RecapHomePage from "./component/RecapHomePage.jsx";
import RecapViewer from "./component/RecapViewer.jsx";
import NotFound from "./component/NotFound.jsx";
import {useEffect, useState} from "react";
import API from "./API.mjs";
import {LoginForm} from "./component/AuthComponents.jsx";
import MyRecaps from "./component/MyRecaps.jsx";
import CreateRecap from "./component/CreateRecap.jsx";
import RecapEditor from "./component/RecapEditor.jsx";
import UnsavedChangesContext from "./component/UnsavedChangesContext.jsx";


function App() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [message, setMessage] = useState('');
    const [user, setUser] = useState(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const user = await API.getUserInfo();
                setLoggedIn(true);
                setUser(user);
            } catch {
                setLoggedIn(false);
                setUser(null);
            }
        };
        checkAuth();
    }, []);

    const handleLogin = async (credentials) => {
        try {
            const user = await API.login(credentials);
            setLoggedIn(true);
            setMessage({msg: 'Welcome, ' + user.username + '!', type: 'success'});
            setUser(user);
        } catch (err) {
            setMessage({msg: err, type: 'danger'});
        }
    };

    const handleLogout = async () => {
        await API.logout();
        setLoggedIn(false);
        setUser("");
        setMessage('');
    };
  return (
      <UnsavedChangesContext.Provider value={{hasUnsavedChanges, setHasUnsavedChanges}}>
          <Routes>
              <Route element={<DefaultLayout message={message} setMessage={setMessage} loggedIn={loggedIn}
                                             handleLogout={handleLogout}/>}>
                  <Route path="/" element={<RecapHomePage/>}/>
                  <Route path="/recaps/:id" element={<RecapViewer/>}/>
                  <Route path="/login"
                         element={loggedIn ? <Navigate replace to='/'/> : <LoginForm handleLogin={handleLogin}/>}/>
                  <Route path="/myrecaps"
                         element={loggedIn ? <MyRecaps loggedIn={loggedIn}/> : <Navigate replace to='/'/>}/>
                  <Route path="/myrecaps/create" element={loggedIn ? <CreateRecap/> : <Navigate replace to="/"/>}/>
                  <Route path="/myrecaps/create/editor" element={loggedIn ? <RecapEditor/> : <Navigate replace to="/"/>}
                  />
                  <Route path="*" element={<NotFound/>}/>
              </Route>
          </Routes>
      </UnsavedChangesContext.Provider>

  );
}

export default App

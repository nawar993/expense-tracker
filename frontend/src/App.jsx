import React from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import FixedExpenses from "./pages/FixedExpenses";
import Home from "./pages/Home";
import RegLog from "./components/RegLog";
import Profile from "./components/Profile";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./components/Contact";

function App() {
  return (
    <Routes>      
      <Route path="/" element= { <Home /> } />
      <Route path="/reglog" element={ <RegLog />} />
      <Route path="/privacy" element = { <Privacy /> } />
      <Route path="/terms" element = { <Terms /> } />
      <Route path="/contact" element = { <Contact />} />

      <Route element = { <ProtectedRoute />} >
        <Route path="/dashboard" element = { <Dashboard /> } />
        <Route path="/expenses"  element ={ <Expenses /> } />
        <Route path="/fixed-expenses" element = { <FixedExpenses /> } /> 
        <Route path="/profile" element = { <Profile /> }/>
      </Route>
    </Routes>
  );
}

export default App;
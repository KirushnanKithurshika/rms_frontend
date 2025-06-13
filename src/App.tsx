import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CreateCourseForm from "./components/createcourseform/createcourseform";
import './App.css';

function App() {
  return (
    <Router>
      <div className="mt-16">
        <Routes>
          <Route path="/createcourse" element={<CreateCourseForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
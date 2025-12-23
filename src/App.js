import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Home from "./components/Home";
import EventDetails from "./components/EventDetails";
import AboutUs from "./components/AboutUs";
import EventsSection from "./components/EventsSection";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Projects from "./components/Projects";
import ProjectDetail from "./components/ProjectDetail";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import FloodReliefForm from "./components/FloodReliefForm";
import Services from "./Pages/services";
import ApplicationsList from "./components/ApplicationsList";
import ApplicationReview from "./components/ApplicationReview"; 
import { FirebaseProvider, useFirebase } from "./context/FirebaseContext";
import ProtectedRoute from "./components/protectedRoute";
import GeneralApplicationForm from "./components/Applications/GeneralForm";
import WaterApplicationForm from "./components/Applications/WaterForm";
import FormPage from "./components/FormPage";
import CreateVerifier from "./components/verifier";
import VerifierList from "./components/verifierList";
import PublicRoute from "./components/publicRoute";
import Register from "./components/Register";
import PrivacyPolicy from "./components/PrivacyPolicy";
import ApprovedApplications from "./components/css/dashboard/ApprovedApplications";
import GoogleTranslate from "./components/GoogleTranslator";
import PendingApplications from "./components/css/dashboard/PendingApplications";
import DeleteAccount from "./components/DeleteAccount";


function AppLayout() {
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const { db, storage } = useFirebase();

  const handleAddEvent = (newEvent) => {
    setEvents((prev) => [...prev, newEvent]);
  };

  const noLayoutRoutes = ["/dashboard", "/login", "/privacy-policy","/deleteaccount"];
  const hideLayout = noLayoutRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  return (
    <>
      {!hideLayout && <Header onAddEvent={handleAddEvent} />}
{/* privacy policy added */}
     <Routes>
  {/* Public Routes */}
  <Route path="/" element={<Home events={events} />} />
  <Route path="/event/:id" element={<EventDetails />} />
  <Route path="/AboutUs" element={<AboutUs />} />
  <Route path="/events" element={<EventsSection events={events} />} />
  <Route path="/projects" element={<Projects />} />
  <Route path="/projects/:id" element={<ProjectDetail />} />
  <Route path="/contactus" element={<Contact />} />
  {/* <Route path="/dashboard/applications/pending" element={<PendingApplications />} /> */}


  <Route path="/deleteaccount" element={<DeleteAccount />} />


  {/* Protected public pages */}
  <Route
    path="/services"
    element={
      <ProtectedRoute>
        <Services />
      </ProtectedRoute>
    }
  />

  <Route
    path="/form/:slug"
    element={
      <ProtectedRoute>
        <FormPage />
      </ProtectedRoute>
    }
  />

  {/* Login */}
  <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
  <Route
  path="/register"
  element={
   
      <Register />

    
  }
/>
<Route path="/privacy-policy" element={<PrivacyPolicy />} />


  {/* Dashboard & nested protected routes */}
  <Route path="/dashboard/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
  <Route path="applications/pending" element={<ApplicationsList type="pending"  />} />


  <Route path="applications/approved" element={<ApprovedApplications />} />
  <Route path="applications/rejected" element={<ApplicationsList type="rejected"  />} />
  <Route path="verifier/create" element={<CreateVerifier />} />
  <Route path="verifier/allverifier" element={<VerifierList />} />
  <Route path="applications/review/:id" element={<ApplicationReview />} />
</Route>
</Routes>


      {!hideLayout && <Footer />}
      <GoogleTranslate />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <FirebaseProvider>
        <AppLayout />
      </FirebaseProvider>
    </Router>
  );
  //yyy
}
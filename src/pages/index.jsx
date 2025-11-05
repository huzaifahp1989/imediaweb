import Layout from "./Layout.jsx";

import Home from "./Home";

import Games from "./Games";

import Leaderboard from "./Leaderboard";

import Stories from "./Stories";

import Audio from "./Audio";

import Learn from "./Learn";

import ParentZone from "./ParentZone";

import About from "./About";

import Welcome from "./Welcome";

import ContactUs from "./ContactUs";

import Quran from "./Quran";

import Duas from "./Duas";

import RecordAndShare from "./RecordAndShare";

import RecordingsAdmin from "./RecordingsAdmin";

import CreativeCorner from "./CreativeCorner";

import LearningLibrary from "./LearningLibrary";

import ColoringPages from "./ColoringPages";

import DrawingBoard from "./DrawingBoard";

import PoetryWriting from "./PoetryWriting";

import MonthlyContest from "./MonthlyContest";

import IslamicEncyclopedia from "./IslamicEncyclopedia";

import AudioTafsir from "./AudioTafsir";

import IslamicFacts from "./IslamicFacts";

import Worksheets from "./Worksheets";

import AudioNew from "./AudioNew";

import Hadith from "./Hadith";

import History from "./History";

import Tajweed from "./Tajweed";

import PrintableQuizzes from "./PrintableQuizzes";

import Multimedia from "./Multimedia";

import FullQuran from "./FullQuran";

import ResetPointsAdmin from "./ResetPointsAdmin";

import AdminDashboard from "./AdminDashboard";

import AdminStories from "./AdminStories";

import AdminAudio from "./AdminAudio";

import AdminMedia from "./AdminMedia";

import PrivacyPolicy from "./PrivacyPolicy";

import Challenges from "./Challenges";

import AdminQuestions from "./AdminQuestions";

import Videos from "./Videos";

import AdminVideos from "./AdminVideos";

import AdminAudioContent from "./AdminAudioContent";

import AdminUsers from "./AdminUsers";

import DeleteAccount from "./DeleteAccount";

import LearningPaths from "./LearningPaths";

import AdminBanners from "./AdminBanners";

import AdminStoryBuilder from "./AdminStoryBuilder";

import AdminGameSettings from "./AdminGameSettings";

import Quizzes from "./Quizzes";

import AdminQuizManager from "./AdminQuizManager";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Games: Games,
    
    Leaderboard: Leaderboard,
    
    Stories: Stories,
    
    Audio: Audio,
    
    Learn: Learn,
    
    ParentZone: ParentZone,
    
    About: About,
    
    Welcome: Welcome,
    
    ContactUs: ContactUs,
    
    Quran: Quran,
    
    Duas: Duas,
    
    RecordAndShare: RecordAndShare,
    
    RecordingsAdmin: RecordingsAdmin,
    
    CreativeCorner: CreativeCorner,
    
    LearningLibrary: LearningLibrary,
    
    ColoringPages: ColoringPages,
    
    DrawingBoard: DrawingBoard,
    
    PoetryWriting: PoetryWriting,
    
    MonthlyContest: MonthlyContest,
    
    IslamicEncyclopedia: IslamicEncyclopedia,
    
    AudioTafsir: AudioTafsir,
    
    IslamicFacts: IslamicFacts,
    
    Worksheets: Worksheets,
    
    AudioNew: AudioNew,
    
    Hadith: Hadith,
    
    History: History,
    
    Tajweed: Tajweed,
    
    PrintableQuizzes: PrintableQuizzes,
    
    Multimedia: Multimedia,
    
    FullQuran: FullQuran,
    
    ResetPointsAdmin: ResetPointsAdmin,
    
    AdminDashboard: AdminDashboard,
    
    AdminStories: AdminStories,
    
    AdminAudio: AdminAudio,
    
    AdminMedia: AdminMedia,
    
    PrivacyPolicy: PrivacyPolicy,
    
    Challenges: Challenges,
    
    AdminQuestions: AdminQuestions,
    
    Videos: Videos,
    
    AdminVideos: AdminVideos,
    
    AdminAudioContent: AdminAudioContent,
    
    AdminUsers: AdminUsers,
    
    DeleteAccount: DeleteAccount,
    
    LearningPaths: LearningPaths,
    
    AdminBanners: AdminBanners,
    
    AdminStoryBuilder: AdminStoryBuilder,
    
    AdminGameSettings: AdminGameSettings,
    
    Quizzes: Quizzes,
    
    AdminQuizManager: AdminQuizManager,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    // Prevent returning 'Layout' as a page name
    if (!pageName || pageName === 'Layout') {
        return 'Home';
    }
    return pageName;
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Games" element={<Games />} />
                
                <Route path="/Leaderboard" element={<Leaderboard />} />
                
                <Route path="/Stories" element={<Stories />} />
                
                <Route path="/Audio" element={<Audio />} />
                
                <Route path="/Learn" element={<Learn />} />
                
                <Route path="/ParentZone" element={<ParentZone />} />
                
                <Route path="/About" element={<About />} />
                
                <Route path="/Welcome" element={<Welcome />} />
                
                <Route path="/ContactUs" element={<ContactUs />} />
                
                <Route path="/Quran" element={<Quran />} />
                
                <Route path="/Duas" element={<Duas />} />
                
                <Route path="/RecordAndShare" element={<RecordAndShare />} />
                
                <Route path="/RecordingsAdmin" element={<RecordingsAdmin />} />
                
                <Route path="/CreativeCorner" element={<CreativeCorner />} />
                
                <Route path="/LearningLibrary" element={<LearningLibrary />} />
                
                <Route path="/ColoringPages" element={<ColoringPages />} />
                
                <Route path="/DrawingBoard" element={<DrawingBoard />} />
                
                <Route path="/PoetryWriting" element={<PoetryWriting />} />
                
                <Route path="/MonthlyContest" element={<MonthlyContest />} />
                
                <Route path="/IslamicEncyclopedia" element={<IslamicEncyclopedia />} />
                
                <Route path="/AudioTafsir" element={<AudioTafsir />} />
                
                <Route path="/IslamicFacts" element={<IslamicFacts />} />
                
                <Route path="/Worksheets" element={<Worksheets />} />
                
                <Route path="/AudioNew" element={<AudioNew />} />
                
                <Route path="/Hadith" element={<Hadith />} />
                
                <Route path="/History" element={<History />} />
                
                <Route path="/Tajweed" element={<Tajweed />} />
                
                <Route path="/PrintableQuizzes" element={<PrintableQuizzes />} />
                
                <Route path="/Multimedia" element={<Multimedia />} />
                
                <Route path="/FullQuran" element={<FullQuran />} />
                
                <Route path="/ResetPointsAdmin" element={<ResetPointsAdmin />} />
                
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                
                <Route path="/AdminStories" element={<AdminStories />} />
                
                <Route path="/AdminAudio" element={<AdminAudio />} />
                
                <Route path="/AdminMedia" element={<AdminMedia />} />
                
                <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
                
                <Route path="/Challenges" element={<Challenges />} />
                
                <Route path="/AdminQuestions" element={<AdminQuestions />} />
                
                <Route path="/Videos" element={<Videos />} />
                
                <Route path="/AdminVideos" element={<AdminVideos />} />
                
                <Route path="/AdminAudioContent" element={<AdminAudioContent />} />
                
                <Route path="/AdminUsers" element={<AdminUsers />} />
                
                <Route path="/DeleteAccount" element={<DeleteAccount />} />
                
                <Route path="/LearningPaths" element={<LearningPaths />} />
                
                <Route path="/AdminBanners" element={<AdminBanners />} />
                
                <Route path="/AdminStoryBuilder" element={<AdminStoryBuilder />} />
                
                <Route path="/AdminGameSettings" element={<AdminGameSettings />} />
                
                <Route path="/Quizzes" element={<Quizzes />} />
                
                <Route path="/AdminQuizManager" element={<AdminQuizManager />} />
                <Route path="*" element={<Home />} />
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}
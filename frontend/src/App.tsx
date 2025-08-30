import BottomBar from "./components/BottomBar";
import MessageBar from "./components/MessageBar";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";
import styles from "./App.module.scss";
import useAuthCheck from "./hooks/useAuthCheck";
import Loading from "./components/Loading";

function App() {
  const checking = useAuthCheck();

  if (checking) return <Loading />
  
  return (
    <div className={styles.appContainer}>
      <div className={styles.navbarContainer}>
        <Navbar />
        <MessageBar />
      </div>
      <div className={styles.contentContainer}>
        <AppRoutes />
      </div>
      <div className={styles.bottomBarContainer}>
        <BottomBar />
      </div>
    </div>
  );
}

export default App;

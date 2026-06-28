import { useState } from "react";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Stock from "./pages/Stock";
import ContentStudio from "./pages/ContentStudio";
import MarketResearch from "./pages/MarketResearch";
import Posts from "./pages/Posts";
import Master from "./pages/Master";
import { useStore } from "./store/useStore";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [researchApply, setResearchApply] = useState(null);
  const store = useStore();
  const {
    data, addPost, updatePost, deletePost,
    addItem, updateItem, deleteItem,
    setFollowers, learningData, addLearning,
    masterStore, addMasterVersion, latestMasterVersion,
  } = store;

  const navToStudio = (itemId) => { setSelectedItemId(itemId); setPage("script"); };
  const navToStock  = (itemId) => { setSelectedItemId(itemId); setPage("stock"); };
  const navToResearch = (itemId) => { if (itemId) setSelectedItemId(itemId); setPage("research"); };

  const applyResearchToStudio = (payload) => {
    setResearchApply(payload);
    setSelectedItemId(payload.itemId);
    setPage("script");
  };

  const render = () => {
    switch (page) {
      case "dashboard": return <Dashboard data={data} setFollowers={setFollowers} />;
      case "stock":     return <Stock data={data} addItem={addItem} updateItem={updateItem} deleteItem={deleteItem} selectedItemId={selectedItemId} setSelectedItemId={setSelectedItemId} onNavToStudio={navToStudio} onNavToResearch={navToResearch} />;
      case "research":  return <MarketResearch data={data} learningData={learningData} onApplyToStudio={applyResearchToStudio} onNavToStudio={() => setPage("script")} />;
      case "script":    return <ContentStudio data={data} selectedItemId={selectedItemId} setSelectedItemId={setSelectedItemId} onNavToStock={navToStock} onNavToResearch={navToResearch} researchApply={researchApply} onClearResearch={() => setResearchApply(null)} addLearning={addLearning} learningData={learningData} />;
      case "posts":     return <Posts data={data} addPost={addPost} updatePost={updatePost} deletePost={deletePost} />;
      case "master":    return (
        <Master
          data={data}
          learningData={learningData}
          masterStore={masterStore}
          addMasterVersion={addMasterVersion}
          latestMasterVersion={latestMasterVersion}
        />
      );
      default: return null;
    }
  };

  return (
    <Layout active={page} onNav={setPage}>
      {render()}
    </Layout>
  );
}

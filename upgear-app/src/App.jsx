import { useState } from "react";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Stock from "./pages/Stock";
import ContentStudio from "./pages/ContentStudio";
import Posts from "./pages/Posts";
import Master from "./pages/Master";
import ProductUnderstanding from "./pages/ProductUnderstanding";
import { useStore } from "./store/useStore";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [selectedItemId, setSelectedItemId] = useState(null);
  const store = useStore();
  const {
    data, addPost, updatePost, deletePost,
    addItem, updateItem, deleteItem,
    setFollowers, learningData, addLearning,
    masterStore, addMasterVersion, latestMasterVersion,
    categories,
    addMainCategory, renameMainCategory, deleteMainCategory,
    addSubCategory, renameSubCategory, deleteSubCategory,
    resetCategories,
    genres, addGenre, renameGenre, deleteGenre, moveGenre, resetGenres,
  } = store;

  const navToStudio      = (itemId) => { setSelectedItemId(itemId); setPage("script"); };
  const navToStock       = (itemId) => { setSelectedItemId(itemId); setPage("stock"); };
  const navToUnderstanding = (itemId) => { setSelectedItemId(itemId); setPage("understanding"); };


  const render = () => {
    switch (page) {
      case "dashboard": return <Dashboard data={data} setFollowers={setFollowers} />;
      case "stock":     return <Stock data={data} addItem={addItem} updateItem={updateItem} deleteItem={deleteItem} selectedItemId={selectedItemId} setSelectedItemId={setSelectedItemId} onNavToStudio={navToStudio} onNavToUnderstanding={navToUnderstanding} categories={categories} genres={genres} addGenre={addGenre} renameGenre={renameGenre} deleteGenre={deleteGenre} moveGenre={moveGenre} resetGenres={resetGenres} />;
      case "understanding": {
        const uItem = (data.items || []).find(i => i.id === selectedItemId);
        return <ProductUnderstanding item={uItem} updateItem={updateItem} onBack={() => setPage("stock")} />;
      }
      case "script":    return <ContentStudio data={data} selectedItemId={selectedItemId} setSelectedItemId={setSelectedItemId} onNavToStock={navToStock} addLearning={addLearning} learningData={learningData} />;
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

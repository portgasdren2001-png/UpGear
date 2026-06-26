import { useState } from "react";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Stock from "./pages/Stock";
import ContentStudio from "./pages/ContentStudio";
import Posts from "./pages/Posts";
import Master from "./pages/Master";
import { useStore } from "./store/useStore";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const store = useStore();
  const { data, addPost, updatePost, deletePost, addItem, updateItem, deleteItem, setFollowers } = store;

  const render = () => {
    switch (page) {
      case "dashboard": return <Dashboard data={data} setFollowers={setFollowers} />;
      case "stock":     return <Stock data={data} addItem={addItem} updateItem={updateItem} deleteItem={deleteItem} />;
      case "script":    return <ContentStudio data={data} />;
      case "posts":     return <Posts data={data} addPost={addPost} updatePost={updatePost} deletePost={deletePost} />;
      case "master":    return <Master data={data} />;
      default:          return null;
    }
  };

  return (
    <Layout active={page} onNav={setPage}>
      {render()}
    </Layout>
  );
}

import { useState } from 'react';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import ProductList from './pages/ProductList.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Rankings from './pages/Rankings.jsx';
import Search from './pages/Search.jsx';

export default function App() {
  const [page,            setPage]            = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [listParams,      setListParams]      = useState({});

  const navTo = (p, params = {}) => {
    setPage(p);
    if (p === 'products') setListParams(params);
    if (p !== 'product')  setSelectedProduct(null);
    window.scrollTo(0, 0);
  };

  const openProduct = (id) => {
    setSelectedProduct(id);
    setPage('product');
    window.scrollTo(0, 0);
  };

  const render = () => {
    switch (page) {
      case 'home':
        return <Home onNav={navTo} onProduct={openProduct} />;
      case 'products':
        return <ProductList initialCategory={listParams.category} onProduct={openProduct} />;
      case 'product':
        return <ProductDetail id={selectedProduct} onBack={() => navTo('products')} onProduct={openProduct} />;
      case 'rankings':
        return <Rankings onProduct={openProduct} />;
      case 'search':
        return <Search onProduct={openProduct} />;
      default:
        return null;
    }
  };

  return (
    <Layout page={page} onNav={navTo}>
      {render()}
    </Layout>
  );
}

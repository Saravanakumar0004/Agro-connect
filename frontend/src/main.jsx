import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Register from './component/Register.jsx';
import Login from './component/Login.jsx';
import Account from './component/Account.jsx';
import AddProduct from './component/AddProduct.jsx';
import OrderForm from './component/OrderForm.jsx';
import ProductDetails from './component/ProductDetails.jsx';
import CustomerOrders from './component/CustomerOrders.jsx';
import FarmerOrders from './component/FarmerOrders.jsx';
import Shop from './component/Shop.jsx';
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/login',
    element: <Login />
  },{
    path: '/account',
    element: <Account/>
  },
  {
    path:'/add-product',
    element: <AddProduct/>
  },{
    path:'/order/:id',
    element: <OrderForm/>
  },{
    path:'/product/:id',
    element: <ProductDetails/>
  },{
    path:'/my-orders',
    element: <CustomerOrders/>
  },{
    path: '/farmer-orders',
    element: <FarmerOrders/>
  },
  {
    path: '/shop',
    element: <Shop/>
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

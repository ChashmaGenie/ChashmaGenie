import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/layout/Layout.jsx";

const Home = lazy(() => import("@/pages/Home.jsx"));
const Shop = lazy(() => import("@/pages/Shop.jsx"));
const Product = lazy(() => import("@/pages/Product.jsx"));
const Quote = lazy(() => import("@/pages/Quote.jsx"));
const QuoteDone = lazy(() => import("@/pages/QuoteDone.jsx"));
const Wishlist = lazy(() => import("@/pages/Wishlist.jsx"));
const Links = lazy(() => import("@/pages/Links.jsx"));
const About = lazy(() => import("@/pages/About.jsx"));
const Contact = lazy(() => import("@/pages/Contact.jsx"));
const Faq = lazy(() => import("@/pages/Faq.jsx"));
const ShippingReturns = lazy(() => import("@/pages/ShippingReturns.jsx"));
const Privacy = lazy(() => import("@/pages/Privacy.jsx"));
const NotFound = lazy(() => import("@/pages/NotFound.jsx"));

const AdminLayout = lazy(() => import("@/admin/AdminLayout.jsx"));
const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin.jsx"));
const AdminProducts = lazy(() => import("@/pages/admin/AdminProducts.jsx"));
const AdminProductForm = lazy(() => import("@/pages/admin/AdminProductForm.jsx"));
const AdminQuotes = lazy(() => import("@/pages/admin/AdminQuotes.jsx"));
const AdminSettings = lazy(() => import("@/pages/admin/AdminSettings.jsx"));
const AdminTools = lazy(() => import("@/pages/admin/AdminTools.jsx"));

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="shop/:category" element={<Shop />} />
        <Route path="p/:slug" element={<Product />} />
        <Route path="quote" element={<Quote />} />
        <Route path="quote/done/:id" element={<QuoteDone />} />
        <Route path="quote/:slug" element={<Quote />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="faq" element={<Faq />} />
        <Route path="shipping-returns" element={<ShippingReturns />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route element={<Layout chrome={false} />}>
        <Route path="links" element={<Links />} />
      </Route>
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<AdminLogin />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<AdminProductForm />} />
        <Route path="products/:id" element={<AdminProductForm />} />
        <Route path="quotes" element={<AdminQuotes />} />
        <Route path="quotes/:id" element={<AdminQuotes />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="tools" element={<AdminTools />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}

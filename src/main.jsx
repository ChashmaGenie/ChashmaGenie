import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { ToastProvider } from "@/components/ui/Toast.jsx";
import { SettingsProvider } from "@/lib/settings.jsx";
import { CatalogProvider } from "@/lib/catalog.jsx";
import { WishlistProvider } from "@/lib/wishlist.jsx";
import { BasketProvider } from "@/lib/basket.jsx";
import "./styles/index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <SettingsProvider>
          <CatalogProvider>
            <WishlistProvider>
              <BasketProvider>
                <App />
              </BasketProvider>
            </WishlistProvider>
          </CatalogProvider>
        </SettingsProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
);

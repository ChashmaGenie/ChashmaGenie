import { useEffect, useReducer } from "react";
import { useBasket } from "@/lib/basket.jsx";
import { clearDraft, loadDraft, quoteReducer, saveDraft, startingState } from "./quoteState.js";

export function useQuoteForm(route) {
  const basket = useBasket();
  const [state, dispatch] = useReducer(quoteReducer, null, () =>
    startingState({ draft: loadDraft(), basketItems: basket.items, ...route }),
  );

  useEffect(() => {
    saveDraft(state);
  }, [state]);

  return { state, dispatch, discardDraft: clearDraft };
}

import { useCallback, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { isCategory, parseFilters, shopPath } from "@/lib/filters.js";

export function useShopFilters() {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const filters = useMemo(() => parseFilters(searchParams, category), [searchParams, category]);
  const commit = useCallback((next) => navigate(shopPath(next), { replace: true }), [navigate]);

  return { filters, commit, hasUnknownCategory: Boolean(category) && !isCategory(category) };
}

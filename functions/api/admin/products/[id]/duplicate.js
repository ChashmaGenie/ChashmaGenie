import { HTTP } from "../../../../_lib/contract.js";
import { json, route } from "../../../../_lib/http.js";
import { duplicateProduct, purgeCatalog } from "../../../../_lib/product-service.js";

const duplicate = async (context) => {
  const { product } = await duplicateProduct(context.env, String(context.params.id));
  purgeCatalog(context);
  return json(product, HTTP.created);
};

export const onRequest = route({ POST: duplicate });

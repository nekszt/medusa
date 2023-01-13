import { RequestHandler, Router } from "express"
import "reflect-metadata"

import { Product } from "../../../.."
import middlewares, { transformQuery } from "../../../middlewares"
import { FlagRouter } from "../../../../utils/flag-router"
import { PaginatedResponse } from "../../../../types/common"
import { extendRequestParams } from "../../../middlewares/publishable-api-key/extend-request-params"
import PublishableAPIKeysFeatureFlag from "../../../../loaders/feature-flags/publishable-api-keys"
import { validateProductSalesChannelAssociation } from "../../../middlewares/publishable-api-key/validate-product-sales-channel-association"
import { validateSalesChannelParam } from "../../../middlewares/publishable-api-key/validate-sales-channel-param"
import { StoreGetProductsParams } from "./list-products"
import { StoreGetProductParams } from "./get-product"

const route = Router()

export default (app, featureFlagRouter: FlagRouter) => {
  app.use("/products", route)

  if (featureFlagRouter.isFeatureEnabled(PublishableAPIKeysFeatureFlag.key)) {
    route.use(
      "/",
      extendRequestParams as unknown as RequestHandler,
      validateSalesChannelParam as unknown as RequestHandler
    )
    route.use("/:id", validateProductSalesChannelAssociation)
  }

  route.get(
    "/",
    transformQuery(StoreGetProductsParams, {
      defaultRelations: defaultStoreProductsRelations,
      // defaultFields: defaultStoreProductsFields,
      // allowedFields: allowedStoreProductsFields,
      isList: true,
    }),
    middlewares.wrap(require("./list-products").default)
  )

  route.get(
    "/:id",
    transformQuery(StoreGetProductParams, {
      defaultRelations: defaultStoreProductsRelations,
      defaultFields: defaultStoreProductsFields,
      allowedFields: allowedStoreProductsFields,
    }),
    middlewares.wrap(require("./get-product").default)
  )

  route.post("/search", middlewares.wrap(require("./search").default))

  return app
}

export const defaultStoreProductsRelations = [
  "variants",
  "variants.prices",
  "variants.options",
  "options",
  "options.values",
  "images",
  "tags",
  "collection",
  "type",
]

export const defaultStoreProductsFields: (keyof Product)[] = [
  "id",
  "title",
  "subtitle",
  "status",
  "external_id",
  "description",
  "handle",
  "is_giftcard",
  "discountable",
  "thumbnail",
  "profile_id",
  "collection_id",
  "type_id",
  "weight",
  "length",
  "height",
  "width",
  "hs_code",
  "origin_country",
  "mid_code",
  "material",
  "created_at",
  "updated_at",
  "deleted_at",
  "metadata",
]

export const allowedStoreProductsFields = defaultStoreProductsFields

export * from "./list-products"
export * from "./search"

export type StoreProductsRes = {
  product: Product
}

export type StorePostSearchRes = {
  hits: unknown[]
  [k: string]: unknown
}

export type StoreProductsListRes = PaginatedResponse & {
  products: Product[]
}

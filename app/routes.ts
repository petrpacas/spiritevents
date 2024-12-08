import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@remix-run/route-config";

export default [
  layout("./routes/general/_layout.tsx", [
    index("./routes/general/index.tsx"),
    route("how-to-support", "./routes/general/howToSupport.tsx"),

    ...prefix("categories", [
      index("./routes/general/categories/index.tsx"),
      route("new", "./routes/general/categories/new.tsx"),
      route(":path/edit", "./routes/general/categories/$path.edit.tsx"),
    ]),

    ...prefix("events", [
      index("./routes/general/events/index.tsx"),
      route("new", "./routes/general/events/new.tsx"),
      route("suggest", "./routes/general/events/suggest.tsx"),
      route(":path", "./routes/general/events/$path.tsx"),
      route(":path/edit", "./routes/general/events/$path.edit.tsx"),
    ]),
  ]),

  layout("./routes/auth/_layout.tsx", [
    route("sign-in", "./routes/auth/signIn.tsx"),
    route("sign-out", "./routes/auth/signOut.tsx"),
  ]),

  ...prefix("resources", [
    route("footer", "./routes/resources/footer.tsx"),
    route("image-upload", "./routes/resources/imageUpload.tsx"),
  ]),

  ...prefix("api", [route("prune-storage", "./routes/api/pruneStorage.tsx")]),
] satisfies RouteConfig;

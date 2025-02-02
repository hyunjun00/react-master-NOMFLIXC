import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Root from "./Root.tsx";
import Home from "./Routes/Home.tsx";
import Tv from "./Routes/tv.tsx";
import Search from "./Routes/Search.tsx";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Root />,
      children: [
        {
          path: "",
          element: <Home />,
          children: [
            {
              path: "movies/:movieId",
            },
          ],
        },
        {
          path: "tv",
          element: <Tv />,
          children: [
            {
              path: ":tvId",
            },
          ],
        },
        {
          path: "search",
          element: <Search />,
        },
      ],
    },
  ],
  {
    basename: "/react-master-NOMFLIXC", // 서브 디렉터리 설정
  }
);

export default router;

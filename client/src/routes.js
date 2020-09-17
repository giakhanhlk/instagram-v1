import React, { lazy } from "react";

const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login"));

const routes = [
	{
		path: "/login",
		isExact: false,
		main: () => <Login />,
	},
	{
		path: "",
		isExact: true,
		main: () => <NotFound />,
	},
];

export default routes;

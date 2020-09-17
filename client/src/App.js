import React, { lazy, Suspense } from "react";
import { Router, Route, Switch } from "react-router-dom";
import { history } from "./_helpers/history";
import "semantic-ui-css/semantic.min.css";
import "./styles/index.css";
import routes from "./routes";
import PrivateRoute from "./components/PrivateRoute";

const Home = lazy(() => import("./pages/Home"));

function App() {
	return (
		<div className="app">
			<Router history={history}>
				<Suspense fallback={<div>Loading...</div>}>
					<>
						<Switch>
							<PrivateRoute exact path="/" component={Home} />
							{routes.map((route) => (
								<Route
									key={route.path}
									path={route.path}
									exact={route.isExact}
									render={route.main}
								/>
							))}
						</Switch>
					</>
				</Suspense>
			</Router>
		</div>
	);
}

export default App;

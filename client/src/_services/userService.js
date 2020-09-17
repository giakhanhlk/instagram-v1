const handleResponse = async (response) => {
	return response.text().then((text) => {
		const data = text && JSON.parse(text);
		if (!response.ok) {
			if (response.status === 401) {
				window.location.reload(true);
			}
			const error = (data && data.message) || response.statusText;
			return Promise.reject(error);
		}

		return data;
	});
};

const login = (email, password) => {
	const requestOptions = {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, password }),
	};

	return fetch("/api/user/login", requestOptions)
		.then(handleResponse)
		.then((res) => {
			// store user details and jwt token in local storage to keep user logged in between page refreshes
			localStorage.setItem("user", JSON.stringify({ token: res.user.token }));
			return res.user;
		});
};

export { login };

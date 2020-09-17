import React from "react";
import { Button, Form, Message, Icon } from "semantic-ui-react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import * as userActions from "../../actions/userAction";
import Messages from "../../components/Messages";
import "./Login.css";

class Login extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			email: "",
			password: "",
			emailToVerify: "",
			forgotPasswordEmail: "",
			submitted: false,
			showForm: false,
			forgotPasswordForm: false,
		};
	}

	componentDidMount = () => {
		document.title = "Đăng nhập | Instagrom";
	};

	handleChange = (e) => {
		const { name, value } = e.target;
		this.setState({ [name]: value });
	};

	handleSubmit = (e) => {
		e.preventDefault();

		this.setState({ submitted: true });
		const { email, password } = this.state;
		const { dispatch } = this.props;
		if (email && password) {
			dispatch(userActions.login(email, password));
		}
	};

	resendEmailVerification = () => {
		console.log("Pass");
	};

	forgotPasswordEmail = () => {
		console.log("Pass");
	};

	toggleEmailVerification = () => {
		this.setState({
			showForm: !this.state.showForm,
			forgotPasswordForm: false,
		});
	};

	toggleForgotPasswordForm = () => {
		this.setState({
			forgotPasswordForm: !this.state.forgotPasswordForm,
			showForm: false,
		});
	};

	render() {
		const { loggingIn, alert } = this.props;
		const {
			email,
			password,
			submitted,
			showForm,
			forgotPasswordForm,
		} = this.state;

		return (
			<div className="form-centered">
				<Message
					className="form-centered__title"
					size="large"
					attached
					header="Instagrom"
				/>
				{!forgotPasswordForm && !showForm ? (
					<Form
						className="attached fluid segment"
						size="large"
						name="form"
						onSubmit={this.handleSubmit}
					>
						<Form.Input
							autoCapitalize="none"
							label="Email"
							placeholder="Email hoặc tài khoản"
							type="text"
							name="email"
							value={email}
							error={submitted && !email ? true : false}
							onChange={this.handleChange}
						/>

						<Form.Input
							label="Mật khẩu"
							placeholder="Mật khẩu"
							type="password"
							name="password"
							value={password}
							error={submitted && !password ? true : false}
							onChange={this.handleChange}
						/>

						<Button
							size="large"
							fluid
							content="Đăng nhập"
							primary
							disabled={email !== "" && password !== "" ? false : true}
							loading={loggingIn ? true : false}
						/>
						{alert.type ? <Messages alert={alert} /> : null}
						<div className="login-asFacebook">
							<div className="login-asFacebook__line"></div>
							<div className="login-asFacebook__text">hoặc</div>
							<div className="login-asFacebook__line"></div>
						</div>
						<Button color="facebook" fluid>
							<Icon name="facebook" /> Đăng nhập bằng Facebook
						</Button>
					</Form>
				) : null}

				<Message size="large" attached="bottom" warning>
					{!forgotPasswordForm ? (
						<Icon name="help" />
					) : (
						<Icon name="arrow left" />
					)}
					{!forgotPasswordForm ? "Quên mật khẩu? " : ""}
					<span
						onClick={this.toggleForgotPasswordForm}
						style={{
							fontWeight: "700",
							cursor: "pointer",
						}}
					>
						{!forgotPasswordForm
							? "Lấy lại mật khẩu"
							: "Quay về trang đăng nhập"}
					</span>
					<br></br>
					{!showForm ? <Icon name="envelope" /> : <Icon name="arrow left" />}
					{!showForm ? "Chưa xác thực Email? " : ""}

					<span
						onClick={this.toggleEmailVerification}
						style={{
							fontWeight: "700",
							cursor: "pointer",
						}}
					>
						{!showForm ? "Xác thực" : "Quay về trang đăng nhập"}
					</span>
				</Message>
				{showForm ? (
					<Form className="segment" size="large" name="form">
						<Form.Field>
							<label>Email</label>
							<input
								name="emailToVerify"
								placeholder="Nhập Email đăng ký để xác thực"
								type="email"
								onChange={this.handleChange}
							/>
						</Form.Field>

						<Button fluid type="submit" onClick={this.resendEmailVerification}>
							Gửi
						</Button>
					</Form>
				) : null}
				{forgotPasswordForm ? (
					<Form className="segment" size="large" name="form">
						<Form.Field>
							<label>Email</label>
							<input
								name="forgotPasswordEmail"
								placeholder="Nhập Email của bạn nhận lại mật khẩu"
								type="email"
								onChange={this.handleChange}
							/>
						</Form.Field>
						<Button fluid type="submit" onClick={this.forgotPasswordEmail}>
							Gửi
						</Button>
					</Form>
				) : null}
				<Message>
					<Message.Header className="form-login__transRegister">
						Không có tài khoản?&nbsp;
						<Link to={"/register"}>Đăng ký</Link>
						<br></br>
					</Message.Header>
				</Message>
			</div>
		);
	}
}

const mapStateToProps = (state) => ({
	loggingIn: state.authentication.loggingIn,
	alert: state.alert,
});

export default connect(mapStateToProps, null)(Login);

import {Box, Button, Checkbox, Paper, TextField, Typography} from "@mui/material";
import React from "react";
import "./index.scss"
import history from "../../history";
import * as generalActions from "../../redux/general/actions";
import * as snackBarActions from "../../redux/snackbar/actions";
import {connect} from "react-redux";
import userAPI from "../../api/userAPI";
import {SnackBarType, UserRoleType} from "../../utils/enumerates";

const mapDispatcherToProps =
	(dispatch: any): ILoginPropsFromDispatch => {
		return {
			showSnackBar: (pMsg: string, pDuration: number, pType: SnackBarType) => dispatch(snackBarActions.showSnackBar(pMsg, pDuration, pType)),
			showTopLoading: () => dispatch(generalActions.showTopLoading()),
			hideTopLoading: () => dispatch(generalActions.hideTopLoading()),
		}
	}

interface ILoginPropsFromDispatch {
	showTopLoading?: () => void;
	hideTopLoading?: () => void;
	showSnackBar?: (pMsg: string, pDuration: number, pType: SnackBarType) => void;
}

type ILoginProps = ILoginPropsFromDispatch;

interface ILoginState {
	email: string;
	password: string;
	emailErrMsg: string;
	passwordErrMsg: string;
	errMsg: string;
}

@(connect(null, mapDispatcherToProps) as any)
export default class Login extends React.Component<ILoginProps, ILoginState> {
	constructor(props: {}) {
		super(props);
		this.state = {
			email: "",
			password: "",
			emailErrMsg: "",
			passwordErrMsg: "",
			errMsg: "",
		}
	}

	render() {
		const {errMsg, emailErrMsg, passwordErrMsg, email, password} = this.state;
		const {showTopLoading, hideTopLoading, showSnackBar} = this.props;
		return (
			<Paper className={`login-container`}>
				<img
					className={`img-logo`}
					src="/crolab_logo.png"
					alt="crolab_logo"
				/>
				<Typography
					variant="caption"
					sx={{display: "block", color: "gray", mb: 7}}
				>
					Nền tảng crowdsourcing gán nhãn dữ liệu
				</Typography>
				<Typography
					variant="h5"
					sx={{display: "block", color: "#1976d2", fontWeight: 500}}
				>
					Đăng nhập
				</Typography>

				<TextField
					className={`tf-username`}
					id={`tf-username`}
					label="Email"
					variant="outlined"
					value={email}
					error={!!emailErrMsg}
					helperText={emailErrMsg}
					onChange={(ev) => {
						this.setState({
							email: ev.target.value,
							errMsg: "",
							emailErrMsg: "",
						})
					}}
				/>
				<TextField
					className={`tf-password`}
					id={`tf-username`}
					label="Mật khẩu"
					type="password"
					value={password}
					error={!!passwordErrMsg}
					helperText={passwordErrMsg}
					onChange={(ev) => {
						this.setState({
							password: ev.target.value,
							errMsg: "",
							passwordErrMsg: "",
						})
					}}
				/>
				{!!errMsg && <p style={{marginTop: "20px", color: "#d32f2f"}}>{errMsg}</p>}
				<Box sx={{mt: "15px", mb: "10px"}}>
					<Checkbox/>
					<Typography
						variant="body1"
						component="span"
					>
						Tự động đăng nhập lần sau
					</Typography>
				</Box>
				<Typography
					variant="body1"
					component="span"
				>
					Chưa có tài khoản? <span
					onClick={() => {
						history.push("/register");
					}}
					className={`sp-register-hyperlink`}
				>
                        Đăng ký
                    </span>
				</Typography>
				<Button
					className={`bt-login`}
					variant="contained"
					onClick={() => {
						this.setState({
							errMsg: "",
							emailErrMsg: "",
							passwordErrMsg: ""
						})
						showTopLoading!();
						userAPI
							.login(email, password)
							.then(res => {
								if (res.data.result === 201) {
									localStorage.setItem("loggedIn", "1");
									localStorage.setItem("userFullName", res.data.full_name);
									localStorage.setItem("accessToken", res.data.access_token);
									localStorage.setItem("refreshToken", res.data.refresh_token);
									localStorage.setItem("userId", res.data.user_id);
									localStorage.setItem("userRole", res.data.role);
									localStorage.setItem("accessExpires", res.data.access_expires);
									localStorage.setItem("refreshExpires", res.data.refresh_expires);

									showSnackBar!(
										res.data.message,
										4000,
										SnackBarType.Success
									);
									switch (res.data.role) {
										case UserRoleType.Requester:
											history.push("/requester/jobmanagement");
											return;
										case UserRoleType.Annotator:
											history.push("/annotator/dashboard");
											return;
										case UserRoleType.Admin:
											history.push("/admin/jobmanagement");
											return;
									}
								} else {
									this.setState({errMsg: "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!"});
								}
							})
							.catch(err => {
								if (
									!!err
									&& !!err.message
								) {
									if (typeof err.message === "string") {
										this.setState({errMsg: err.message});
									}
									if (!!err.message.email) {
										if (typeof err.message.email === "string") {
											this.setState({emailErrMsg: err.message.email});
										}
										if (
											typeof err.message.email === "object"
											&& err.message.email.length > 0) {
											this.setState({emailErrMsg: err.message.email[0]});
										}
									}
									if (!!err.message.password) {
										if (typeof err.message.password === "string") {
											this.setState({passwordErrMsg: err.message.password});
										}
										if (
											typeof err.message.password === "object"
											&& err.message.password.length > 0) {
											this.setState({passwordErrMsg: err.message.password[0]});
										}
									}
								} else {
									this.setState({errMsg: "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!"});
								}
							})
							.finally(() => hideTopLoading!())
					}}
				>
					Đăng nhập
				</Button>

			</Paper>
		)
	}
}
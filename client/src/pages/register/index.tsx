import "./index.scss"
import history from "../../history";
import {Button, FormControl, InputLabel, MenuItem, Paper, Select, Stack, TextField} from "@mui/material";
import React from "react";
import * as generalActions from "../../redux/general/actions";
import * as snackBarActions from "../../redux/snackbar/actions";
import {connect} from "react-redux";
import userAPI from "../../api/userAPI";
import {GenderType, SnackBarType, UserRoleType} from "../../utils/enumerates";

const mapDispatcherToProps =
	(dispatch: any): IRegisterPropsFromDispatch => {
		return {
			showSnackBar: (pMsg: string, pDuration: number, pType: SnackBarType) => dispatch(snackBarActions.showSnackBar(pMsg, pDuration, pType)),
			showTopLoading: () => dispatch(generalActions.showTopLoading()),
			hideTopLoading: () => dispatch(generalActions.hideTopLoading()),
		}
	}

interface IRegisterPropsFromDispatch {
	showTopLoading?: () => void;
	hideTopLoading?: () => void;
	showSnackBar?: (pMsg: string, pDuration: number, pType: SnackBarType) => void;
}

interface IRegisterState {
	email: string;
	password: string;
	fName: string;
	fNameErrMsg: string;
	emailErrMsg: string;
	passwordErrMsg: string;
	errMsg: string;
	confirmPassword: string;
	confirmPasswordErrMsg: string;
	yob: number;
	role: UserRoleType;
	gender: GenderType;
}

type IRegisterProps = IRegisterPropsFromDispatch;

class Register extends React.Component<IRegisterProps, IRegisterState> {
	constructor(props: {}) {
		super(props);
		this.state = {
			email: "",
			password: "",
			emailErrMsg: "",
			passwordErrMsg: "",
			errMsg: "",
			fName: "",
			fNameErrMsg: "",
			confirmPassword: "",
			confirmPasswordErrMsg: "",
			yob: 1999,
			role: UserRoleType.Annotator,
			gender: GenderType.Male,
		}
	}

	render() {
		const {
			email, password, fName, confirmPassword, errMsg, confirmPasswordErrMsg,
			yob, role, gender
		} = this.state;
		return (
			<Paper className={`register-container`}>
				<img src='/crolab_logo.png' alt='crolab_logo'/>
				<h1>????ng k??</h1>
				<TextField
					className={`tf-normal`}
					id={`tf-username`}
					value={email}
					onChange={(ev) => {
						this.setState({
							email: ev.target.value,
							errMsg: "",
							emailErrMsg: "",
						})
					}}
					label="Email"
					variant="outlined"
				/>
				<TextField
					className={`tf-normal`}
					id={`tf-full-name`}
					label="H??? v?? t??n"
					value={fName}
					onChange={(ev) => {
						this.setState({
							fName: ev.target.value,
							errMsg: "",
							fNameErrMsg: "",
						})
					}}
					variant="outlined"
				/>
				<TextField
					className={`tf-normal`}
					id={`tf-phone`}
					label="S??? ??i???n tho???i"
					variant="outlined"
				/>
				<Stack direction={"row"} spacing={2}>
					<FormControl sx={{flexGrow: 1}}>
						<InputLabel id="slt-role">Vai tr??</InputLabel>
						<Select
							labelId="slt-role"
							id="slt-role"
							value={role}
							label="Vai tr??"
							onChange={(ev) => {
								this.setState({
									role: ev.target.value as UserRoleType,
								})
							}}
						>
							<MenuItem value={UserRoleType.Annotator}>Annotator</MenuItem>
							<MenuItem value={UserRoleType.Requester}>Requester</MenuItem>
						</Select>
					</FormControl>
					<FormControl sx={{flexGrow: 1}}>
						<InputLabel id="slt-yob">N??m sinh</InputLabel>
						<Select
							labelId="slt-yob"
							id="slt-yob"
							value={yob}
							label="N??m sinh"
							onChange={(ev) => {
								this.setState({
									yob: ev.target.value as number,
								})
							}}
						>
							{Array.from({length: (2020 - 1980) + 1}, (_, i) => 1980 + i)
								.map((year: number) => <MenuItem value={year}>{year}</MenuItem>)}
						</Select>
					</FormControl>
					<FormControl sx={{flexGrow: 1}}>
						<InputLabel id="slt-gender">Gi???i t??nh</InputLabel>
						<Select
							labelId="slt-gender"
							id="slt-gender"
							value={gender}
							label="Gi???i t??nh"
							onChange={e => {
								this.setState({
									gender: e.target.value as GenderType,
								})
							}}
						>
							<MenuItem value={GenderType.Male}>Nam</MenuItem>
							<MenuItem value={GenderType.Female}>N???</MenuItem>
							<MenuItem value={GenderType.NonBinary}>Kh??c</MenuItem>
						</Select>
					</FormControl>
				</Stack>
				<TextField
					className={`tf-password`}
					id={`tf-username`}
					label="M???t kh???u"
					type="password"
					variant="outlined"
					value={password}
					onChange={(ev) => {
						this.setState({
							password: ev.target.value,
							errMsg: "",
							passwordErrMsg: "",
						})
					}}
				/>
				<TextField
					className={`tf-password`}
					id={`tf-username`}
					label="X??c nh???n m???t kh???u"
					type="password"
					variant="outlined"
					value={confirmPassword}
					error={!!confirmPasswordErrMsg}
					helperText={confirmPasswordErrMsg}
					onChange={(ev) => {
						this.setState({
							confirmPassword: ev.target.value,
							errMsg: "",
							confirmPasswordErrMsg: "",
						})
					}}
				/>
				{!!errMsg && <p style={{color: "#d32f2f"}}>{errMsg}</p>}
				<p>
					???? c?? t??i kho???n? <span
					onClick={() => {
						history.push("/login");
					}}
					className={`sp-login-hyperlink`}
				>
						????ng nh???p
					</span>
				</p>
				<Button
					className={`bt-login`}
					variant="contained"
					onClick={() => {
						if (password !== confirmPassword) {
							this.setState({confirmPasswordErrMsg: "M???t kh???u kh??ng tr??ng kh???p, vui l??ng ki???m tra l???i!"})
						} else {
							this.props.showTopLoading!();
							userAPI.register(email, fName, password, yob, gender, role).then((res: any) => {
								console.log(res)
								if (res.data && res.status && res.status === 201) {
									history.push("/login");
									this.props.showSnackBar!("Ch??c m???ng! B???n ???? ????ng k?? th??nh c??ng", 10000, SnackBarType.Success);
								} else {
									this.setState({errMsg: res.data.message});
								}
							}).catch((err: any) => {
								this.setState({errMsg: err.message})
							}).finally(() => this.props.hideTopLoading!())
						}
					}}
				>
					????ng k?? t??i kho???n
				</Button>
			</Paper>
		)
	}
}

export default connect(null, mapDispatcherToProps)(Register);

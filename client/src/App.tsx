import {
	Router,
	Route,
} from "react-router-dom";
import Main from './pages';
import Register from "./pages/register";
import history from './history';
import Login from "./pages/login";
import Header from "./header";
import { connect } from 'react-redux';
import { IRootState } from './redux';
import * as snackBarActions from './redux/snackbar/actions';
import React from "react";
import {
	LinearProgress,
	Typography,
	Modal,
	Box,
	Snackbar,
	Alert
} from "@mui/material";
import { SnackBarType } from "./utils/enumerates";
import { ISnackBarState, SnackBarActions } from "./redux/snackbar/types";
import { Dispatch } from "redux";
import Utils from "./utils/utils";
import JobManagement from "./pages/requesterpages/jobmanagement";
import "./index.scss";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CreateJob from "./pages/requesterpages/createjob";
import AnnotateTruth from "./pages/requesterpages/annotatetruth";

function mapDispatcherToProps(dispatch: Dispatch<SnackBarActions>): IAppPropsFromDispatch {
	return {
		showSnackBar: (pMsg: string, pDuration: number, pType: SnackBarType) => dispatch(snackBarActions.showSnackBar(pMsg, pDuration, pType)),
		hideSnackBar: () => dispatch(snackBarActions.hideSnackBar()),
	}
}
interface IAppPropsFromDispatch {
	showSnackBar?: (pMsg: string, pDuration: number, pType: SnackBarType) => void;
	hideSnackBar?: () => void;
}
function mapStateToProps({ general, snackBar }: IRootState): IAppPropsFromState {
	const { showTopLoading } = general;
	return {
		showTopLoading,
		snackBarState: snackBar
	};
}

interface IAppPropsFromState {
	showTopLoading?: boolean;
	snackBarState?: ISnackBarState
}

type IAppProps = IAppPropsFromState & IAppPropsFromDispatch;

const modalStyle: any = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 400,
	bgcolor: 'background.paper',
	borderRadius: 2,
	boxShadow: 24,
	p: 4,
	textAlign: "center",
};
const theme = createTheme({
	palette: {
		primary: {
			main: '#2196F3'
		},
		secondary: {
			main: '#02BCD5'
		},
		success: {
			main: '#4CB050'
		},
		error: {
			main: '#E91D64'
		},
		warning: {
			main: '#FFC208'
		},
		info: {
			main: '#2196F3'
		}
	}
});

class App extends React.Component<IAppProps> {
	private onSnackBarClosed = () => {
		this.props.hideSnackBar!();
	}
	render() {
		return (
			<ThemeProvider theme={theme}>
				<Box
					className={`container`}
					style={{
						// backgroundImage: `url("/bg.jpg")`,
						background: "#F7F9FB"
					}}>
					<Header inLoginScreen={window.location.pathname === "/login"} />
					<Router history={history}>
						<Route exact path='/' component={Main} />
						<Route exact path='/register' component={Register} />
						<Route exact path='/login' component={Login} />
						<Route exact path='/requester/jobmanagement' component={JobManagement} />
						<Route exact path='/requester/createjob' component={CreateJob} />
						<Route exact path='/requester/job/:jobid/annotatetruth/' component={AnnotateTruth} />
					</Router>
					<Modal
						open={!!this.props.showTopLoading}
						aria-labelledby="modal-modal-title"
						aria-describedby="modal-modal-description"
					>
						<Box sx={modalStyle}>
							<Typography
								id="modal-modal-title"
								variant="h6"
								component="h2"
								sx={{ mb: 3 }}
							>
								Xin chờ một chút ...
							</Typography>
							<LinearProgress />
						</Box>
					</Modal>
					<Snackbar
						open={!!this.props.snackBarState?.showSnackBar} autoHideDuration={
							!!this.props.snackBarState?.duration ?
								this.props.snackBarState.duration : 2000
						}
						onClose={this.onSnackBarClosed}>
						<Alert
							onClose={this.onSnackBarClosed}
							severity={Utils.convertSnackBarType(
								this.props.snackBarState?.type
							)}
							sx={{ width: '100%' }}
						>
							{this.props.snackBarState?.msg}
						</Alert>
					</Snackbar>

				</Box>

			</ThemeProvider >
		);
	}
}


export default connect(mapStateToProps, mapDispatcherToProps)(App);

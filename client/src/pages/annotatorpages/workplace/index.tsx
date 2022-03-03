import {
	Box,
	Button,
	Modal,
	Pagination,
	Paper,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
	TextField,
	Typography
} from "@mui/material";
import React from "react";
import "./index.scss"
import * as generalActions from "../../../redux/general/actions";
import * as snackBarActions from "../../../redux/snackbar/actions";
import {SnackBarType} from "../../../utils/enumerates";
import {connect} from "react-redux";
import history from "../../../history";
import {RouteComponentProps} from "react-router-dom";
import taskAPI from "../../../api/taskAPI";
import {Task, Unit} from "../../../type";
import ReactAudioPlayer from "react-audio-player";
import {modalStyle} from "../../../utils/utils";

const mapDispatcherToProps =
	(dispatch: any): IWorkPlacePropsFromDispatch => {
		return {
			showSnackBar: (pMsg: string, pDuration: number, pType: SnackBarType) => dispatch(snackBarActions.showSnackBar(pMsg, pDuration, pType)),
			showTopLoading: () => dispatch(generalActions.showTopLoading()),
			hideTopLoading: () => dispatch(generalActions.hideTopLoading()),
		}
	}

interface IWorkPlacePropsFromDispatch {
	showTopLoading?: () => void;
	hideTopLoading?: () => void;
	showSnackBar?: (pMsg: string, pDuration: number, pType: SnackBarType) => void;
}

interface IWorkPlaceUrlParams {
	taskid?: string;
	page?: string;
}

type IWorkPlaceProps = RouteComponentProps<IWorkPlaceUrlParams> &
	IWorkPlacePropsFromDispatch;

interface IWorkPlaceState {
	task?: Task;
	units: Unit[];
	saved: boolean;
	showDiscardModal: boolean;
	showFinishModal: boolean;
	nextPage: number;
	isBack: boolean;
}

@(connect(null, mapDispatcherToProps) as any)
export default class WorkPlace extends React.Component<IWorkPlaceProps, IWorkPlaceState> {
	constructor(props: IWorkPlaceProps) {
		super(props);
		this.state = {
			units: [],
			saved: true,
			showDiscardModal: false,
			showFinishModal: false,
			isBack: false,
			nextPage: 1,
		}
	}

	componentDidMount() {
		this.getData(this.props.match.params.taskid!, this.props.match.params.page!);
	}

	private getData = (taskId: number | string, page: number | string) => {
		this.props.showTopLoading!();
		taskAPI.getTaskById(
			taskId,
			page,
		).then(res => {
			console.log(res);
			// TODO: validate
			this.setState(({
				task: res.data.task,
				units: res.data.units.results,
				showDiscardModal: false,
				saved: true,
			}))
		}).finally(() => this.props.hideTopLoading!())
	}

	render() {
		const taskId = this.props.match.params.taskid!;
		const currentPage = parseInt(this.props.match.params.page!);
		const {task, units, saved, showDiscardModal, nextPage, isBack} = this.state;
		return (task ? <Paper className={`workplace-container`}>
				<Typography variant={`h6`} sx={{mb: "20px"}}>
					{task.job.name}
				</Typography>
				<TableContainer component={Paper} sx={{display: "block"}}>
					<Table>
						<TableBody>
							{units.map(unit => {
								return <TableRow sx={{p: 0}}>
									<TableCell sx={{p: "10px 20px"}}>
										<ReactAudioPlayer
											style={{width: "500px"}}
											src={`https://crolab.blob.core.windows.net/mediacrolab/${unit.data}`}
											controls
										/>
									</TableCell>
									<TableCell sx={{p: 1, width: "800px"}}>
										<TextField
											placeholder={"Chưa có nhãn"}
											value={unit.label ? unit.label : ""}
											onChange={event => {
												this.setState({
													units: units.map(u => (u.id !== unit.id) ? u : {
														...u,
														label: event.target.value,
													}),
													saved: false,
												});
											}}
											fullWidth
										/>
									</TableCell>
								</TableRow>
							})}
						</TableBody>
					</Table>
				</TableContainer>
				<Stack direction={`row`}>
					<Button
						variant={`outlined`} sx={{mt: 2, mr: 2}}
						onClick={() => {
							if (saved) {
								history.push(`/annotator/dashboard`);
							} else {
								this.setState({
									isBack: true,
									showDiscardModal: true,
								})
							}
						}}
					>
						Quay lại
					</Button>
					<Button
						disabled={task.labeled_unit < task.unit_qty}
						variant={`contained`}
						sx={{mt: 2, mr: 2, color: "white"}}
						color={`success`}
						onClick={() => this.setState({showFinishModal: true})}
					>
						Hoàn thành
					</Button>
					<Button
						variant={`contained`}
						sx={{mt: 2, mr: 2}}
						onClick={this.saveData}
					>
						Lưu
					</Button>
					<Typography sx={{mt: 3, color: saved ? "#4CB050" : "#E91D64", fontWeight: 300}}>
						{saved ? `Đã lưu` : `Chưa lưu nhãn`}
					</Typography>
					<Box sx={{flexGrow: 1}}/>
					<Pagination
						sx={{display: "block", mt: `20px`}}
						count={Math.ceil(task.unit_qty / 10)}
						page={currentPage}
						color="primary"
						onChange={(_, page) => {
							if (saved) {
								history.push(`/annotator/workplace/${taskId}/page/${page}`);
								this.getData(taskId, page);
							} else {
								this.setState({
									showDiscardModal: true,
									nextPage: page,
									isBack: false,
								})
							}
						}}
					/>
				</Stack>
				<Modal
					open={showDiscardModal}
					aria-labelledby="modal-modal-title"
					aria-describedby="modal-modal-description"
				>
					<Box sx={modalStyle}>
						<Typography
							sx={{fontWeight: 300, mb: "20px"}}
						>
							Bạn chưa lưu thay đổi. Vui lòng kiểm tra lại <br/> thông tin
						</Typography>
						<Stack direction={`row-reverse`} spacing={`20px`}>
							<Button
								variant={`contained`}
								onClick={() => {
									this.saveData();
									history.push(isBack ? `/annotator/dashboard` :
										`/annotator/workplace/${taskId}/page/${nextPage}`);
									this.getData(taskId, nextPage);
								}}
							>
								Lưu
							</Button>
							<Button
								variant={`contained`}
								color={`error`}
								onClick={() => {
									history.push(isBack ? `/annotator/dashboard` :
										`/annotator/workplace/${taskId}/page/${nextPage}`);
									this.getData(taskId, nextPage);
								}}
							>
								Bỏ qua
							</Button>
							<Button variant={`outlined`} onClick={() => {
								this.setState({
									showDiscardModal: false,
								})
							}}>
								Đóng
							</Button>
						</Stack>
					</Box>
				</Modal>
				<Modal
					open={this.state.showFinishModal}
					aria-labelledby="modal-modal-title"
					aria-describedby="modal-modal-description"
				>
					<Box sx={modalStyle}>
						<Typography variant={`h6`}>
							Hoàn thành phân công
						</Typography>
						<Typography
							sx={{fontWeight: 300, mt: "20px", mb: "20px", color: "#E91D64"}}
						>
							Lưu ý: sau khi hoàn thành phân công, bạn sẽ không thay <br/>
							đổi nhãn đã gán được nữa!
						</Typography>
						<Typography
							sx={{fontWeight: 300, mt: "20px", mb: "20px"}}
						>
							Bạn có chắc chắn muốn hoàn thành?
						</Typography>
						<Stack direction={`row-reverse`} spacing={`20px`}>
							<Button
								variant={`contained`}
								onClick={() => {
									this.props.showTopLoading!();
									taskAPI.finishTask(taskId).then(res => {
										if (res.status === 201) {
											this.props.showSnackBar!(
												"Chúc mừng bạn đã hoàn thành phân công!",
												10000,
												SnackBarType.Success
											);
											history.push("/annotator/dashboard")
										} else {
											this.props.showSnackBar!(
												"Thao tác thất bại!",
												10000,
												SnackBarType.Error
											)
											this.setState({
												showFinishModal: false,
											})
										}
									}).catch(err => {
										this.props.showSnackBar!(
											"Thao tác thất bại! " + err.message,
											10000,
											SnackBarType.Error
										)
										this.setState({
											showFinishModal: false,
										})
									}).finally(() => {
										this.props.hideTopLoading!();
									})
								}}
							>
								Hoàn thành
							</Button>
							<Button variant={`outlined`} onClick={() => {
								this.setState({
									showFinishModal: false,
								})
							}}>
								Đóng
							</Button>
						</Stack>
					</Box>
				</Modal>
			</Paper> : <></>
		)
	}

	private saveData = () => {
		this.props.showTopLoading!();
		taskAPI.submitLabel(this.props.match.params.taskid!, this.state.units.filter(u => !!u.label)).then(res => {
			if (res.status === 201) {
				this.props.showSnackBar!(
					"Lưu nhãn thành công!",
					10000,
					SnackBarType.Success
				)
				this.setState({
					saved: true
				});
				if (this.state.task) {
					this.setState({
						task: {
							...this.state.task,
							labeled_unit: this.state.task.labeled_unit + this.state.units.length,
						}
					})
				}
			} else {
				this.props.showSnackBar!(
					"Lưu nhãn thất bại!",
					10000,
					SnackBarType.Error
				)
			}
		}).catch(err => {
			this.props.showSnackBar!(
				"Lưu nhãn thất bại! " + err.message,
				10000,
				SnackBarType.Error
			)
		}).finally(() => {
			this.props.hideTopLoading!();
		})
	}
}

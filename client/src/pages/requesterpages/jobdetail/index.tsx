import {
	Avatar,
	Box,
	Button,
	Card,
	CardHeader,
	Grid,
	LinearProgress,
	Link,
	Modal,
	Paper,
	Rating,
	Stack,
	Table,
	TableBody,
	TableContainer,
	Typography,
	TextField
} from "@mui/material";
import React from "react";
import * as generalActions from "../../../redux/general/actions";
import * as snackBarActions from "../../../redux/snackbar/actions";
import { SnackBarType } from "../../../utils/enumerates";
import { connect } from "react-redux";
import jobAPI from "../../../api/jobAPI";
import ReactAudioPlayer from 'react-audio-player';
import { RouteComponentProps } from "react-router-dom";
import { StyledTableCell, StyledTableRow } from "../jobmanagement";
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import { BorderLinearProgress, CustomTooltip, modalStyle } from "../../../utils/utils";
import taskAPI from "../../../api/taskAPI";
import { Job, Task } from "../../../type";

const mapDispatcherToProps =
	(dispatch: any): IJobDetailPropsFromDispatch => {
		return {
			showSnackBar: (pMsg: string, pDuration: number, pType: SnackBarType) => dispatch(snackBarActions.showSnackBar(pMsg, pDuration, pType)),
			showTopLoading: () => dispatch(generalActions.showTopLoading()),
			hideTopLoading: () => dispatch(generalActions.hideTopLoading()),
		}
	}

interface IJobDetailPropsFromDispatch {
	showTopLoading?: () => void;
	hideTopLoading?: () => void;
	showSnackBar?: (pMsg: string, pDuration: number, pType: SnackBarType) => void;
}

interface IJobDetailUrlParams {
	jobid?: string;
}

type IJobDetailProps = RouteComponentProps<IJobDetailUrlParams> & IJobDetailPropsFromDispatch;

interface IJobDetailState {
	jobDetail: Job;
	showTaskDetailModal: boolean;
	modalTask?: Task;
	showRatingModal: boolean;
}

@(connect(null, mapDispatcherToProps) as any)
export default class JobDetail extends React.Component<IJobDetailProps, IJobDetailState> {
	constructor(props: IJobDetailProps) {
		super(props);
		this.state = {
			showTaskDetailModal: false,
			showRatingModal: false,
			jobDetail: {
				accepted_qty: 0,
				accepted_threshold: 0,
				bonus_threshold: 0,
				category: 0,
				created_at: "",
				deadline: "",
				description: "",
				id: 0,
				min_qty: 0,
				name: "",
				requester: {
					id: 0,
					full_name: "",
					email: "",
					created_at: "",
					updated_at: "",
					gender: 0,
					year_of_birth: 0,
					rating: 0,
					role: 0,
					task_c: 0,
					mean_truth_accuracy: 0,
					mean_shared_accuracy: 0,
					label_c: 0,
				},
				shared_qty: 0,
				tasks: [],
				truth_qty: 0,
				truth_qty_ready: false,
				truth_units: [],
				unit_bonus: 0,
				unit_qty: 0,
				unit_wage: 0,
				updated_at: "",
			}
		}
	}

	componentDidMount() {
		this.reloadData();
	}

	private reloadData = () => {
		this.props.showTopLoading!();
		jobAPI.getJobDetail(parseInt(this.props.match.params.jobid!)).then(res => {
			// TODO: validate
			this.setState({
				jobDetail: res.data
			})
		}).finally(() => this.props.hideTopLoading!());
	}

	render() {
		const { jobDetail, } = this.state;
		return (
			!!jobDetail ? <Box sx={{ display: "block", width: "100%", height: "100%", p: "20px", }}>
				{this.renderJobDetail()}
				{this.renderTaskManagement()}
				{this.renderTaskDetailModal()}
				{this.renderRatingModal()}
			</Box> : <></>
		)
	}

	private renderTaskDetailModal = () => {
		const { modalTask } = this.state;
		return !!modalTask && <Modal
			open={this.state.showTaskDetailModal}
			aria-labelledby="modal-modal-title"
			aria-describedby="modal-modal-description"
		>
			<Box sx={modalStyle}>
				<Stack spacing={`10px`}>
					{this.renderUnitsTable()}
					{this.renderModalButtons()}
				</Stack>
			</Box>
		</Modal>
	}

	private renderRatingModal = () => {
		const { modalTask } = this.state;
		return !!modalTask && <Modal
			open={this.state.showRatingModal}
			aria-labelledby="modal-modal-title"
			aria-describedby="modal-modal-description"
		>
			<Box sx={modalStyle}>
				<Stack spacing={`10px`}>
					{this.renderRatingModalName()}
					{this.renderModalRatingButtons()}
				</Stack>
			</Box>
		</Modal>
	}


	private renderRatingModalName = () => {
		const task = this.state.jobDetail.tasks[0]
		return <Box>
			<Typography variant={`h6`}>
				????nh gi?? c??ng vi???c
			</Typography>
	
			<Stack spacing={`7px`}>
				
				<Typography variant={`body2`} sx={{ fontWeight: 300 }}>
					Annotator: {task.annotator.full_name}
				</Typography>

				<Typography variant={`body2`} sx={{ fontWeight: 300 }}>
					S??? l?????ng ????n v??? d??? li???u: {task.unit_qty}
				</Typography>
				<Typography variant={`body2`} sx={{ fontWeight: 300 }}>
					Tr???ng th??i: {task.is_submitted ? `Ho??n th??nh` : `Ch??a ho??n th??nh`}.&nbsp;
					{task.is_submitted && <span><Link
						onClick={() => this.setState({
							showTaskDetailModal: true,
							modalTask: task,
						})}
					>Chi ti???t</Link></span>}
				</Typography>
				<Typography variant={`body2`} sx={{ fontWeight: 300 }}>
					Ti???n ?????
				</Typography>
				<BorderLinearProgress
					variant={`determinate`}
					value={task.labeled_unit * 100 / task.unit_qty}
				/>
				<Typography variant={`body2`} sx={{ fontWeight: 300 }}>
					???? g??n nh??n {task.labeled_unit}/{task.unit_qty} ????n v??? d??? li???u
				</Typography>
				{task.is_submitted && <Typography variant={`body2`} sx={{ fontWeight: 300 }}>
					????? ch??nh x??c Ground Truth: {task.truth_accuracy}%<br />
					????? ch??nh x??c ki???m tra ch??o: {task.shared_accuracy}%
				</Typography>}

				<Typography variant={`body2`} sx={{ fontWeight: 300 }}>
					H??y cho ch??ng t??i bi???t m???c ????? h??i l??ng c???a b???n v??? Annotator {task.annotator.full_name}
				</Typography>
				<span>
				<Rating
					style={{ fontSize: "2rem" }}
					readOnly
					defaultValue={5}
					precision={0.1}
				/>
				<span style={{ verticalAlign: "top" }}>
					{`5.0`}
				</span>
				</span>
				
				
				<TextField
					className={`tf-normal`}
					id={`tf-username`}
					value={"L??m vi???c nhanh, ch??nh x??c!"}
					label="????nh gi?? chi ti???t"
					variant="outlined"
				/>
			</Stack>
			
			
		</Box>
	}


	private renderUnitsTable = () => {
		return <></>
	}

	private renderModalRatingButtons = () => {
		const { modalTask } = this.state;
		return !!modalTask && <Stack direction={`row-reverse`} spacing={`10px`}>
			<Button
				variant={`outlined`}
				color={`error`}
				onClick={() => {
					this.setState({ showRatingModal: false })
				}}>
				H???y b???
			</Button>
			<Button disabled={!modalTask.is_submitted} variant={`contained`}>
				G???i ????nh gi??
			</Button>
		</Stack>
	}

	private renderModalButtons = () => {
		const { modalTask } = this.state;
		return !!modalTask && <Stack direction={`row-reverse`} spacing={`10px`}>
			<Button
				variant={`outlined`}
				color={`error`}
				onClick={() => {
					this.setState({ showTaskDetailModal: false })
				}}>
				????ng
			</Button>
			<Button disabled={!modalTask.is_submitted} variant={`contained`}>
				Ph?? duy???t
			</Button>
			<Button
				disabled={!modalTask.is_submitted}
				color={`error`} sx={{ color: "white" }}
				variant={`contained`} onClick={() => this.rejectTask(modalTask)}
			>
				T??? ch???i
			</Button>
		</Stack>
	}

	private renderTaskManagement = () => {
		return <Paper sx={{
			display: "inline-block",
			width: "calc(50% - 70px)",
			ml: "20px",
			p: "20px",
			height: "calc(100vh - 64px - 80px)",
			overflowY: "auto",
		}}>
			<Stack direction={"column"} spacing={"20px"}>
				<Typography variant="h5" sx={{ fontWeight: 500 }}>Y??u c???u nh???n vi???c</Typography>
				{this.renderComingTasks()}
				<Typography variant="h5" sx={{ fontWeight: 500 }}>Danh s??ch ph??n c??ng</Typography>
				{this.renderInProgressTasks()}
				<Typography variant="h5" sx={{ fontWeight: 500 }}>Danh s??ch Ground Truth</Typography>
				{this.renderGroundTruths()}
			</Stack>
		</Paper>
	}

	private renderAnnotator = (task: Task, padding: string | number) => {
		return <CardHeader
			sx={{ p: padding, cursor: "pointer", }}
			avatar={<Avatar sx={{ bgcolor: task.annotator.gender == 1 ? "#2196F3" : "#8a25b1" }}>
				{task.annotator.gender == 1 ? <MaleIcon /> : <FemaleIcon />}
			</Avatar>}
			title={task.annotator.full_name}
			subheader={<Typography variant={`body2`} sx={{ fontWeight: 300 }}>
				<Rating
					style={{ fontSize: "1.3rem" }}
					readOnly
					defaultValue={task.annotator.rating}
					precision={0.1}
				/>
				<span style={{ verticalAlign: "top" }}>
					{` (${task.annotator.task_c} l?????t ????nh gi??)`}
				</span>
			</Typography>}
		/>
	}

	private renderAnnotatorToolTip = (task: Task) => {
		return <CustomTooltip
			placement="top-end"
			title={<Box>
				{this.renderAnnotator(task, "20px")}
				<Typography
					sx={{ pl: "20px", pr: "20px", pb: "20px", fontWeight: 300 }}
					variant={`body1`}
				>
					Email: {task.annotator.email} <br />
					S??? ??i???n tho???i: 0987654321 <br />
					Tu???i: {2022 - task.annotator.year_of_birth} <br />
					Tham gia t??? th??ng
					&nbsp;{task.annotator.created_at.split("-")[1]}&nbsp;
					n??m {task.annotator.created_at.split("-")[0]}<br />
					Kinh nghi???m l??m vi???c:<br />
					- S??? l?????ng nh??n ???? g??n:&nbsp;
					{task.annotator.label_c}<br />
					- S??? l?????ng c??ng vi???c ho??n th??nh:&nbsp;
					{task.annotator.task_c}<br />
					- M???c ????? ch??nh x??c tr??n Ground Truth:&nbsp;
					{task.annotator.mean_truth_accuracy}%<br />
					- M???c ????? ch??nh x??c tr??n d??? li???u chung:&nbsp;
					{task.annotator.mean_shared_accuracy}%<br />
				</Typography>
			</Box>}>
			{this.renderAnnotator(task, 0)}
		</CustomTooltip>
	}

	private acceptTask = (task: Task) => {
		const { showTopLoading, hideTopLoading, showSnackBar, } = this.props;
		showTopLoading!();
		taskAPI.accept(task.id).then(res => {
			if (res.status !== 201) {
				showSnackBar!(
					"C?? l???i x???y ra khi ch???p nh???n y??u c???u!",
					10000,
					SnackBarType.Error
				)
			}
		}).catch(err => {
			showSnackBar!(
				"C?? l???i x???y ra khi ch???p nh???n y??u c???u! " + err.message,
				10000,
				SnackBarType.Error
			)
		}).finally(() => {
			hideTopLoading!();
			this.reloadData();
		});
	}

	private rejectTask = (task: Task) => {
		const { showTopLoading, hideTopLoading, showSnackBar, } = this.props;
		showTopLoading!();
		taskAPI.reject(task.id).then(res => {
			if (res.status !== 201) {
				showSnackBar!(
					"C?? l???i x???y ra khi t??? ch???i y??u c???u nh???n vi???c!",
					10000,
					SnackBarType.Error
				)
			}
		}).catch(err => {
			showSnackBar!(
				"C?? l???i x???y ra khi t??? ch???i y??u c???u nh???n vi???c! " + err.message,
				10000,
				SnackBarType.Error
			)
		}).finally(() => {
			hideTopLoading!();
			this.reloadData();
		});
	}

	private renderInProgressTasks = () => {
		const { jobDetail, } = this.state;
		if (!!jobDetail && !!jobDetail.tasks && !!jobDetail.tasks.length) {
			const inProgressTasks = jobDetail.tasks.filter((task: Task) => task.accepted)
			return inProgressTasks.length ?
				<Grid spacing={2} sx={{ overflowY: "auto", flexGrow: 1, }}>
					{inProgressTasks.map((task: Task, taskIdx: number) => {
						return <Card
							key={taskIdx}
							sx={{
								p: 2, ml: 1, mr: 1, mb: 1, mt: 1,
								display: "inline-block", width: "300px", height: "318px" }}
						>
							<Stack direction={`column`} spacing={2}>
								{this.renderAnnotatorToolTip(task)}
								<Stack spacing={`7px`}>
									<Typography variant={`body2`} sx={{ fontWeight: 300 }}>
										S??? l?????ng ????n v??? d??? li???u: {task.unit_qty}
									</Typography>
									<Typography variant={`body2`} sx={{ fontWeight: 300 }}>
										Tr???ng th??i: {task.is_submitted ? `Ho??n th??nh` : `Ch??a ho??n th??nh`}{task.rejected&&` nh??ng b??? t??? ch???i`}.&nbsp;
										{task.is_submitted && !task.rejected && <span><Link
											onClick={() => this.setState({
												showTaskDetailModal: true,
												modalTask: task,
											})}
										>Chi ti???t</Link></span>}
									</Typography>
									{!task.rejected &&<Typography variant={`body2`} sx={{ fontWeight: 300 }}>
										Ti???n ?????
									</Typography>}
									{!task.rejected &&<BorderLinearProgress
										variant={`determinate`}
										value={task.labeled_unit * 100 / task.unit_qty}
									/>}
									{!task.rejected &&<Typography variant={`body2`} sx={{fontWeight: 300}}>
										???? g??n nh??n {task.labeled_unit}/{task.unit_qty} ????n v??? d??? li???u
									</Typography>}
									{task.is_submitted && <Typography variant={`body2`} sx={{ fontWeight: 300 }}>
										????? ch??nh x??c Ground Truth: {task.truth_accuracy}%<br />
										????? ch??nh x??c ki???m tra ch??o: {task.shared_accuracy}%
									</Typography>}
								</Stack>
								{!task.passed && !task.rejected && <Stack direction={`row-reverse`} spacing={2}>
									<Button
										disabled={!task.is_submitted}
										variant={`contained`}
										onClick={() => {
											this.props.showTopLoading!();
											taskAPI.setTaskPassed(task.id).then(res => {
												this.props.showSnackBar!(
													"Ph?? duy???t th??nh c??ng!",
													10000,
													SnackBarType.Success
												);
												this.reloadData();
											}).catch(err => {
												this.props.showSnackBar!(
													"Ph?? duy???t th???t b???i!",
													10000,
													SnackBarType.Error
												);
											}).finally(() => {
												this.props.hideTopLoading!();
											})
										}}
									>
										Ph?? duy???t
									</Button>
									<Button
										disabled={!task.is_submitted}
										color={`error`} sx={{ color: "white" }}
										variant={`contained`} onClick={() => this.rejectTask(task)}
									>
										T??? ch???i
									</Button>
								</Stack>}
								{task.passed && <Typography variant={`body2`} sx={{
									fontWeight: 300, color: "#4CB050"
								}}>
									???? ph?? duy???t
								</Typography>}
								{task.passed && <Button
									variant={`contained`}
									sx={{m: "20px auto 0", display: `block`}}
									onClick={() => this.setState({showRatingModal: true, modalTask: task})}
								>
									????nh gi??
								</Button>}
								{task.rejected && <Typography variant={`body2`} color={`error`} sx={{
									fontWeight: 300
								}}>
									???? xong nh??ng b??? t??? ch???i
								</Typography>}

							</Stack>
						</Card>
					})
					}
				</Grid> : <Typography variant={`body1`} sx={{ fontWeight: 300 }}>
					Hi???n t???i b???n ch??a ch???p thu???n y??u c???u nh???n vi???c n??o, vui l??ng ch???p thu???n ????? b???t ?????u
					c??ng vi???c!
				</Typography>
		} else {
			return <Typography variant={`body1`} sx={{ fontWeight: 300 }}>
				Hi???n t???i ch??a c?? y??u c???u nh???n vi???c n??o, vui l??ng quay l???i sau!
			</Typography>
		}
	}

	private renderComingTasks = () => {
		const { jobDetail, } = this.state;
		if (!!jobDetail && !!jobDetail.tasks && !!jobDetail.tasks.length) {
			const comingTasks = jobDetail.tasks.filter((task: Task) => !task.accepted);
			console.log("hihihi" + comingTasks);
			return comingTasks.length ? <Grid spacing={2} sx={{ overflowY: "auto", flexGrow: 1, }}>
				{comingTasks.map((task: Task, taskIdx: number) => {
					return <Card
						key={taskIdx}
						sx={{ p: 2, ml: 1, mr: 1, mb: 1, mt: 1, display: "inline-block", width: "300px" }}
					>
						<Stack direction={`column`} spacing={2}>
							{this.renderAnnotatorToolTip(task)}
							<Typography variant={`body2`}>
								{task.annotator.task_c ?
									`S??? c??ng vi???c ???? ho??n th??nh: ${task.annotator.task_c}` :
									`Ch??a c?? kinh nghi???m`}<br />
								Mong mu???n nh???n {task.unit_qty} ????n v??? d??? li???u
							</Typography>
							{task.rejected ? <Typography variant={`body2`} color={`error`} sx={{
								fontWeight: 300
							}}> ???? t??? ch???i </Typography> : <Stack direction={`row-reverse`} spacing={2}>
								<Button onClick={() => this.acceptTask(task)} variant={`contained`}>
									Ch???p nh???n
								</Button>
								<Button
									color={`error`} sx={{color: "white"}}
									variant={`contained`} onClick={() => this.rejectTask(task)}
								>
									T??? ch???i
								</Button>
							</Stack>}
						</Stack>
					</Card>
				})
				}
			</Grid> : <Typography variant={`body1`} sx={{ fontWeight: 300 }}>
				Hi???n t???i ch??a c?? y??u c???u ??ang ch??? n??o, vui l??ng quay l???i sau!
			</Typography>
		} else {
			return <Typography variant={`body1`} sx={{ fontWeight: 300 }}>
				Hi???n t???i ch??a c?? y??u c???u nh???n vi???c n??o, vui l??ng quay l???i sau!
			</Typography>
		}
	}

	private renderGroundTruths = () => {
		const { jobDetail, } = this.state;
		return <Grid container spacing={2} sx={{ overflowY: "auto", flexGrow: 1, }}>
			{(!!jobDetail && jobDetail.truth_units) &&
				jobDetail.truth_units.map((truthUnit: any, idx: number) => {
					const firstUnderlineIdx = truthUnit.data.indexOf("_");
					return <Card key={idx}
						sx={{ p: 2, ml: 1, mr: 1, mb: 2, display: "inline-block", minWidth: "280px" }}
					>
						<Stack direction={`column`} spacing={2}>
							<Typography variant={`body1`}>
								T??n file: {truthUnit.data.slice(firstUnderlineIdx + 1)}
							</Typography>
							<ReactAudioPlayer
								style={{ width: "100%" }}
								src={`https://crolab.blob.core.windows.net/mediacrolab/${truthUnit.data}`}
								controls
							/>
							<Typography variant={`body1`}>Nh??n: {truthUnit.label}</Typography>
						</Stack>
					</Card>
				})}
		</Grid>
	}

	private getDoneQty = (job: Job): number => {
		if (job.tasks.length > 0) {
			let returnVal = 0;
			job.tasks.forEach(task => {
				if (task.passed) returnVal += task.unit_qty;
			})
			return returnVal;
		} else return 0;
	}
	private renderJobDetail = () => {
		const { jobDetail, } = this.state;
		const doneQty = this.getDoneQty(jobDetail);
		return <Paper sx={{
			width: "calc(50% - 70px)",
			display: "inline-block",
			p: "20px",
			height: "calc(100vh - 64px - 80px)",
			overflowY: "auto",
		}}>
			<Stack direction={"column"} spacing={"20px"}>
				<Typography variant="h5" sx={{ fontWeight: 500 }}>{jobDetail.name}</Typography>
				<Typography variant="body1" sx={{ fontWeight: 300 }}>{jobDetail.description}</Typography>
				<Stack direction={"column"} spacing={"10px"}>
					<Typography variant="h6">Ti???n ?????</Typography>
					<LinearProgress
						variant="buffer"
						valueBuffer={jobDetail.accepted_qty * 100 / jobDetail.unit_qty}
						value={doneQty * 100 / jobDetail.unit_qty}
					/>
					<Typography variant="body1" sx={{ fontWeight: 300 }}>
						???? g??n nh??n th??nh c??ng {doneQty}/{jobDetail.unit_qty} ????n v??? d??? li???u <br />
						???? ph??n c??ng {jobDetail.accepted_qty}/{jobDetail.unit_qty} ????n v??? d??? li???u
					</Typography>
				</Stack>
				<Typography variant="h6">Th??ng tin chi ti???t</Typography>
				{this.renderPropertyTable()}
			</Stack>
		</Paper>
	}

	private renderPropertyTable = () => {
		const { jobDetail, } = this.state;
		const detailTableProps = [];
		if (!!jobDetail) {
			// TODO: Remove hard codes
			detailTableProps.push(
				{ property: "Requester", value: `${jobDetail.requester.full_name}` },
				{ property: "Deadline", value: `${"10 ng??y"}` },
				{ property: "S??? l?????ng ????n v??? d??? li???u", value: `${jobDetail.unit_qty}` },
				{ property: "S??? l?????ng Ground Truth", value: `${jobDetail.truth_qty}` },
				{ property: "S??? l?????ng d??? li???u chung", value: `${jobDetail.shared_qty}` },
				{ property: "Th??? lo???i", value: `Chuy???n ?????i gi???ng n??i th??nh v??n b???n` },
				{ property: "S??? l?????ng t???i thi???u ????? nh???n vi???c", value: `${jobDetail.accepted_threshold}` },
				{ property: "Ng?????ng t??? ?????ng ch???p nh???n", value: `${jobDetail.accepted_threshold}%` },
				{ property: "Ng?????ng ???????c th?????ng", value: `${jobDetail.bonus_threshold}%` },
				{ property: "L????ng/????n v??? d??? li???u", value: `${jobDetail.unit_wage} VND` },
				{ property: "Th?????ng/????n v??? d??? li???u", value: `${jobDetail.unit_bonus} VND` },
				{ property: "Ng??y ????ng", value: `${jobDetail.created_at}` },
			)
		}
		return <TableContainer component={Paper}>
			<Table aria-label="customized table">
				<TableBody>
					{detailTableProps.map((row: any, index: number) => {
						return <StyledTableRow
							key={index}
							sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
						>
							<StyledTableCell
								sx={{ fontWeight: 500 }}
							>{row.property}</StyledTableCell>
							<StyledTableCell>{row.value}</StyledTableCell>
						</StyledTableRow>
					})}
				</TableBody>
			</Table>
		</TableContainer>
	}
}
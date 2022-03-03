import {Button, Card, Grid, Paper, Stack, TextField, Typography} from "@mui/material";
import React from "react";
import * as generalActions from "../../../redux/general/actions";
import * as snackBarActions from "../../../redux/snackbar/actions";
import {SnackBarType} from "../../../utils/enumerates";
import {connect} from "react-redux";
import jobAPI from "../../../api/jobAPI";
import ReactAudioPlayer from 'react-audio-player';
import {RouteComponentProps} from "react-router-dom";
import history from "../../../history";

const mapDispatcherToProps =
	(dispatch: any): IAnnotateTruthPropsFromDispatch => {
		return {
			showSnackBar: (pMsg: string, pDuration: number, pType: SnackBarType) => dispatch(snackBarActions.showSnackBar(pMsg, pDuration, pType)),
			showTopLoading: () => dispatch(generalActions.showTopLoading()),
			hideTopLoading: () => dispatch(generalActions.hideTopLoading()),
		}
	}

interface IAnnotateTruthPropsFromDispatch {
	showTopLoading?: () => void;
	hideTopLoading?: () => void;
	showSnackBar?: (pMsg: string, pDuration: number, pType: SnackBarType) => void;
}

interface IAnnotateTruthUrlParams {
	jobid?: string;
}

type IAnnotateTruthProps = RouteComponentProps<IAnnotateTruthUrlParams> & IAnnotateTruthPropsFromDispatch;

interface IAnnotateTruthState {
	jobName: string;
	jobRequesterName: string;
	jobCreatedTime: string;
	truthUnits: { id: number; data: string, label: string }[];
	groundTruthLabels: string[];
}


// class AnnotateTruth extends React.Component<IAnnotateTruthProps, IAnnotateTruthState> {

@(connect(null, mapDispatcherToProps) as any)
export default class AnnotateTruth extends React.Component<IAnnotateTruthProps, IAnnotateTruthState> {
	constructor(props: IAnnotateTruthProps) {
		super(props);
		this.state = {
			jobName: "",
			jobRequesterName: "",
			jobCreatedTime: "",
			truthUnits: [],
			groundTruthLabels: []
		}
	}

	componentDidMount() {
		const prjId = parseInt(this.props.match.params.jobid!);
		this.props.showTopLoading!();
		jobAPI.getUnlabeledTruthUnits(prjId).then(res => {
			// TODO: validate
			this.setState({
				jobName: res.data.job.name,
				jobRequesterName: res.data.job.requester.full_name,
				jobCreatedTime: res.data.job.created_at,
				truthUnits: res.data.truth_unit.map((item: any) => {
					return {...item, label: ""}
				}),
				groundTruthLabels: res.data.truth_unit.map((_: any) => ""),
			})
		}).finally(() => this.props.hideTopLoading!())
	}

	render() {
		const {
			jobName,
			truthUnits,
			jobCreatedTime,
			jobRequesterName,
			groundTruthLabels,

		} = this.state;
		const {
			showTopLoading,
			hideTopLoading,
			showSnackBar,
		} = this.props;
		return (
			<Paper sx={{
				width: "calc(100% - 80px)",
				m: "20px auto",
				flexGrow: 1,
				flexDirection: "column",
				display: "flex",
				p: "20px",
			}}>
				<Typography
					variant="h5"
					sx={{fontWeight: 500}}
				>
					Gán nhãn Ground Truth
				</Typography>
				<Typography
					variant="body1"
					sx={{mt: 2}}
				>
					Để bài đăng có thể tiếp cận được tới người gán nhãn, vui lòng cung cấp cho chúng tôi nhãn Ground Truth cho bộ
					dữ liệu của bạn!
				</Typography>
				<Typography
					variant="h6"
					sx={{mt: 2}}
				>
					Thông tin dự án
				</Typography>
				<Typography
					variant="body1"
					sx={{mt: 2}}
				>
					{`Tóm tắt công việc: ${jobName}`} <br></br>
					{`Quản lý công việc: ${jobRequesterName}`}<br></br>
					{`Thời gian đăng: ${jobCreatedTime} `}<br></br>


				</Typography>
				<Typography
					variant="h6"
					sx={{mt: 2}}
				>
					Danh sách Ground Truth
				</Typography>
				<Grid
					spacing={2}
					sx={{
						mt: 2,
						mb: 2,
						overflowY: "auto",
						flexGrow: 1,
						height: "0px",
						// flexDirection: "row",
					}}
				>
					{
						truthUnits.map((truthUnit, idx) => {
							const firstUnderlineIdx = truthUnit.data.indexOf("_");
							return <Card
								sx={{p: 2, ml: 1, mr: 1, mb: 2, display: "inline-block", width: "max-content"}}
							>
								<Stack sx={{width: "400px"}} direction={`column`} spacing={2}>
									<Typography
										variant={`body1`}
									>
										Tên file: {truthUnit.data.slice(firstUnderlineIdx + 1)}
									</Typography>
									<ReactAudioPlayer
										style={{width: "100%"}}
										src={`https://crolab.blob.core.windows.net/mediacrolab/${truthUnit.data}`}
										controls
									/>
									<TextField
										required
										label={`Nhãn Ground Truth`}
										variant="outlined"
										value={groundTruthLabels[idx]}
										onChange={(newVal) => this.setState({
											groundTruthLabels: groundTruthLabels.map(
												(label: string, labelIdx: number) => {
													if(labelIdx !== idx) return label;
													else return newVal.target.value as string;
												})
										})}
									/>

								</Stack>
							</Card>
						})
					}
				</Grid>
				<Button
					onClick={()=> {
						showTopLoading!();
						jobAPI.reqAnnotateTruthUnits(
							parseInt(this.props.match.params.jobid!),
							truthUnits.map((unit: any, idx: number) => {
								return {
									id: unit.id,
									label: groundTruthLabels[idx]
								}
							})
						).then(r => {
							if (r.status === 201 && r.data && r.data.truth_qty_ready) {
								showSnackBar!(
									"Lưu dữ liệu Ground Truth thành công",
									10000,
									SnackBarType.Success
								)
								history.push("/requester/jobmanagement")
							} else {
								showSnackBar!(
									"Lưu dữ liệu Ground Truth thất bại",
									10000,
									SnackBarType.Error
								)
							}
						}).catch(()=>showSnackBar!(
							"Lưu dữ liệu Ground Truth thất bại",
							10000,
							SnackBarType.Error
						)).finally(()=>hideTopLoading!())
					}}
					sx={{width: "max-content"}}
					variant="contained"
				>
					Lưu Ground Truth
				</Button>
			</Paper>
		)
	}
}
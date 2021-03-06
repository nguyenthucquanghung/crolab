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
					G??n nh??n Ground Truth
				</Typography>
				<Typography
					variant="body1"
					sx={{mt: 2}}
				>
					????? b??i ????ng c?? th??? ti???p c???n ???????c t???i ng?????i g??n nh??n, vui l??ng cung c???p cho ch??ng t??i nh??n Ground Truth cho b???
					d??? li???u c???a b???n!
				</Typography>
				<Typography
					variant="h6"
					sx={{mt: 2}}
				>
					Th??ng tin d??? ??n
				</Typography>
				<Typography
					variant="body1"
					sx={{mt: 2}}
				>
					{`T??m t???t c??ng vi???c: ${jobName}`} <br></br>
					{`Qu???n l?? c??ng vi???c: ${jobRequesterName}`}<br></br>
					{`Th???i gian ????ng: ${jobCreatedTime} `}<br></br>


				</Typography>
				<Typography
					variant="h6"
					sx={{mt: 2}}
				>
					Danh s??ch Ground Truth
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
										T??n file: {truthUnit.data.slice(firstUnderlineIdx + 1)}
									</Typography>
									<ReactAudioPlayer
										style={{width: "100%"}}
										src={`https://crolab.blob.core.windows.net/mediacrolab/${truthUnit.data}`}
										controls
									/>
									<TextField
										required
										label={`Nh??n Ground Truth`}
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
									"L??u d??? li???u Ground Truth th??nh c??ng",
									10000,
									SnackBarType.Success
								)
								history.push("/requester/jobmanagement")
							} else {
								showSnackBar!(
									"L??u d??? li???u Ground Truth th???t b???i",
									10000,
									SnackBarType.Error
								)
							}
						}).catch(()=>showSnackBar!(
							"L??u d??? li???u Ground Truth th???t b???i",
							10000,
							SnackBarType.Error
						)).finally(()=>hideTopLoading!())
					}}
					sx={{width: "max-content"}}
					variant="contained"
				>
					L??u Ground Truth
				</Button>
			</Paper>
		)
	}
}
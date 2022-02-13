import { Box, Button, FormControl, FormControlLabel, Grid, InputAdornment, InputLabel, MenuItem, Paper, Select, SelectChangeEvent, Stack, Switch, TextField, Typography } from "@mui/material";
import React from "react";
import "./index.scss"
import * as generalActions from "../../../redux/general/actions";
import * as snackBarActions from "../../../redux/snackbar/actions";
import { CategoryType, SnackBarType } from "../../../utils/enumerates";
import { connect } from "react-redux";
import jobAPI from "../../../api/jobAPI";
import history from "../../../history";

const mapDispatcherToProps =
	(dispatch: any): ICreateJobPropsFromDispatch => {
		return {
			showSnackBar: (pMsg: string, pDuration: number, pType: SnackBarType) => dispatch(snackBarActions.showSnackBar(pMsg, pDuration, pType)),
			showTopLoading: () => dispatch(generalActions.showTopLoading()),
			hideTopLoading: () => dispatch(generalActions.hideTopLoading()),
		}
	}

interface ICreateJobPropsFromDispatch {
	showTopLoading?: () => void;
	hideTopLoading?: () => void;
	showSnackBar?: (pMsg: string, pDuration: number, pType: SnackBarType) => void;
}

type ICreateJobProps = ICreateJobPropsFromDispatch;
interface ICreateJobState {
	jobName: string;
	jobDesc: string;
	pickedFiles: any;
	pickedFileCount: number;
	category: CategoryType;
	truthQty: number;
	sharedQty: number;
	minQty: number;
	unitWage: number;
	unitBonus: number;
	enableBonus: boolean;
	acceptThreshold: number;
	bonusThreshold: number;
}

@(connect(null, mapDispatcherToProps) as any)
export default class CreateJob extends React.Component<ICreateJobProps, ICreateJobState> {
	constructor(props: ICreateJobProps) {
		super(props);
		this.state = {
			jobName: "",
			jobDesc: "",
			pickedFiles: undefined,
			pickedFileCount: 0,
			category: CategoryType.SpeechToText,
			truthQty: 10,
			sharedQty: 10,
			minQty: 100,
			unitWage: 100,
			unitBonus: 10,
			enableBonus: false,
			acceptThreshold: 80,
			bonusThreshold: 90,
		}
	}
	render() {
		const {
			jobName,
			jobDesc,
			pickedFiles,
			pickedFileCount,
			category,
			truthQty,
			sharedQty,
			minQty,
			unitWage,
			unitBonus,
			enableBonus,
			acceptThreshold,
			bonusThreshold,
		} = this.state;
		return (
			<Paper className={`createjob-container`}>
				<Stack spacing={2} >
					<Typography
						variant="h6"
						component="div"
					>
						Tạo dự án
					</Typography>
					<TextField
						fullWidth
						className={`tf-job-name tf`}
						required
						id={`tf-job-name`}
						label="Tóm tắt dự án"
						variant="outlined"
						value={jobName}
						onChange={(newVal) => this.setState({ jobName: newVal.target.value })}
					/>
					<TextField
						multiline
						rows={3}
						fullWidth
						className={`tf-desc tf`}
						id={`tf-desc`}
						label="Mô tả chi tiết"
						variant="outlined"
						value={jobDesc}
						onChange={(newVal) => this.setState({ jobDesc: newVal.target.value })}
					/>
					<Grid container spacing={0}>
						<Grid item sx={{ mr: 2, mt: 2 }}>
							<FormControl sx={{ width: "320px" }}>
								<InputLabel id="select-category-label">Bài toán</InputLabel>
								<Select
									labelId="select-category"
									id="select-category"
									value={category.toString()}
									label="Bài toán"
									onChange={this.onCategoryChanged}
								>
									<MenuItem value={CategoryType.SpeechToText.toString()}>
										Chuyển đổi giọng nói thành văn bản
									</MenuItem>
									<MenuItem value={CategoryType.DocumentClassification.toString()}>
										Phân loại văn bản
									</MenuItem>
								</Select>
							</FormControl>
						</Grid>

						<Grid item sx={{ mr: 2, mt: 2 }}>
							<FormControl sx={{ width: "160px" }}>
								<InputLabel id="select-truth-qty-label">
									Số lượng Ground Truth
								</InputLabel>
								<Select
									labelId="select-truth-qty"
									id="select-truth-qty"
									value={truthQty}
									label="Số lượng Ground Truth"
									onChange={this.onTruthQtyChanged}
								>
									<MenuItem value={2}> 2 </MenuItem>
									<MenuItem value={10}> 10 </MenuItem>
									<MenuItem value={20}> 20 </MenuItem>
								</Select>
							</FormControl>
						</Grid>

						<Grid item sx={{ mr: 2, mt: 2 }}>
							<FormControl sx={{ width: "160px" }}>
								<InputLabel id="select-shared-qty-label">
									Số lượng kiểm tra chéo
								</InputLabel>
								<Select
									labelId="select-shared-qty"
									id="select-shared-qty"
									value={sharedQty}
									label="Số lượng kiểm tra chéo"
									onChange={this.onSharedQtyChanged}
								>
									<MenuItem value={2}> 2 </MenuItem>
									<MenuItem value={10}> 10 </MenuItem>
									<MenuItem value={20}> 20 </MenuItem>
								</Select>
							</FormControl>
						</Grid>

						<Grid item sx={{ mr: 2, mt: 2 }}>
							<FormControl sx={{ width: "140px" }}>
								<InputLabel id="select-min-qty-label">
									Phân công tối thiểu
								</InputLabel>
								<Select
									labelId="select-min-qty"
									id="select-min-qty"
									value={minQty}
									label="Phân công tối thiểu"
									onChange={this.onMinQtyChanged}
								>
									<MenuItem value={10}> 10 </MenuItem>
									<MenuItem value={100}> 100 </MenuItem>
									<MenuItem value={200}> 200 </MenuItem>
								</Select>
							</FormControl>
						</Grid>

						<Grid item sx={{ mr: 2, mt: 2 }}>
							<FormControl sx={{ width: "170px" }}>
								<InputLabel id="select-accept-threshold-label">
									Độ chính xác tối thiểu (%)
								</InputLabel>
								<Select
									labelId="select-accept-threshold"
									id="select-accept-threshold"
									value={acceptThreshold}
									label="Độ chính xác tối thiểu (%)"
									onChange={this.onAcceptThresholdChanged}
								>
									<MenuItem value={60}> 60 </MenuItem>
									<MenuItem value={70}> 70 </MenuItem>
									<MenuItem value={80}> 80 </MenuItem>
								</Select>
							</FormControl>
						</Grid>

						<Grid item sx={{ mr: 2, mt: 2 }}>
							<TextField
								sx={{ width: "210px" }}
								required
								id={`tf-unit-wage`}
								label="Lương (Trên một đơn vị dữ liệu)"
								variant="outlined"
								type="number"
								value={unitWage}
								onChange={this.onUnitWageChanged}
								InputProps={{
									startAdornment: <InputAdornment position="start">VND</InputAdornment>,
								}}
							/>
						</Grid>
					</Grid>

					<FormControlLabel
						sx={{ width: "max-content" }}
						control={<Switch
							checked={enableBonus}
							onChange={this.onEnableBonusChanged}
							inputProps={{ 'aria-label': 'controlled' }}
						/>}
						label="Thưởng theo năng lực"
					/>

					{enableBonus && <Grid container spacing={0}>

						<Grid item sx={{ mr: 2, mb: 2 }}>
							<FormControl sx={{ width: "250px" }}>
								<InputLabel id="select-bonus-threshold-label">
									Ngưỡng độ chính xác được thưởng (%)
								</InputLabel>
								<Select
									labelId="select-bonus-threshold"
									id="select-bonus-threshold"
									value={bonusThreshold}
									label="Ngưỡng độ chính xác được thưởng (%)"
									onChange={this.onBonusThresholdChanged}
								>
									<MenuItem value={70}> 70 </MenuItem>
									<MenuItem value={80}> 80 </MenuItem>
									<MenuItem value={90}> 90 </MenuItem>
								</Select>
							</FormControl>
						</Grid>

						<Grid item sx={{ mr: 2, mb: 2 }}>
							<TextField
								sx={{ width: "220px" }}
								required
								id={`tf-bonus-wage`}
								label="Thưởng (Trên một đơn vị dữ liệu)"
								variant="outlined"
								type="number"
								value={unitBonus}
								onChange={this.onUnitBonusChanged}
								InputProps={{
									startAdornment: <InputAdornment position="start">VND</InputAdornment>,
								}}
							/>
						</Grid>

					</Grid>}

					<Box className={`div-upload`} sx={{}}>
						<label htmlFor="input-upload">
							<input
								multiple
								accept=".wav"
								id="input-upload"
								name="input-upload"
								style={{ display: 'none' }}
								type="file"
								onChange={this.onUploadFileChanged}
							/>
							<Button
								className={`bt-upload`}
								variant="contained"
								component="span"
								color="secondary"
							>
								Tải lên dữ liệu
							</Button>
						</label>
						<Paper className={`pp-status`}>
							{
								(pickedFileCount > 0) ?
									`${pickedFileCount} tệp tin được chọn` : "Chưa có dữ liệu"
							}
						</Paper>
					</Box>
					<Box sx={{ flexGrow: 10 }} />
					<Stack direction="row">
						<Button
							sx={{ mt: 2, mr: 2, color: "white" }}
							variant="contained"
							color="success"
							onClick={()=> {
								history.push("/requester/jobmanagement")
							}}
						>
							Quay lại
						</Button>
						<Button
							sx={{ mt: 2 }}
							className={`bt-create`}
							variant="contained"
							onClick={() => {
								// TODO: validation
								if (pickedFiles.length > 0) {
									this.props.showTopLoading!();
									jobAPI.createJob(
										jobName,
										jobDesc,
										category,
										truthQty,
										sharedQty,
										minQty,
										unitWage,
										unitBonus,
										acceptThreshold,
										bonusThreshold,
										pickedFiles
									).then((res: any) => {
										console.log(res)
										if (res.status === 201) {
											history.push("/");
											this.props.showSnackBar!(
												"Khởi tạo dự án thành công!",
												10000,
												SnackBarType.Success
											);
										} else {
											this.props.showSnackBar!(
												"Khởi tạo dự án thất bại! " + res.data.message,
												10000,
												SnackBarType.Error
											);
										}
									}).catch((err: any) => {
										console.log(err)
										this.props.showSnackBar!(
											"Khởi tạo dự án thất bại! ",
											10000,
											SnackBarType.Error
										);
									}).finally(() => this.props.hideTopLoading!())
								}
							}}
						>
							Tạo dự án
						</Button>
					</Stack>

				</Stack>
			</Paper >
		)
	}

	private onCategoryChanged = (ev: any) => {
		this.setState({ category: ev.target.value as CategoryType })
	}

	private onTruthQtyChanged = (ev: any) => {
		this.setState({ truthQty: ev.target.value as number })
	}

	private onSharedQtyChanged = (ev: any) => {
		this.setState({ sharedQty: ev.target.value as number })
	}

	private onMinQtyChanged = (ev: any) => {
		this.setState({ minQty: ev.target.value as number })
	}

	private onUnitWageChanged = (ev: any) => {
		this.setState({ unitWage: ev.target.value as number })
	}

	private onUnitBonusChanged = (ev: any) => {
		this.setState({ unitBonus: ev.target.value as number })
	}

	private onAcceptThresholdChanged = (ev: any) => {
		this.setState({ acceptThreshold: ev.target.value as number })
	}

	private onEnableBonusChanged = (ev: any) => {
		this.setState({ enableBonus: ev.target.checked })
	}

	private onBonusThresholdChanged = (ev: any) => {
		this.setState({ bonusThreshold: ev.target.value as number })
	}

	private onUploadFileChanged = (ev: any) => {
		if (
			ev &&
			ev.target &&
			ev.target.files &&
			ev.target.files.length > 0
		) {
			this.setState({
				pickedFiles: ev.target.files,
				pickedFileCount: ev.target.files.length
			});
		}
	}
}

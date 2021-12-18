import { Button, Paper, TextField, Typography } from "@mui/material";
import React from "react";
import "./index.scss"
import * as generalActions from "../../../redux/general/actions";
import * as snackBarActions from "../../../redux/snackbar/actions";
import { SnackBarType } from "../../../utils/enumerates";
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
    jobK: string;
    jobB1: string;
    jobEsId: string;
    jobSeqHL: string;
    jobMinTabRowHL: string;
    jobMaxTabRowHL: string;
    jobEsIdErrMsg: string;
    jobNameErrMsg: string;
    pickedFile: any;
    pickedFileName: string;
}

class CreateJob extends React.Component<ICreateJobProps, ICreateJobState> {
    constructor(props: ICreateJobProps) {
        super(props);
        this.state = {
            jobName: "",
            jobDesc: "",
            jobK: "",
            jobB1: "",
            jobEsId: "",
            jobSeqHL: "",
            jobMinTabRowHL: "",
            jobMaxTabRowHL: "",
            jobNameErrMsg: "",
            jobEsIdErrMsg: "",
            pickedFile: undefined,
            pickedFileName: "",
        }
    }
    render() {
        const {
            jobName,
            jobDesc,
            jobK,
            jobB1,
            jobEsId,
            jobSeqHL,
            jobMinTabRowHL,
            jobMaxTabRowHL,
            jobEsIdErrMsg,
            jobNameErrMsg,
            pickedFile,
            pickedFileName,
        } = this.state;
        return (
            <div className={`createjob-container`}>
                <Typography
                    variant="h3"
                    component="div"
                    sx={{
                        m: "60px",
                        flexGrow: 1,
                        fontStyle: "bold"
                    }}
                >
                    Tạo dự án
                </Typography>
                <TextField
                    className={`tf-job-name tf`}
                    required
                    id={`tf-job-name`}
                    label="Tên dự án"
                    variant="outlined"
                    value={jobName}
                    onChange={(newVal) => this.setState({ jobName: newVal.target.value })}
                    error={!!jobNameErrMsg}
                    helperText={jobNameErrMsg}
                />
                <TextField
                    multiline
                    className={`tf-desc tf`}
                    id={`tf-desc`}
                    label="Mô tả chi tiết"
                    variant="outlined"
                    value={jobDesc}
                    onChange={(newVal) => this.setState({ jobDesc: newVal.target.value })}
                />
                <div className={`div-upload`}>

                    <label htmlFor="input-upload">
                        <input
                            accept=".json"
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
                        >
                            Tải lên dữ liệu
                        </Button>

                    </label>

                    <Paper className={`pp-status`}>
                        {
                            (pickedFile && !!pickedFileName) ?
                                pickedFileName : "Chưa có dữ liệu"
                        }
                    </Paper>
                </div>
                <TextField
                    type="number"
                    required
                    className={`tf-b1 tf`}
                    id={`tf-b1`}
                    label="Tham số b1"
                    variant="outlined"
                    value={jobB1}
                    onChange={(newVal) => this.setState({ jobB1: newVal.target.value })}
                />
                <TextField
                    required
                    className={`tf-k tf`}
                    type="number"
                    id={`tf-k`}
                    label="Tham số k"
                    variant="outlined"
                    value={jobK}
                    onChange={(newVal) => this.setState({ jobK: newVal.target.value })}
                />
                <TextField
                    required
                    className={`tf-es-id tf`}
                    id={`tf-es-id`}
                    label="Elasticsearch Index"
                    variant="outlined"
                    value={jobEsId}
                    error={!!jobEsIdErrMsg}
                    helperText={jobEsIdErrMsg}
                    onChange={(newVal) => this.setState({ jobEsId: newVal.target.value })}
                />
                <TextField
                    required
                    className={`tf-highlighted-sentence tf`}
                    id={`tf-highlighted-sentence`}
                    type="number"
                    label="Số lượng câu được đánh dấu"
                    variant="outlined"
                    onChange={(newVal) => this.setState({ jobSeqHL: newVal.target.value })}
                    value={jobSeqHL}
                />
                <TextField
                    required
                    className={`tf-highlighted-table tf`}
                    id={`tf-highlighted-table`}
                    type="number"
                    label="Số lượng hàng tối thiểu trong bảng được đánh dấu"
                    value={jobMinTabRowHL}
                    variant="outlined"
                    onChange={(newVal) => this.setState({ jobMinTabRowHL: newVal.target.value })}
                />
                <TextField
                    required
                    className={`tf-highlighted-table tf`}
                    id={`tf-highlighted-table`}
                    type="number"
                    label="Số lượng hàng tối đa trong bảng được đánh dấu"
                    value={jobMaxTabRowHL}
                    variant="outlined"
                    onChange={(newVal) => this.setState({ jobMaxTabRowHL: newVal.target.value })}
                />
                <Button
                    className={`bt-create`}
                    variant="contained"
                    onClick={() => {
                        //TODO: validation
                        this.props.showTopLoading!();
                        jobAPI.createJob(
                            jobName,
                            jobDesc,
                            jobK,
                            jobB1,
                            jobSeqHL,
                            jobMinTabRowHL,
                            jobMaxTabRowHL,
                            jobEsId,
                            pickedFile
                        ).then((res: any) => {
                            console.log(res)
                            if (res.status === 201) {
                                history.push("/");
                                this.props.showSnackBar!("Khởi tạo dự án thành công!", 10000, SnackBarType.Success);
                            } else {
                                this.props.showSnackBar!("Khởi tạo dự án thất bại! " + res.data.message, 10000, SnackBarType.Error);
                            }
                        }).catch((err: any) => {
                            console.log(err)
                            if (!!err.errors && err.errors.es_id && Array.isArray(err.errors.es_id)) {
                                this.setState({ jobEsIdErrMsg: err.errors.es_id[0] });
                            }
                            if (!!err.errors && err.errors.name && Array.isArray(err.errors.es_id)) {
                                this.setState({ jobNameErrMsg: err.errors.name[0] });
                            }
                            this.props.showSnackBar!("Khởi tạo dự án thất bại! ", 10000, SnackBarType.Error);
                        }).finally(() => this.props.hideTopLoading!())
                    }}
                >
                    Tạo dự án
                </Button>

            </div>
        )
    }
    private onUploadFileChanged = (ev: any) => {
        if (
            ev &&
            ev.target &&
            ev.target.files &&
            ev.target.files.length > 0 &&
            ev.target.files[0].name.includes(".json")
        ) {
            this.setState({
                pickedFile: ev.target.files[0],
                pickedFileName: ev.target.files[0].name
            });
        } else {
            this.props.showSnackBar!("Tải lên tệp tin JSON thất bại. Vui lòng kiểm tra lại định dạng tệp tin.", 10000, SnackBarType.Error);
        }
    }
}

export default connect(null, mapDispatcherToProps)(CreateJob);
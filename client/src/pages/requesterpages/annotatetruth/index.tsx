import { Box, Button, FormControl, FormControlLabel, Grid, InputAdornment, InputLabel, MenuItem, Paper, Select, SelectChangeEvent, Stack, Switch, TextField, Typography } from "@mui/material";
import React from "react";
import * as generalActions from "../../../redux/general/actions";
import * as snackBarActions from "../../../redux/snackbar/actions";
import { CategoryType, SnackBarType } from "../../../utils/enumerates";
import { connect } from "react-redux";
import jobAPI from "../../../api/jobAPI";
import history from "../../../history";
import ReactAudioPlayer from 'react-audio-player';
import { RouteComponentProps } from "react-router-dom";

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
}

class AnnotateTruth extends React.Component<IAnnotateTruthProps, IAnnotateTruthState> {
  constructor(props: IAnnotateTruthProps) {
    super(props);
    this.state = {
      jobName: "",
      jobRequesterName: "",
      jobCreatedTime: "",
      truthUnits: [],
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
          return { ...item, label: "" }
        }),
      })
    }).finally(() => this.props.hideTopLoading!())
  }
  render() {
    const { jobName, truthUnits, jobCreatedTime, jobRequesterName } = this.state;
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
          sx={{ fontWeight: 500 }}
        >
          Gán nhãn Ground Truth
        </Typography>
        <Typography
          variant="body1"
          sx={{ mt: 2 }}
        >
          Để bài đăng có thể tiếp cận được tới người gán nhãn, vui lòng cung cấp cho chúng tôi nhãn Ground Truth cho bộ dữ liệu của bạn!
        </Typography>
        <Typography
          variant="h6"
          sx={{ mt: 2 }}
        >
          Thông tin dự án
        </Typography>
        <Typography
          variant="body1"
          sx={{ mt: 2 }}
        >
          {`Tóm tắt công việc: ${jobName}`} <br></br>
          {`Quản lý công việc: ${jobRequesterName}`}<br></br>
          {`Thời gian đăng: ${jobCreatedTime} `}<br></br>


        </Typography>
        <Typography
          variant="h6"
          sx={{ mt: 2 }}
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
            truthUnits.map((truthUnit) => {
              return <Stack sx={{ display: "inline-block", width: "max-content" }} direction={"column"} spacing={2}>
                <TextField />
                <ReactAudioPlayer
                  src={`https://crolab.blob.core.windows.net/media/${truthUnit.data}`}
                  controls
                />
              </Stack>
            })
          }
        </Grid>
        <Button
          variant="contained"
        >
          hehehe
        </Button>
      </Paper >
    )
  }
}
export default connect(null, mapDispatcherToProps)(AnnotateTruth);